from datetime import datetime
from zoneinfo import ZoneInfo

from backend.app.core.config import APP_TIMEZONE


def local_now() -> datetime:
    """Return the configured plant-local time with timezone information."""
    return datetime.now(ZoneInfo(APP_TIMEZONE))
