import json
from backend.app.core.config import MAESTROS_PATH


def load_maestros() -> dict:
    """Reads master data from maestros.json. Returns empty fallback lists on error."""
    try:
        with open(MAESTROS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {
            "responsables": [],
            "responsables_jarabe": [],
            "marcas": [],
            "tipos_concentrado": [],
            "tamanos": [],
            "tanques": [],
        }
