"""
API routes blueprint for REST endpoints
Handles all API routes (/api/*)
"""

from flask import Blueprint, jsonify, request, current_app
from services.youtube_service import get_youtube_service
from services.spotify_service import get_spotify_service
from services.updates_service import get_updates
from services.exceptions import (
    YouTubeServiceError,
    SpotifyServiceError,
    UpdatesServiceError,
)

api_bp = Blueprint("api", __name__, url_prefix="/api")


# Error handlers for service exceptions
@api_bp.errorhandler(YouTubeServiceError)
def handle_youtube_error(e):
    return jsonify({"error": "YouTube service unavailable", "message": str(e)}), 503


@api_bp.errorhandler(SpotifyServiceError)
def handle_spotify_error(e):
    return jsonify({"error": "Spotify service unavailable", "message": str(e)}), 503


@api_bp.errorhandler(UpdatesServiceError)
def handle_updates_error(e):
    return jsonify({"error": "Updates service unavailable", "message": str(e)}), 503


@api_bp.route("/playlists")
def api_playlists():
    """API geral para playlists com filtros opcionais"""
    try:
        platform = request.args.get("platform", "").lower()
        search_query = request.args.get("q", "")

        # Validate max_results parameter
        try:
            max_results = min(int(request.args.get("max_results", 50)), 100)
            if max_results < 1:
                max_results = 50
        except (ValueError, TypeError):
            max_results = 50

        if platform == "youtube" or not platform:
            youtube_service = get_youtube_service()

            if search_query:
                playlists = youtube_service.search_playlists(search_query, max_results)
            else:
                playlists = youtube_service.get_channel_playlists(max_results)

            return jsonify(
                {
                    "playlists": playlists,
                    "total": len(playlists),
                    "platform": "youtube",
                }
            )
        elif platform == "spotify":
            spotify_service = get_spotify_service()

            if search_query:
                albums = spotify_service.search_albums(search_query, max_results)
            else:
                albums = spotify_service.get_artist_albums(max_results)

            return jsonify(
                {
                    "playlists": albums,  # Manter compatibilidade com frontend
                    "total": len(albums),
                    "platform": "spotify",
                }
            )
        else:
            return jsonify({"playlists": [], "total": 0, "platform": platform})

    except Exception as e:
        current_app.logger.error(f"Error in playlists API: {e}")
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/playlists/youtube")
def api_youtube_playlists():
    """API específica para playlists do YouTube com tratamento de erros robusto"""
    try:
        search_query = request.args.get("q", "")

        # Validate max_results parameter
        try:
            max_results = min(int(request.args.get("max_results", 50)), 100)
            if max_results < 1:
                max_results = 50
        except (ValueError, TypeError):
            max_results = 50

        youtube_service = get_youtube_service()

        if search_query:
            playlists = youtube_service.search_playlists(search_query, max_results)
        else:
            playlists = youtube_service.get_channel_playlists(max_results)

        return jsonify(
            {"playlists": playlists, "total": len(playlists), "platform": "youtube"}
        )

    except YouTubeServiceError as e:
        current_app.logger.error(f"YouTube service error: {e}")
        return (
            jsonify({"error": "Failed to fetch YouTube data", "details": str(e)}),
            503,
        )
    except Exception as e:
        current_app.logger.error(f"Unexpected error in YouTube API: {e}")
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/playlists/spotify")
def api_spotify_playlists():
    """API específica para álbuns do Spotify (artista iamshiuba)"""
    try:
        search_query = request.args.get("q", "")

        # Validate max_results parameter
        try:
            max_results = min(int(request.args.get("max_results", 50)), 100)
            if max_results < 1:
                max_results = 50
        except (ValueError, TypeError):
            max_results = 50

        spotify_service = get_spotify_service()

        if search_query:
            albums = spotify_service.search_albums(search_query, max_results)
        else:
            albums = spotify_service.get_artist_albums(max_results)

        return jsonify(
            {
                "playlists": albums,
                "total": len(albums),
                "platform": "spotify",
            }
        )

    except SpotifyServiceError as e:
        current_app.logger.error(f"Spotify service error: {e}")
        return (
            jsonify({"error": "Failed to fetch Spotify data", "details": str(e)}),
            503,
        )
    except Exception as e:
        current_app.logger.error(f"Unexpected error in Spotify API: {e}")
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/playlists/youtube/<playlist_id>")
def api_youtube_playlist_details(playlist_id):
    """API para detalhes específicos de uma playlist do YouTube"""
    try:
        youtube_service = get_youtube_service()
        playlist = youtube_service.get_playlist_details(playlist_id)

        if playlist:
            return jsonify({"playlist": playlist})
        else:
            return jsonify({"error": "Playlist não encontrada"}), 404

    except YouTubeServiceError as e:
        current_app.logger.error(f"Error fetching playlist details {playlist_id}: {e}")
        return (
            jsonify({"error": "Failed to fetch playlist details", "details": str(e)}),
            503,
        )
    except Exception as e:
        current_app.logger.error(
            f"Unexpected error fetching playlist {playlist_id}: {e}"
        )
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/playlists/spotify/<album_id>")
def api_spotify_album_details(album_id):
    """API para detalhes específicos de um álbum do Spotify"""
    try:
        spotify_service = get_spotify_service()
        album = spotify_service.get_album_details(album_id)

        if album:
            return jsonify({"playlist": album})  # Manter compatibilidade com frontend
        else:
            return jsonify({"error": "Álbum não encontrado"}), 404

    except SpotifyServiceError as e:
        current_app.logger.error(f"Error fetching album details {album_id}: {e}")
        return (
            jsonify({"error": "Failed to fetch album details", "details": str(e)}),
            503,
        )
    except Exception as e:
        current_app.logger.error(f"Unexpected error fetching album {album_id}: {e}")
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/stats/spotify")
def api_spotify_stats():
    """API para estatísticas do artista no Spotify"""
    try:
        spotify_service = get_spotify_service()
        albums = spotify_service.get_artist_albums(max_results=100)

        # Calcular número total de faixas
        total_tracks = sum(album.get("video_count", 0) for album in albums)

        return jsonify({"total_tracks": total_tracks, "total_albums": len(albums)})
    except SpotifyServiceError as e:
        current_app.logger.error(f"Spotify stats service error: {e}")
        return (
            jsonify({"error": "Failed to fetch Spotify stats", "details": str(e)}),
            503,
        )
    except Exception as e:
        current_app.logger.error(f"Unexpected error fetching Spotify stats: {e}")
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/stats/youtube")
def api_youtube_stats():
    """API para estatísticas do canal do YouTube"""
    try:
        youtube_service = get_youtube_service()
        stats = youtube_service.get_channel_statistics()

        if stats:
            return jsonify(
                {
                    "view_count": stats["view_count"],
                    "subscriber_count": stats["subscriber_count"],
                    "video_count": stats["video_count"],
                    "channel_title": stats["channel_title"],
                    "subscriber_count_hidden": stats["subscriber_count_hidden"],
                }
            )
        else:
            return (
                jsonify({"error": "Não foi possível carregar estatísticas do YouTube"}),
                500,
            )

    except YouTubeServiceError as e:
        current_app.logger.error(f"YouTube stats service error: {e}")
        return (
            jsonify({"error": "Failed to fetch YouTube stats", "details": str(e)}),
            503,
        )
    except Exception as e:
        current_app.logger.error(f"Unexpected error fetching YouTube stats: {e}")
        return jsonify({"error": "Internal server error"}), 500


@api_bp.route("/updates")
def api_updates():
    """API para updates com cache-busting e tratamento de erros"""
    try:
        updates = get_updates()

        # Add cache-control headers
        response = jsonify({"updates": updates})
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

        return response

    except UpdatesServiceError as e:
        current_app.logger.error(f"Updates service error: {e}")
        return jsonify({"error": "Failed to load updates", "updates": []}), 503
    except Exception as e:
        current_app.logger.error(f"Unexpected error loading updates: {e}")
        return jsonify({"error": "Internal server error", "updates": []}), 500
