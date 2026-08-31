import os
from pathlib import Path
from dotenv import load_dotenv

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

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Static and Frontend assets
STATIC_DIR = BACKEND_DIR / "static"
MAESTROS_PATH = STATIC_DIR / "data" / "maestros.json"
FRONTEND_DIST = ROOT_DIR / "frontend" / "dist"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"

# Brand bottle color mapping
BRAND_BOTTLE_COLOR = {
    "talca": "#00FF00",
}
