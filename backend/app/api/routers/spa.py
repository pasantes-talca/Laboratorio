from fastapi import APIRouter
from fastapi.responses import HTMLResponse, FileResponse
from backend.app.core.config import FRONTEND_DIST

router = APIRouter(tags=["SPA Navigation"])

SPA_ROUTES = [
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
@router.get("/calidad")
@router.get("/jarabe")
@router.get("/agua")
@router.get("/saneado")
@router.get("/area-saneado")
@router.get("/preparacion-jarabe")
@router.get("/produccion-jarabe")
@router.get("/portal")
@router.get("/dashboard")
async def get_react_app():
    index_path = FRONTEND_DIST / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return HTMLResponse(
        "<h3>Frontend React no compilado. Ejecute 'cd frontend && npm run build' o inicie 'npm run dev'.</h3>"
    )

