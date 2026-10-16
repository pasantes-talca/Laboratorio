import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from backend.app.api.routers import (
    agua_router,
    calidad_router,
    jarabe_router,
    maestros_router,
    ops_router,
    production_router,
    reportes_router,
    saneado_router,
    spa_router,
)
from backend.app.api.routers.auth import router as auth_router
from backend.app.core.auth import validate_auth_config
from backend.app.core.config import ALLOWED_ORIGINS, FRONTEND_ASSETS, STATIC_DIR
from backend.app.core.database import init_db
from backend.app.core.security import security_and_audit_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_auth_config()
    init_db()
    yield

app = FastAPI(
    title="Laboratorio de Calidad - Control de Bebida Terminada",
    version="1.0.0",
    lifespan=lifespan,
)

# Configurar CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(security_and_audit_middleware)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    logging.getLogger("laboratorio.error").warning("Integrity error: %s", exc)
    return JSONResponse(
        status_code=409,
        content={
            "detail": "El registro incumple una restricción de datos",
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(SQLAlchemyError)
async def database_error_handler(request: Request, exc: SQLAlchemyError):
    logging.getLogger("laboratorio.error").exception("Database error")
    return JSONResponse(
        status_code=503,
        content={
            "detail": "La base de datos no está disponible temporalmente",
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.get("/api/health", tags=["Sistema"])
def healthcheck():
    return {"status": "ok", "service": "laboratorio-calidad"}

# Rutas estáticas de React (frontend/dist)
if FRONTEND_ASSETS.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_ASSETS)), name="react-assets")

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Incluir routers
app.include_router(maestros_router)
app.include_router(auth_router)
app.include_router(calidad_router)
app.include_router(jarabe_router)
app.include_router(ops_router)
app.include_router(agua_router)
app.include_router(saneado_router)
app.include_router(reportes_router)
app.include_router(production_router)
app.include_router(spa_router)



if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
