from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse

from backend.app.core.config import FRONTEND_DIST

router = APIRouter(tags=["SPA Navigation"])

SPA_ROUTES = [
    "/administracion",
    "/",
    "/calidad",
    "/jarabe",
    "/agua",
    "/saneado",
    "/area-saneado",
    "/preparacion-jarabe",
    "/produccion-jarabe",
    "/portal",
    "/dashboard",
]


@router.get("/")
@router.get("/administracion")
@router.get("/calidad")
@router.get("/jarabe")
@router.get("/agua")
@router.get("/saneado")
@router.get("/area-saneado")
@router.get("/preparacion-jarabe")
@router.get("/produccion-jarabe")
@router.get("/portal")
@router.get("/dashboard")
@router.get("/sala-jarabe", include_in_schema=False)
@router.get("/sala-saneado", include_in_schema=False)
async def get_react_app():
    index_path = FRONTEND_DIST / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return HTMLResponse(
        "<h3>Frontend React no compilado. Ejecute 'cd frontend && npm run build' o inicie 'npm run dev'.</h3>"
    )


FORM_ROUTES = {
    "calidad": {"bebida", "jarabe", "torque"},
    "jarabe": {"simple", "terminado", "saneo-tanques", "parte"},
    "sala-jarabe": {"simple", "terminado", "saneo-tanques", "parte"},
    "preparacion-jarabe": {"simple", "terminado", "saneo-tanques", "parte"},
    "produccion-jarabe": {"simple", "terminado", "saneo-tanques", "parte"},
    "agua": {"fisico-quimico", "analisis-cloro", "osmosis-inversa", "filtro-arena", "dashboard"},
    "saneado": {"control"},
    "area-saneado": {"control"},
    "sala-saneado": {"control"},
}


@router.get("/{module}/{form}", include_in_schema=False)
async def get_react_form(module: str, form: str):
    if form not in FORM_ROUTES.get(module, set()):
        raise HTTPException(status_code=404, detail="Formulario no encontrado")
    return await get_react_app()

