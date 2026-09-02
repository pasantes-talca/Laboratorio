from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.core.config import FRONTEND_ASSETS, STATIC_DIR
from backend.app.core.database import init_db
from backend.app.api.routers import (
    maestros_router,
    calidad_router,
    jarabe_router,
    ops_router,
    spa_router,
    agua_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rutas estáticas de React (frontend/dist)
if FRONTEND_ASSETS.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_ASSETS)), name="react-assets")

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Incluir routers
app.include_router(maestros_router)
app.include_router(calidad_router)
app.include_router(jarabe_router)
app.include_router(ops_router)
app.include_router(spa_router)
app.include_router(agua_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
