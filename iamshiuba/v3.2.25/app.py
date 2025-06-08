import os
from datetime import datetime
from flask import (
    Flask,
    render_template,
    send_from_directory,
    request,
    jsonify,
)

from flask_compress import Compress
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.middleware.shared_data import SharedDataMiddleware
import logging
from config import Config
from functools import wraps
from youtube_service import get_youtube_service
from spotify_service import get_spotify_service
import json


def create_app(config_class=Config):
    app = Flask(
        __name__,
        static_url_path="/static",
        static_folder=os.path.abspath("static"),
    )
    app.config.from_object(config_class)

    # Extensions
    Compress(app)

    # Configure static files for production
    app.wsgi_app = SharedDataMiddleware(
        app.wsgi_app,
        {"/static": os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")},
    )

    # Configure limiter
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        storage_uri="memory://",
        storage_options={"socket_connect_timeout": 30},
        default_limits=["200 per day", "50 per hour"],
    )

    # Configure logging
    if not app.debug:
        app.logger.setLevel(logging.INFO)
        app.logger.info("Application startup")

    # Handle proxy headers
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)

    # Security Headers
    @app.after_request
    def add_security_headers(response):
        response.headers.update(
            {
                "X-Content-Type-Options": "nosniff",
                "X-Frame-Options": "SAMEORIGIN",
                "X-XSS-Protection": "1; mode=block",
                "Content-Security-Policy": "default-src 'self' https:; img-src 'self' https: data:; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' 'unsafe-eval'",
                "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
                "Referrer-Policy": "strict-origin-when-cross-origin",
            }
        )
        return response

    # CORS Headers
    @app.after_request
    def add_cors_headers(response):
        allowed_origins = [
            ".vercel.app",
            ".fly.dev",
            "localhost:5000",
            "127.0.0.1:5000",
        ]
        if request.headers.get("Origin") in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = request.headers["Origin"]
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        return response

    # Maintenance mode
    @app.before_request
    def check_maintenance():
        if app.config.get("MAINTENANCE_MODE", False) and request.path != "/maintenance":
            return render_template("errors/maintenance.html"), 503
        return None

    @app.context_processor
    def inject_year():
        return {"current_year": datetime.now().year}

    # Error Handlers
    @app.errorhandler(404)
    def page_not_found(e):
        app.logger.info(f"404 error: {request.path} - {request.remote_addr}")
        return render_template("errors/404.html", error=e), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        app.logger.error(
            f"500 error: {str(e)} - {request.path} - {request.remote_addr}"
        )
        return render_template("errors/500.html", error=e), 500

    @app.errorhandler(403)
    def forbidden(e):
        app.logger.warning(f"403 error: {request.path} - {request.remote_addr}")
        return render_template("errors/403.html", error=e), 403

    @app.errorhandler(429)
    def too_many_requests(e):
        app.logger.warning(f"429 error: {request.path} - {request.remote_addr}")
        return render_template("errors/429.html", error=e), 429

    # Routes
    @app.route("/")
    def index():
        return render_template("pages/home.html", title="Homepage")

    @app.route("/streaming")
    @app.route("/streaming/")
    def streaming():
        return render_template(
            "pages/streaming.html", title="Streaming", active_tab="youtube"
        )

    @app.route("/streaming/youtube")
    def streaming_youtube():
        return render_template(
            "pages/streaming.html", title="Streaming - YouTube", active_tab="youtube"
        )

    @app.route("/streaming/spotify")
    def streaming_spotify():
        return render_template(
            "pages/streaming.html", title="Streaming - Spotify", active_tab="spotify"
        )

    @app.route("/about")
    def about():
        return render_template("pages/about.html", title="About")

    @app.route("/terms")
    def tos():
        return render_template("pages/tos.html", title="Terms of Service")

    @app.route("/privacy")
    def privacy():
        return render_template("pages/privacy.html", title="Privacy Policy")

    @app.route("/updates")
    def updates():
        try:
            with open("static/data/updates.json", "r", encoding="utf-8") as file:
                data = json.load(file)
                updates = data.get("updates", [])
                # Ordena as atualizações pela versão (mais recente primeiro)
                updates.sort(key=lambda x: x["version"], reverse=True)
                return render_template(
                    "pages/updates.html", title="Atualizações", updates=updates
                )
        except Exception as e:
            app.logger.error(f"Erro ao carregar atualizações: {e}")
            return render_template(
                "pages/updates.html", title="Atualizações", updates=[]
            )

    @app.route("/static/translations/<language_code>.json")
    def translations(language_code):
        valid_languages = ["en-US", "pt-BR", "jp-JP", "ru-RU", "hi-IN", "zh-CN"]
        if language_code not in valid_languages:
            return {"error": "Invalid language code"}, 400

        try:
            return send_from_directory("static/translations", f"{language_code}.json")
        except FileNotFoundError:
            return {"error": "Translation file not found"}, 404

    @app.route("/favicon.ico")
    def favicon():
        return send_from_directory(
            os.path.join(app.root_path, "static/img"),
            "is_web.svg",
            mimetype="image/svg+xml",
        )

    @app.route("/health")
    def health():
        return {"status": "healthy"}, 200

    @app.route("/api/playlists")
    def api_playlists():
        """API geral para playlists com filtros opcionais"""
        try:
            platform = request.args.get("platform", "").lower()
            search_query = request.args.get("q", "")
            max_results = min(int(request.args.get("max_results", 50)), 100)

            if platform == "youtube" or not platform:
                youtube_service = get_youtube_service()

                if search_query:
                    playlists = youtube_service.search_playlists(
                        search_query, max_results
                    )
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
            app.logger.error(f"Erro na API de playlists: {e}")
            return jsonify({"error": "Erro interno do servidor"}), 500

    @app.route("/api/playlists/youtube")
    def api_youtube_playlists():
        """API específica para playlists do YouTube"""
        try:
            search_query = request.args.get("q", "")
            max_results = min(int(request.args.get("max_results", 50)), 100)

            youtube_service = get_youtube_service()

            if search_query:
                playlists = youtube_service.search_playlists(search_query, max_results)
            else:
                playlists = youtube_service.get_channel_playlists(max_results)

            return jsonify(
                {"playlists": playlists, "total": len(playlists), "platform": "youtube"}
            )

        except Exception as e:
            app.logger.error(f"Erro na API do YouTube: {e}")
            return jsonify({"error": "Erro ao carregar playlists do YouTube"}), 500

    @app.route("/api/playlists/spotify")
    def api_spotify_playlists():
        """API específica para álbuns do Spotify (artista iamshiuba)"""
        try:
            search_query = request.args.get("q", "")
            max_results = min(int(request.args.get("max_results", 50)), 100)

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

        except Exception as e:
            app.logger.error(f"Erro na API do Spotify: {e}")
            return jsonify({"error": "Erro ao carregar álbuns do Spotify"}), 500

    @app.route("/api/playlists/youtube/<playlist_id>")
    def api_youtube_playlist_details(playlist_id):
        """API para detalhes específicos de uma playlist do YouTube"""
        try:
            youtube_service = get_youtube_service()
            playlist = youtube_service.get_playlist_details(playlist_id)

            if playlist:
                return jsonify({"playlist": playlist})
            else:
                return jsonify({"error": "Playlist não encontrada"}), 404

        except Exception as e:
            app.logger.error(f"Erro ao buscar detalhes da playlist {playlist_id}: {e}")
            return jsonify({"error": "Erro interno do servidor"}), 500

    @app.route("/api/playlists/spotify/<album_id>")
    def api_spotify_album_details(album_id):
        """API para detalhes específicos de um álbum do Spotify"""
        try:
            spotify_service = get_spotify_service()
            album = spotify_service.get_album_details(album_id)

            if album:
                return jsonify(
                    {"playlist": album}
                )  # Manter compatibilidade com frontend
            else:
                return jsonify({"error": "Álbum não encontrado"}), 404

        except Exception as e:
            app.logger.error(f"Erro ao buscar detalhes do álbum {album_id}: {e}")
            return jsonify({"error": "Erro interno do servidor"}), 500

    return app


# Create app instance
app = create_app()

if __name__ == "__main__":
    app.run()
