"""Responsables per module: seeding and read helpers backed by the database."""

from sqlalchemy.orm import Session

from backend.app.models.responsables import Responsable
from backend.app.services.maestros import (
    DEFAULT_MAESTROS,
    RESPONSABLES_POR_MODULO,
    load_maestros,
)

MODULOS = ("calidad", "agua", "jarabe")
MODULO_LABELS = {
    "calidad": "Control de calidad",
    "agua": "Control de Agua",
    "jarabe": "Preparacion de Jarabe",
}
MAX_NOMBRE = 100


def initial_responsables() -> dict[str, list[str]]:
    """Seed lists: maestros.json when it defines them, hardcoded defaults otherwise."""
    maestros = load_maestros()
    calidad = maestros.get("responsables_calidad") or maestros.get("responsables")
    return {
        "calidad": list(calidad or RESPONSABLES_POR_MODULO[MODULO_LABELS["calidad"]]),
        "agua": list(
            maestros.get("responsables_agua") or RESPONSABLES_POR_MODULO[MODULO_LABELS["agua"]]
        ),
        "jarabe": list(
            maestros.get("responsables_jarabe") or RESPONSABLES_POR_MODULO[MODULO_LABELS["jarabe"]]
        ),
    }


def seed_responsables(db: Session, commit: bool = True) -> bool:
    """Insert the initial lists only when the table is empty. Returns True if seeded."""
    if db.query(Responsable.id).first() is not None:
        return False
    for modulo, nombres in initial_responsables().items():
        for nombre in dict.fromkeys(n.strip() for n in nombres if n and n.strip()):
            db.add(Responsable(modulo=modulo, nombre=nombre))
    if commit:
        db.commit()
    else:
        db.flush()
    return True


def nombres_por_modulo(db: Session) -> dict[str, list[str]]:
    result = {modulo: [] for modulo in MODULOS}
    for row in db.query(Responsable).order_by(Responsable.id):
        if row.modulo in result:
            result[row.modulo].append(row.nombre)
    return result


def maestros_con_responsables(db: Session) -> dict:
    """Master data with every responsables key served from the database."""
    maestros = dict(load_maestros() or DEFAULT_MAESTROS)
    nombres = nombres_por_modulo(db)
    maestros["responsables"] = nombres["calidad"]
    maestros["responsables_calidad"] = nombres["calidad"]
    maestros["responsables_agua"] = nombres["agua"]
    maestros["responsables_jarabe"] = nombres["jarabe"]
    maestros["Responsables de controles de agua, calidad y preparacion de jarabe"] = {
        MODULO_LABELS[modulo]: nombres[modulo] for modulo in MODULOS
    }
    return maestros
