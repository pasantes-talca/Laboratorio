from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import (
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DATABASE_URL,
)
from backend.app.models import (
    Base,
    metadata,
    RegistroCalidad,
    ControlBebida,
    ControlJarabe,
    JarabeSimple,
    JarabeTerminado,
    SaneoTanque,
    ParteJarabe,
    ControlTorque,
    ControlPausa,
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
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
