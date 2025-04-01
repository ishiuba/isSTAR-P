from os import environ, path
from dotenv import load_dotenv

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, ".env"))


class Config:
    SECRET_KEY = environ.get("SECRET_KEY") or "dev-key"
    MAINTENANCE_MODE = False
    ALLOWED_HOSTS = environ.get("ALLOWED_HOSTS", "localhost").split(",")
    ALLOWED_ORIGINS = [".vercel.app", ".fly.dev", "localhost:5000", "127.0.0.1:5000"]
    DEBUG = bool(int(environ.get("FLASK_DEBUG", "0")))
    TEMPLATES_AUTO_RELOAD = True
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    COMPRESS_MIMETYPES = [
        "text/html",
        "text/css",
        "text/xml",
        "application/json",
        "application/javascript",
    ]
    STATIC_FOLDER = "static"
