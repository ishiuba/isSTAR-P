from datetime import datetime
from flask import (
    Flask,
    render_template,
    send_from_directory,
    request,
)
from flask_compress import Compress
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.middleware.shared_data import SharedDataMiddleware
import os
import logging
from config import Config


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

    @app.context_processor
    def inject_year():
        return {"current_year": datetime.now().year}

    # Error Handlers
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("errors/404.html"), 404

    @app.errorhandler(500)
    def internal_server_error(e):
        return render_template("errors/500.html"), 500

    # Routes
    @app.route("/")
    def index():
        return render_template("pages/home.html", title="Homepage")

    @app.route("/streaming")
    def streaming():
        return render_template("pages/streaming.html", title="Streaming")

    @app.route("/about")
    def about():
        return render_template("pages/about.html", title="About")

    @app.route("/terms")
    def tos():
        return render_template("pages/tos.html", title="Terms of Service")

    @app.route("/privacy")
    def privacy():
        return render_template("pages/privacy.html", title="Privacy Policy")

    # Improved translations route with language code validation
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

    return app


# Create app instance
app = create_app()

if __name__ == "__main__":
    app.run()
