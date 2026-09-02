from backend.app.api.routers.maestros import router as maestros_router
from backend.app.api.routers.calidad import router as calidad_router
from backend.app.api.routers.jarabe import router as jarabe_router
from backend.app.api.routers.ops import router as ops_router
from backend.app.api.routers.spa import router as spa_router
from backend.app.api.routers.agua import router as agua_router

__all__ = [
    "maestros_router",
    "calidad_router",
    "jarabe_router",
    "ops_router",
    "spa_router",
    "agua_router",
]
