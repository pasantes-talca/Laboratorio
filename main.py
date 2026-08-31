"""Root entrypoint for the Laboratorio application.

Exposes the FastAPI `app` instance from `backend.app.main` and provides
a direct execution entry point for `python main.py`.
"""
import uvicorn
from backend.app.main import app

__all__ = ["app"]

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
