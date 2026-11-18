from datetime import date, timedelta

import pytest
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.routers.agua import router as agua_router
from backend.app.api.routers.calidad import router as calidad_router
from backend.app.api.routers.jarabe import router as jarabe_router
from backend.app.api.routers.ops import router as ops_router
from backend.app.api.routers.production import router as production_router
from backend.app.core.database import get_db
from backend.app.core.load_date import MAX_BACKDATE_DAYS, resolve_load_date
from backend.app.core.time import local_now
from backend.app.models.agua import ControlFisicoQuimico
from backend.app.models.base import Base
from backend.app.models.calidad import ControlBebida
from backend.app.models.jarabe import ControlJarabe, JarabeSimple
from backend.app.models.ops import ControlPausa, ControlTorque


def make_client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def attach_schema(connection, _):
        connection.execute("ATTACH DATABASE ':memory:' AS laboratorio")

    Base.metadata.create_all(engine)
    app = FastAPI()
    for router in (production_router, calidad_router, jarabe_router, ops_router, agua_router):
        app.include_router(router)

    def test_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = test_db
    client = TestClient(app)
    response = client.put("/api/calidad/produccion/1", json={
        "expected_version": 0, "turno": "Mañana", "sabor": "Cola",
        "concentrado": "XQ", "tamano": "500ml",
    })
    assert response.status_code == 200, response.text
    return client, engine


def bebida():
    return {
        "linea": "linea1", "production_version": 1, "marca": "Cola",
        "tipo_concentrado": "XQ", "tamano": "500ml", "carac_organolep": "OK",
        "nivel_llenado": "OK", "contenido": 500, "presion": 3, "temperatura": 4,
        "vol_gas": 3, "brix": 10, "control_videojet": "OK", "responsable": "Operador",
    }


def jarabe():
    return {
        "linea": "linea1", "production_version": 1, "sabor": "Cola", "concentrado": "XQ",
        "tanque": "1", "bx_patron": 54.2, "ta": 1.25, "responsable": "Operador",
    }


def torque():
    return {
        "linea": "linea1", "production_version": 1, "numero_cabezal": 1, "valor": 17,
        "sabor": "Cola", "responsable": "Operador", "lote_tapa": "LT-1",
    }


def pausa():
    return {"linea": "linea1", "turno": "Mañana", "motivo": "Cambio", "responsable": "Operador"}


def simple():
    return {
        "tanque": "1", "volcado_numero": 1, "cantidad_bolsas": 80, "azucar_tipo": "Común",
        "azucar_marca": "Marca", "responsables": ["Operador"],
    }


def fisico_quimico():
    return {
        "tipo_agua": "Agua de Pozo", "k": 1, "dureza": 1, "cloruros": 1, "sulfatos": 1,
        "alcalinidad": 1, "cloro_libre": 1, "ph": 7, "responsable": "Operador",
    }


# name -> (url, payload factory, model)
ENDPOINTS = {
    "bebida": ("/api/calidad/bebidas", bebida, ControlBebida),
    "jarabe": ("/api/calidad/jarabe", jarabe, ControlJarabe),
    "torque": ("/api/calidad/torque", torque, ControlTorque),
    "pausa": ("/api/calidad/pausa", pausa, ControlPausa),
    "simple": ("/api/jarabe-simple", simple, JarabeSimple),
    "fisico-quimico": ("/api/agua/fisico-quimico", fisico_quimico, ControlFisicoQuimico),
}
ALL = list(ENDPOINTS)


def post(client, name, **extra):
    url, factory, _ = ENDPOINTS[name]
    return client.post(url, json={**factory(), **extra})


def stored(engine, name, record_id):
    with Session(engine) as db:
        record = db.get(ENDPOINTS[name][2], record_id)
        return record.fecha, record.hora


def iso(days_ago):
    return (local_now().date() - timedelta(days=days_ago)).isoformat()


@pytest.mark.parametrize("name", ALL)
def test_without_fecha_records_today(name):
    client, engine = make_client()
    response = post(client, name)
    assert response.status_code == 201, response.text
    fecha, hora = stored(engine, name, response.json()["id"])
    assert fecha == local_now().date()
    assert hora is not None


@pytest.mark.parametrize("name", ALL)
@pytest.mark.parametrize("days_ago", [1, MAX_BACKDATE_DAYS])
def test_past_fecha_within_window_is_stored(name, days_ago):
    client, engine = make_client()
    response = post(client, name, fecha=iso(days_ago), hora="08:30")
    assert response.status_code == 201, response.text
    fecha, hora = stored(engine, name, response.json()["id"])
    assert fecha == local_now().date() - timedelta(days=days_ago)
    assert (hora.hour, hora.minute) == (8, 30)


@pytest.mark.parametrize("name", ALL)
def test_fecha_older_than_window_is_rejected(name):
    client, _ = make_client()
    response = post(client, name, fecha=iso(MAX_BACKDATE_DAYS + 1), hora="08:30")
    assert response.status_code == 422
    assert "anterior" in str(response.json()["detail"])


@pytest.mark.parametrize("name", ALL)
def test_future_fecha_is_rejected(name):
    client, _ = make_client()
    response = post(client, name, fecha=iso(-1), hora="08:30")
    assert response.status_code == 422
    assert "futura" in str(response.json()["detail"])


@pytest.mark.parametrize("name", ALL)
def test_past_fecha_without_hora_is_rejected(name):
    client, engine = make_client()
    response = post(client, name, fecha=iso(2))
    assert response.status_code == 422
    assert "hora" in str(response.json()["detail"])
    with Session(engine) as db:
        assert db.query(ENDPOINTS[name][2]).count() == 0


@pytest.mark.parametrize("name", ["bebida", "torque", "simple"])
def test_today_fecha_without_hora_still_defaults_to_current_time(name):
    client, engine = make_client()
    response = post(client, name, fecha=iso(0))
    assert response.status_code == 201, response.text
    assert stored(engine, name, response.json()["id"])[1] is not None


def test_resolve_load_date_unit_rules():
    today = date(2026, 11, 18)
    assert resolve_load_date(None, today=today) == today
    assert resolve_load_date(today, today=today) == today
    assert resolve_load_date(date(2026, 11, 11), "10:00", today=today) == date(2026, 11, 11)
    for bad_hora in (None, "", "   "):
        with pytest.raises(HTTPException) as error:
            resolve_load_date(date(2026, 11, 17), bad_hora, today=today)
        assert error.value.status_code == 422
    with pytest.raises(HTTPException):
        resolve_load_date(date(2026, 11, 10), "10:00", today=today)
    with pytest.raises(HTTPException):
        resolve_load_date(date(2026, 11, 19), "10:00", today=today)
