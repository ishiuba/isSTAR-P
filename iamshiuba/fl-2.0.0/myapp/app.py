from datetime import datetime
from flask import (
    Flask,
    render_template,
    send_from_directory,
    url_for,
    request,
    make_response,
)
from flask_compress import Compress
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache  # Add this import
from limits.storage import RedisStorage
from logging.handlers import RotatingFileHandler
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.middleware.shared_data import SharedDataMiddleware
import redis
import os
import logging


# Initialize Redis with retry logic
def get_redis_client():
    try:
        client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            password=os.getenv("REDIS_PASSWORD", None),
            decode_responses=True,
            socket_timeout=5,
            retry_on_timeout=True,
        )
        client.ping()  # Test connection
        return client
    except redis.ConnectionError:
        print("Warning: Redis connection failed - using fallback storage")
        return None


# Only try Redis in development
if not os.getenv("FLY_APP_NAME"):
    redis_client = get_redis_client()
else:
    redis_client = None

# Initialize Flask app
app = Flask(
    __name__,
    static_url_path="/static",
    static_folder=os.path.abspath("static"),
)
Compress(app)

# Configure static files for production
app.wsgi_app = SharedDataMiddleware(
    app.wsgi_app,
    {"/static": os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")},
)

# Use SimpleCache in production
app.config["CACHE_TYPE"] = "SimpleCache"
app.config["CACHE_DEFAULT_TIMEOUT"] = 300
cache = Cache(app)

# Configure limiter to use memory storage in production
storage_uri = "memory://"
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    storage_uri=storage_uri,
    storage_options={"socket_connect_timeout": 30},
    default_limits=["200 per day", "50 per hour"],
)

# App Configuration
app.config.update(
    DEBUG=True,
    TEMPLATES_AUTO_RELOAD=True,
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    COMPRESS_MIMETYPES=[
        "text/html",
        "text/css",
        "text/xml",
        "application/json",
        "application/javascript",
    ],
)

# Configure logging
if not app.debug:
    if not os.path.exists("logs"):
        os.mkdir("logs")
    file_handler = RotatingFileHandler("logs/app.log", maxBytes=10240, backupCount=10)
    file_handler.setFormatter(
        logging.Formatter(
            "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
        )
    )
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
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
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


# Maintenance mode
MAINTENANCE_MODE = False


@app.before_request
def check_maintenance():
    if MAINTENANCE_MODE and request.path != "/maintenance":
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
@cache.cached(timeout=300)  # Cache for 5 minutes
def index():
    return render_template("pages/index.html", title="Homepage")


@app.route("/streaming")
@cache.cached(timeout=300)
def streaming():
    return render_template("pages/streaming.html", title="Streaming")


@app.route("/about")
@cache.cached(timeout=300)
def about():
    return render_template("pages/about.html", title="About")


@app.route("/terms")
@cache.cached(timeout=300)
def tos():
    return render_template("pages/tos.html", title="Terms of Service")


@app.route("/privacy")
@cache.cached(timeout=300)
def privacy():
    return render_template("pages/privacy.html", title="Privacy Policy")


# Improved translations route with language code validation
@app.route("/static/translations/<language_code>.json")
def translations(language_code):
    valid_languages = ["en", "pt", "jp", "ru", "hi"]
    if language_code not in valid_languages:
        return {"error": "Invalid language code"}, 400

    try:
        return send_from_directory(
            "static/translations", f"{language_code}.json", max_age=2592000
        )
    except FileNotFoundError:
        return {"error": "Translation file not found"}, 404


@app.route("/favicon.ico")
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, "static/img"),
        "is_web.svg",
        mimetype="image/svg+xml",  # Correct mimetype for SVG
        max_age=2592000,
    )


@app.route("/health")
def health():
    return {"status": "healthy"}, 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
