from fastapi import APIRouter
from backend.app.services.maestros import load_maestros

router = APIRouter(prefix="/api", tags=["Maestros"])


@router.get("/marcas")
def get_marcas():
    m = load_maestros()
    return [{"id": i, "nombre": v} for i, v in enumerate(m.get("marcas", []), 1)]


@router.get("/tipos-concentrado")
def get_tipos_concentrado():
    m = load_maestros()
    return [{"id": i, "codigo": v} for i, v in enumerate(m.get("tipos_concentrado", []), 1)]


@router.get("/tamanos")
def get_tamanos():
    m = load_maestros()
    return [{"id": i, "valor": v} for i, v in enumerate(m.get("tamanos", []), 1)]


@router.get("/responsables")
def get_responsables():
    m = load_maestros()
    return [{"id": i, "nombre_completo": v} for i, v in enumerate(m.get("responsables", []), 1)]


@router.get("/responsables-jarabe")
def get_responsables_jarabe():
    """Responsables específicos para los formularios de Sala de Jarabe."""
    m = load_maestros()
    return [{"id": i, "nombre_completo": v} for i, v in enumerate(m.get("responsables_jarabe", []), 1)]


@router.get("/sabores")
def get_sabores():
    """Marcas para Control de Jarabe, excluyendo Soda y Sifon."""
    excluidas = {"soda", "sifon"}
    m = load_maestros()
    marcas = [v for v in m.get("marcas", []) if v.strip().lower() not in excluidas]
    return [{"id": i, "nombre": v} for i, v in enumerate(marcas, 1)]


@router.get("/tanques")
def get_tanques():
    m = load_maestros()
    tanques = m.get("tanques", [])
    return [{"id": i, "numero": v} for i, v in enumerate(tanques, 1)]
