"""
Main routes blueprint for HTML pages
Handles all page rendering routes (/, /about, /streaming, etc.)
"""

from flask import Blueprint, render_template, send_from_directory, current_app
import os
from services.updates_service import get_updates
from services.exceptions import UpdatesServiceError

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    # Pass playlist ID dynamically from backend
    featured_playlist_id = "OLAK5uy_laLvEldekJ_qsP5DMbG-PYcEW3oQEYu_Q"
    return render_template(
        "pages/home.html", title="Homepage", featured_playlist_id=featured_playlist_id
    )


@main_bp.route("/streaming")
@main_bp.route("/streaming/")
def streaming():
    return render_template(
        "pages/streaming.html", title="Streaming", active_tab="youtube"
    )


@main_bp.route("/streaming/youtube")
def streaming_youtube():
    return render_template(
        "pages/streaming.html", title="Streaming - YouTube", active_tab="youtube"
    )


@main_bp.route("/streaming/spotify")
def streaming_spotify():
    return render_template(
        "pages/streaming.html", title="Streaming - Spotify", active_tab="spotify"
    )


@main_bp.route("/about")
def about():
    return render_template("pages/about.html", title="About")


@main_bp.route("/terms")
def tos():
    return render_template("pages/tos.html", title="Terms of Service")


@main_bp.route("/privacy")
def privacy():
    return render_template("pages/privacy.html", title="Privacy Policy")


@main_bp.route("/updates")
def updates():
    try:
        update_list = get_updates()
        return render_template(
            "pages/updates.html", title="Atualizações", updates=update_list
        )
    except UpdatesServiceError as e:
        # Log error and show empty list
        current_app.logger.error(f"Updates service error: {e}")
        return render_template("pages/updates.html", title="Atualizações", updates=[])
    except Exception as e:
        # Log unexpected error and show empty list
        current_app.logger.error(f"Unexpected error loading updates: {e}")
        return render_template("pages/updates.html", title="Atualizações", updates=[])


@main_bp.route("/static/translations/<language_code>.json")
def translations(language_code):
    valid_languages = ["en-US", "pt-BR", "jp-JP", "ru-RU", "hi-IN", "zh-CN"]
    if language_code not in valid_languages:
        return {"error": "Invalid language code"}, 400

    try:
        return send_from_directory("static/translations", f"{language_code}.json")
    except FileNotFoundError:
        return {"error": "Translation file not found"}, 404


@main_bp.route("/favicon.ico")
def favicon():
    return send_from_directory(
        os.path.join(current_app.root_path, "static/img"),
        "is_web.svg",
        mimetype="image/svg+xml",
    )


@main_bp.route("/health")
def health():
    return {"status": "healthy"}, 200
