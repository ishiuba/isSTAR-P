"""
API views for YouTube and Spotify playlists
"""

import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .youtube_service import get_youtube_service
from .spotify_service import get_spotify_service
from .updates_service import get_updates, UpdatesServiceError
from .exceptions import (
    YouTubeServiceError,
    SpotifyServiceError,
    UpdatesServiceError,
)

logger = logging.getLogger(__name__)

def _resolve_max_results(request, default=50, upper_bound=100):
    try:
        max_results = int(request.GET.get("max_results", default))
        if max_results < 1:
            return default
        return min(max_results, upper_bound)
    except (TypeError, ValueError):
        return default


class PlaylistsView(APIView):
    def get(self, request):
        platform = request.GET.get("platform", "").lower()
        search_query = request.GET.get("q", "").strip()
        max_results = _resolve_max_results(request)

        try:
            if not platform or platform == "youtube":
                youtube_service = get_youtube_service()
                if search_query:
                    playlists = youtube_service.search_playlists(search_query, max_results)
                else:
                    playlists = youtube_service.get_channel_playlists(max_results)
                return Response(
                    {"playlists": playlists, "total": len(playlists), "platform": "youtube"}
                )

            if platform == "spotify":
                spotify_service = get_spotify_service()
                if search_query:
                    albums = spotify_service.search_albums(search_query, max_results)
                else:
                    albums = spotify_service.get_artist_albums(max_results)
                return Response(
                    {"playlists": albums, "total": len(albums), "platform": "spotify"}
                )

            return Response({"playlists": [], "total": 0, "platform": platform})
        except (YouTubeServiceError, SpotifyServiceError) as service_err:
            logger.exception("Service error in playlists endpoint")
            return Response({"error": str(service_err)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            logger.exception("Unexpected error in playlists endpoint")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class YouTubePlaylistsView(APIView):
    def get(self, request):
        search_query = request.GET.get("q", "").strip()
        max_results = _resolve_max_results(request)
        try:
            youtube_service = get_youtube_service()
            if search_query:
                playlists = youtube_service.search_playlists(search_query, max_results)
            else:
                playlists = youtube_service.get_channel_playlists(max_results)
            return Response(
                {"playlists": playlists, "total": len(playlists), "platform": "youtube"}
            )
        except YouTubeServiceError as exc:
            logger.exception("YouTube service error")
            return Response(
                {"error": "Failed to fetch YouTube data", "details": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception:
            logger.exception("Unexpected YouTube playlists error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class YouTubePlaylistDetailView(APIView):
    def get(self, request, playlist_id: str):
        try:
            youtube_service = get_youtube_service()
            playlist = youtube_service.get_playlist_details(playlist_id)
            if playlist:
                return Response({"playlist": playlist})
            return Response({"error": "Playlist não encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except YouTubeServiceError as exc:
            logger.exception("YouTube playlist detail error")
            return Response(
                {"error": "Failed to fetch playlist details", "details": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception:
            logger.exception("Unexpected YouTube playlist detail error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SpotifyPlaylistsView(APIView):
    def get(self, request):
        search_query = request.GET.get("q", "").strip()
        max_results = _resolve_max_results(request)
        try:
            spotify_service = get_spotify_service()
            if search_query:
                albums = spotify_service.search_albums(search_query, max_results)
            else:
                albums = spotify_service.get_artist_albums(max_results)
            return Response(
                {"playlists": albums, "total": len(albums), "platform": "spotify"}
            )
        except SpotifyServiceError as exc:
            logger.exception("Spotify service error")
            return Response(
                {"error": "Failed to fetch Spotify data", "details": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception:
            logger.exception("Unexpected Spotify playlists error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SpotifyAlbumDetailView(APIView):
    def get(self, request, album_id: str):
        try:
            spotify_service = get_spotify_service()
            album = spotify_service.get_album_details(album_id)
            if album:
                return Response({"playlist": album})
            return Response({"error": "Álbum não encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except SpotifyServiceError as exc:
            logger.exception("Spotify album detail error")
            return Response(
                {"error": "Failed to fetch album details", "details": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception:
            logger.exception("Unexpected Spotify album detail error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SpotifyStatsView(APIView):
    def get(self, request):
        try:
            spotify_service = get_spotify_service()
            albums = spotify_service.get_artist_albums(max_results=100)
            total_tracks = sum(album.get("video_count", 0) for album in albums)
            return Response({"total_tracks": total_tracks, "total_albums": len(albums)})
        except SpotifyServiceError as exc:
            logger.exception("Spotify stats error")
            return Response(
                {"error": "Failed to fetch Spotify stats", "details": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception:
            logger.exception("Unexpected Spotify stats error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class YouTubeStatsView(APIView):
    def get(self, request):
        try:
            youtube_service = get_youtube_service()
            stats = youtube_service.get_channel_statistics()
            if not stats:
                return Response(
                    {"error": "Não foi possível carregar estatísticas do YouTube"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            return Response(
                {
                    "view_count": stats["view_count"],
                    "subscriber_count": stats["subscriber_count"],
                    "video_count": stats["video_count"],
                    "channel_title": stats["channel_title"],
                    "subscriber_count_hidden": stats["subscriber_count_hidden"],
                }
            )
        except YouTubeServiceError as exc:
            logger.exception("YouTube stats error")
            return Response(
                {"error": "Failed to fetch YouTube stats", "details": str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception:
            logger.exception("Unexpected YouTube stats error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdatesView(APIView):
    def get(self, request):
        try:
            updates_list = get_updates()
            response = Response({"updates": updates_list})
            response["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"
            return response
        except UpdatesServiceError as exc:
            logger.exception("Updates service error")
            return Response(
                {"error": "Failed to load updates", "updates": []}, status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception:
            logger.exception("Unexpected updates error")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
