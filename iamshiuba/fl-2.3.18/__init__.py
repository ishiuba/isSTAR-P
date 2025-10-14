"""
Flask application factory
Initializes and configures the Flask application with all extensions and blueprints
"""

import os
from datetime import datetime
from flask import Flask, render_template, request
from flask_compress import Compress
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.middleware.shared_data import SharedDataMiddleware
import logging
from config import Config


def create_app(config_class=Config):
    """Application factory function"""
    app = Flask(
        __name__, static_url_path="/static", static_folder=os.path.abspath("static")
    )
    app.config.from_object(config_class)

    # Initialize extensions
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

    # Context processors
    @app.context_processor
    def inject_year():
        return {"current_year": datetime.now().year}

    # Register Blueprints
    from blueprints.main_routes import main_bp
    from blueprints.api_routes import api_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)

    # Error handlers
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

    return app
