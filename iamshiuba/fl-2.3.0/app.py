from datetime import datetime
from flask import (
    Flask,
    render_template,
    send_from_directory,
    request,
    redirect,
    url_for,
    flash,
    session,
)
from flask_compress import Compress
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.middleware.shared_data import SharedDataMiddleware
import os
import logging
from config import Config
from functools import wraps
from updates.database import init_db


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

    @app.route("/updates")
    def updates():
        from updates.database import get_updates_by_version

        # Get updates sorted by version (newest first)
        updates = get_updates_by_version(order='DESC')
        return render_template("pages/updates.html", updates=updates, title="Updates")

    # Admin authentication
    def admin_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not session.get("admin_logged_in"):
                return redirect(url_for("admin_login"))
            return f(*args, **kwargs)

        return decorated_function

    # Admin login
    @app.route("/admin/login", methods=["GET", "POST"])
    def admin_login():
        if request.method == "POST":
            password = request.form.get("password")
            if password == app.config.get("ADMIN_PASSWORD"):
                session["admin_logged_in"] = True
                return redirect(url_for("admin_dashboard"))
            flash("Invalid password", "error")
        return render_template("admin/login.html", title="admin_login")

    # Admin logout
    @app.route("/admin/logout")
    def admin_logout():
        session.pop("admin_logged_in", None)
        return redirect(url_for("index"))

    # Admin dashboard
    @app.route("/admin")
    @admin_required
    def admin_dashboard():
        from updates.database import get_updates_by_version

        # Get updates sorted by version (newest first)
        updates = get_updates_by_version(order='DESC')
        return render_template(
            "admin/dashboard.html", updates=updates, title="admin_dashboard"
        )

    # Add new update
    @app.route("/admin/updates/new", methods=["GET", "POST"])
    @admin_required
    def add_update():
        if request.method == "POST":
            title = request.form.get("title")
            content = request.form.get("content")
            version = request.form.get("version")

            from updates.database import add_update as db_add_update

            db_add_update(title, content, version)
            flash("Update added successfully", "success")
            return redirect(url_for("admin_dashboard"))

        return render_template("admin/update_form.html", title="admin_add_update")

    # Edit update
    @app.route("/admin/updates/edit/<int:id>", methods=["GET", "POST"])
    @admin_required
    def edit_update(id):
        from updates.database import get_update, update_update as db_update_update

        update = get_update(id)
        if not update:
            flash("Update not found", "error")
            return redirect(url_for("admin_dashboard"))

        if request.method == "POST":
            title = request.form.get("title")
            content = request.form.get("content")
            version = request.form.get("version")

            db_update_update(id, title, content, version)
            flash("Update modified successfully", "success")
            return redirect(url_for("admin_dashboard"))

        return render_template(
            "admin/update_form.html", update=update, title="admin_edit_update"
        )

    # Delete update
    @app.route("/admin/updates/delete/<int:id>", methods=["POST"])
    @admin_required
    def delete_update(id):
        from updates.database import delete_update as db_delete_update

        db_delete_update(id)
        flash("Update deleted successfully", "success")
        return redirect(url_for("admin_dashboard"))

    return app


# Create app instance
app = create_app()

# Initialize database
init_db()

if __name__ == "__main__":
    app.run()
