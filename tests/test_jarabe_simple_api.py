from datetime import datetime
from zoneinfo import ZoneInfo

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.routers import jarabe
from backend.app.core.database import get_db
from backend.app.core.security import security_and_audit_middleware
from backend.app.models import Base, JarabeSimple


@pytest.mark.parametrize(
    "provided_date", [{}, {"fecha": "2000-01-01", "hora": "01:00"}]
)
def test_simple_uses_current_plant_time_when_saved_without_login(
    monkeypatch, provided_date
):
    now = datetime(
        2026, 10, 21, 23, 59, 12, tzinfo=ZoneInfo("America/Argentina/Buenos_Aires")
    )
    monkeypatch.setattr(jarabe, "local_now", lambda: now)
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    ).execution_options(schema_translate_map={"laboratorio": None})
    Base.metadata.create_all(engine)
    app = FastAPI()
    app.middleware("http")(security_and_audit_middleware)
    app.include_router(jarabe.router)

    def database():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = database
    client = TestClient(app)
    response = client.post(
        "/api/jarabe-simple",
        json={
            "tanque": "1",
            "volcado_numero": 1,
            "cantidad_bolsas": 80,
            "azucar_tipo": "Común",
            "azucar_marca": "Marca",
            "responsables": ["Operador"],
            **provided_date,
        },
    )
    assert response.status_code == 201, response.text
    with Session(engine) as db:
        record = db.query(JarabeSimple).one()
        assert record.fecha == now.date()
        assert record.hora == now.time().replace(tzinfo=None)
        assert record.tanque == "1"
    engine.dispose()
