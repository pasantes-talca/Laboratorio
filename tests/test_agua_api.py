from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.routers.agua import router
from backend.app.core.database import get_db
from backend.app.models import Base


def test_chlorine_conditioning_is_saved_and_remains_optional_for_legacy_clients():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)

    @event.listens_for(engine, "connect")
    def attach_schema(connection, _):
        connection.execute("ATTACH DATABASE ':memory:' AS laboratorio")

    Base.metadata.create_all(engine)
    app = FastAPI()
    app.include_router(router)

    def test_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = test_db
    client = TestClient(app)
    payload = {
        "tanque_agua_osmosis": 1, "filtro_carbon_a": "Cumple",
        "filtro_carbon_b": "Cumple", "filtro_carbon_c": "Cumple",
        "cloro_riser_linea": "Linea 1", "cloro_riser_resultado": 1.2,
        "responsable": "Operador", "acondicionamiento_rinser": 1.25,
    }
    assert client.post("/api/agua/analisis-cloro", json=payload).status_code == 201
    rows = client.get("/api/agua/analisis-cloro").json()
    assert rows[0]["acondicionamiento_rinser"] == 1.25
    assert rows[0]["cloro_riser_resultado"] == 1.2
    payload.pop("acondicionamiento_rinser")
    assert client.post("/api/agua/analisis-cloro", json=payload).status_code == 201
    assert client.get("/api/agua/analisis-cloro").json()[0]["acondicionamiento_rinser"] is None
    assert client.post("/api/agua/analisis-cloro", json={**payload, "acondicionamiento_rinser": -1}).status_code == 422
    assert client.post("/api/agua/analisis-cloro", json={**payload, "acondicionamiento_rinser": 0}).status_code == 201
    assert client.get("/api/agua/analisis-cloro").json()[0]["acondicionamiento_rinser"] == 0
