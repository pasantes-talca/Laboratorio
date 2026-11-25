from backend.app.api.routers.agua import router as agua_router
from backend.app.api.routers.calidad import router as calidad_router
from backend.app.api.routers.jarabe import router as jarabe_router
from backend.app.api.routers.maestros import router as maestros_router
from backend.app.api.routers.ops import router as ops_router
from backend.app.api.routers.production import router as production_router
from backend.app.api.routers.reportes import router as reportes_router
from backend.app.api.routers.saneado import router as saneado_router
from backend.app.api.routers.spa import router as spa_router

__all__ = [
    "agua_router",
    "calidad_router",
    "jarabe_router",
    "maestros_router",
    "ops_router",
    "production_router",
    "reportes_router",
    "saneado_router",
    "spa_router",
]

