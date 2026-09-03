import json
from backend.app.core.config import MAESTROS_PATH


def load_maestros() -> dict:
    """Reads master data from maestros.json. Returns empty fallback lists on error."""
    try:
        with open(MAESTROS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {
            "responsables": ["Juan Pérez", "María González", "Carlos López", "Ana Martínez"],
            "responsables_jarabe": ["Ana Martínez", "Luis Rodríguez", "Pedro Sánchez"],
            "marcas": ["Cola", "Naranja", "Lima", "Pomelo", "Manzana", "Sifon", "Soda"],
            "tipos_concentrado": ["Regular", "Zero", "Light"],
            "tamanos": ["500ml", "1.5L", "2L", "2.25L", "3L"],
            "tanques": ["T1", "T2", "T3", "T4", "T5"],
        }
