from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.routers.calidad import router as calidad_router
from backend.app.api.routers.jarabe import router as jarabe_router
from backend.app.api.routers.ops import router as ops_router
from backend.app.api.routers.production import router as production_router
from backend.app.core.database import get_db
from backend.app.models.base import Base
from backend.app.models.calidad import ControlBebida
from backend.app.models.jarabe import ControlJarabe
from backend.app.models.production import ControlProduccion


def make_client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def attach_schema(connection, _):
        connection.execute("ATTACH DATABASE ':memory:' AS laboratorio")

    Base.metadata.create_all(engine)
    app = FastAPI()
    for router in (production_router, calidad_router, jarabe_router, ops_router):
        app.include_router(router)

    def test_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = test_db
    return TestClient(app), engine


def production(sabor, expected_version=0):
    return {
        "expected_version": expected_version, "turno": "Mañana", "sabor": sabor,
        "concentrado": "XQ" if sabor == "Cola" else "TALCA",
        "tamano": "500ml",
    }


def test_lines_are_independent_and_stale_updates_rejected():
    client, _ = make_client()
    assert client.get("/api/calidad/produccion/1").json()["version"] == 0
    one = client.put("/api/calidad/produccion/1", json=production("Cola"))
    two = client.put("/api/calidad/produccion/2", json=production("Soda"))
    assert one.status_code == two.status_code == 200
    assert client.get("/api/calidad/produccion/1").json()["sabor"] == "Cola"
    assert client.get("/api/calidad/produccion/2").json()["sabor"] == "Soda"
    assert client.put("/api/calidad/produccion/1", json=production("Soda", 1)).json()["version"] == 2
    assert client.put("/api/calidad/produccion/1", json=production("Cola", 1)).status_code == 409
    assert client.get("/api/calidad/produccion/2").json()["version"] == 1


def test_controls_use_server_snapshot_and_reject_stale_production():
    client, engine = make_client()
    client.put("/api/calidad/produccion/1", json=production("Cola"))
    beverage = {
        "linea": "linea1", "production_version": 1, "turno": "Noche",
        "marca": "Soda", "tipo_concentrado": "TALCA", "tamano": "500ml", "lote_tapa": "LT-BEBIDA-1",
        "carac_organolep": "OK", "nivel_llenado": "OK", "contenido": 500, "presion": 3,
        "temperatura": 4, "vol_gas": 3, "brix": 10, "control_videojet": "OK", "responsable": "Operador",
    }
    response = client.post("/api/calidad/bebidas", json=beverage)
    assert response.status_code == 201, response.text
    with Session(engine) as db:
        control = db.get(ControlBebida, response.json()["id"])
        snapshot = db.query(ControlProduccion).filter_by(tipo_control="bebida", control_id=control.id).one()
        assert (control.marca, control.turno, control.lote_tapa) == ("Cola", "Mañana", "LT-BEBIDA-1")
        assert (snapshot.linea, snapshot.produccion_version) == (1, 1)
        assert snapshot.lote_tapa == "LT-BEBIDA-1"

    client.put("/api/calidad/produccion/1", json=production("Soda", 1))
    assert client.post("/api/calidad/bebidas", json=beverage).status_code == 409

    syrup = {
        "linea": "linea1", "production_version": 2, "turno": "Noche", "sabor": "Cola",
        "concentrado": "XQ", "tanque": "1", "bx_patron": 54.2, "ta": 1.25,
        "responsable": "Operador",
    }
    syrup_response = client.post("/api/calidad/jarabe", json=syrup)
    assert syrup_response.status_code == 201, syrup_response.text
    with Session(engine) as db:
        control = db.get(ControlJarabe, syrup_response.json()["id"])
        snapshot = db.query(ControlProduccion).filter_by(tipo_control="jarabe", control_id=control.id).one()
        assert (control.sabor, control.turno) == ("Soda", "Mañana")
        assert (snapshot.linea, snapshot.produccion_version) == (1, 2)
        assert snapshot.lote_tapa == ""
