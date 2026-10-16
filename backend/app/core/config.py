import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import URL

load_dotenv()

# Base directories
CORE_DIR = Path(__file__).resolve().parent
APP_DIR = CORE_DIR.parent
BACKEND_DIR = APP_DIR.parent
ROOT_DIR = BACKEND_DIR.parent

# Database configuration
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "calidad")

DATABASE_URL = os.getenv("DATABASE_URL") or URL.create(
    "postgresql+psycopg2", username=DB_USER, password=DB_PASSWORD,
    host=DB_HOST, port=int(DB_PORT), database=DB_NAME,
).render_as_string(hide_password=False)


def _csv_env(name: str, default: str) -> list[str]:
    return [value.strip() for value in os.getenv(name, default).split(",") if value.strip()]


# Credentials and roles are resolved only by the server.
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
ALLOWED_ORIGINS = _csv_env(
    "ALLOWED_ORIGINS",
    "http://127.0.0.1:5173,http://localhost:5173",
)
AUTH_USERS = os.getenv("AUTH_USERS", "{}").strip()
SESSION_SECRET = os.getenv("SESSION_SECRET", "").strip()
SESSION_SECONDS = 8 * 60 * 60
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(2 * 1024 * 1024)))
APP_TIMEZONE = os.getenv("APP_TIMEZONE", "America/Argentina/Buenos_Aires")

# Static and Frontend assets
STATIC_DIR = BACKEND_DIR / "static"
MAESTROS_PATH = STATIC_DIR / "data" / "maestros.json"
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"

# Brand bottle color mapping
BRAND_BOTTLE_COLOR = {
    "talca": "#00FF00",
}
