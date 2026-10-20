from fastapi import Request
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from backend.app.core.config import (
    DATABASE_URL,
    DB_HOST,
    DB_NAME,
    DB_PASSWORD,
    DB_PORT,
    DB_USER,
    ENVIRONMENT,
)
from backend.app.models import (
    Base,
    ControlBebida,
    ControlJarabe,
    ControlPausa,
    ControlTorque,
    JarabeSimple,
    JarabeTerminado,
    ParteJarabe,
    RegistroCalidad,
    SaneoTanque,
    metadata,
)
from backend.app.services import (
    audit as _audit,  # noqa: F401 -- register transaction listeners
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    if ENVIRONMENT != "development":
        # Production schemas are managed explicitly with Alembic.
        return
    if engine.dialect.name == "postgresql":
        with engine.begin() as connection:
            connection.execute(text("CREATE SCHEMA IF NOT EXISTS laboratorio"))
    Base.metadata.create_all(bind=engine)


def get_db(request: Request):
    db = SessionLocal()
    db.info["actor"] = getattr(request.state, "actor", None)
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


__all__ = [
    "engine",
    "SessionLocal",
    "init_db",
    "get_db",
    "Base",
    "metadata",
    "RegistroCalidad",
    "ControlBebida",
    "ControlJarabe",
    "JarabeSimple",
    "JarabeTerminado",
    "SaneoTanque",
    "ParteJarabe",
    "ControlTorque",
    "ControlPausa",
    "DB_USER",
    "DB_PASSWORD",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DATABASE_URL",
]
