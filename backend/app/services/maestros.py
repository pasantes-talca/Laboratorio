import json
from backend.app.core.config import MAESTROS_PATH


SABOR_O_MARCA = {
    "Cola": {
        "tamaños": "3L, 2.25L, 500ml",
        "tipo_de_concentrado": "KG, XQ, IFF",
        "color_tapa": "azul",
    },
    "Lima": {
        "tamaños": "3L, 2.25L, 500ml",
        "tipo_de_concentrado": "TP, IFF, BA",
        "color_tapa": "verde",
    },
    "Pomelo": {
        "tamaños": "3L, 2.25L, 500ml",
        "tipo_de_concentrado": "TP, IFF, BA",
        "color_tapa": "Amarillo",
    },
    "Naranja": {
        "tamaños": "3L, 2.25L, 500ml",
        "tipo_de_concentrado": "TP, IFF, BA",
        "color_tapa": "naranja",
    },
    "Manzana": {
        "tamaños": "3L, 2.25L, 500ml",
        "tipo_de_concentrado": "TP, IFF, BA, XQ, KG",
        "color_tapa": "azul",
    },
    "Soda": {
        "tamaños": "2,25L, 500ml",
        "tipo_de_concentrado": "N/A",
        "color_tapa": "Gris",
    },
    "Sifon": {
        "tamaños": "2L",
        "tipo_de_concentrado": "N/A",
        "color_tapa": "Rojo",
    },
}

RESPONSABLES_POR_MODULO = {
    "Control de calidad": [
        "Moya Luis",
        "Diaz Mauro",
        "Alonso Dario",
        "Amaya Carlos",
        "Campillay Omar",
        "Barrionuevo Gonzalo",
    ],
    "Control de Agua": [
        "Moya Luis",
        "Diaz Mauro",
        "Alonso Dario",
        "Amaya Carlos",
        "Campillay Omar",
        "Barrionuevo Gonzalo",
    ],
    "Preparacion de Jarabe": [
        "Gustavo Funes",
        "Carlos Videla",
        "Emanuel Juarez",
        "Sebastian Astor",
        "Carlos Abrego",
        "Pedro Guerra",
    ],
}

DEFAULT_MAESTROS = {
    "Sabor o marca": SABOR_O_MARCA,
    "Responsables de controles de agua, calidad y preparacion de jarabe": RESPONSABLES_POR_MODULO,
    "responsables": RESPONSABLES_POR_MODULO["Control de calidad"],
    "responsables_calidad": RESPONSABLES_POR_MODULO["Control de calidad"],
    "responsables_agua": RESPONSABLES_POR_MODULO["Control de Agua"],
    "responsables_jarabe": RESPONSABLES_POR_MODULO["Preparacion de Jarabe"],
    "marcas": list(SABOR_O_MARCA.keys()),
    "tipos_concentrado": ["KG", "XQ", "IFF", "TP", "BA", "N/A"],
    "tamanos": ["3L", "2.25L", "2L", "500ml"],
    "tanques": ["4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "N/A"],
}


def load_maestros() -> dict:
    """Reads master data from maestros.json. Returns master fallback data on error."""
    try:
        with open(MAESTROS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return DEFAULT_MAESTROS

