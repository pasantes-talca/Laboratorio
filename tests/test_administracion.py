import json
from datetime import date, datetime, time, timezone

import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from sqlalchemy import Boolean, Date, DateTime, Float, Integer, Time, create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.routers.administracion import router
from backend.app.core import auth
from backend.app.core.database import get_db
from backend.app.models import Base
from backend.app.models.auditoria import AutorRegistro, CambioRegistro
from backend.app.models.production import ControlProduccion
from backend.app.services.admin_catalog import FORMS, OPTIONS, array_field


@pytest.fixture
def admin(monkeypatch):
    monkeypatch.setattr(
        auth,
        "AUTH_USERS",
        json.dumps(
            {
                name: {"role": role, "password_hash": "test-fingerprint"}
                for name, role in [
                    ("admin", "administrador"),
                    ("ana", "operador"),
                    ("jefe", "supervisor"),
                ]
            }
        ),
    )
    monkeypatch.setattr(
        auth, "SESSION_SECRET", "test-admin-secret-at-least-32-characters"
    )
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    ).execution_options(schema_translate_map={"laboratorio": None})
    Base.metadata.create_all(engine)
    app = FastAPI()
    app.include_router(router)

    def database(request: Request):
        with Session(engine) as db:
            db.info["actor"] = "ana"
            yield db

    app.dependency_overrides[get_db] = database
    client = TestClient(app)
    client.cookies.set(auth.COOKIE_NAME, auth.issue_session("admin"))
    yield client, engine
    engine.dispose()


def sample(form_id, model):
    result = {}
    for c in model.__table__.columns:
        if c.name == "id":
            continue
        if c.name in OPTIONS:
            value = OPTIONS[c.name][0]
        elif array_field(c):
            value = json.dumps(
                ["1"] if c.name in {"azucar_ntu", "volcado_numero"} else ["Operador"]
            )
        elif isinstance(c.type, Boolean):
            value = True
        elif isinstance(c.type, DateTime):
            value = datetime(2026, 10, 20, 8, 30, tzinfo=timezone.utc)
        elif isinstance(c.type, Date):
            value = date(2026, 10, 20)
        elif isinstance(c.type, Time):
            value = time(8, 30)
        elif isinstance(c.type, (Integer, Float)):
            value = 1
        else:
            value = "Ejemplo"
        result[c.name] = value
    result.update(
        {
            k: v
            for k, v in {
                "marca": "Cola",
                "sabor": "Cola",
                "concentrado": "XQ",
                "tamano": "3L",
                "p_select": "P1",
                "responsable": "Otro responsable",
            }.items()
            if k in result
        }
    )
    return model(**result)


def insert(engine, form_id):
    with Session(engine) as db:
        db.info["actor"] = "ana"
        record = sample(form_id, FORMS[form_id][2])
        db.add(record)
        db.commit()
        return record.id


@pytest.mark.parametrize("form_id", list(FORMS))
def test_all_forms_list_edit_and_history(admin, form_id):
    client, engine = admin
    id_ = insert(engine, form_id)
    url = f"/api/admin/{form_id}/registros"
    listing = client.get(url).json()
    assert listing["total"] == 1
    row = listing["items"][0]
    assert row["created_by"] == "ana"
    key = (
        "responsable"
        if "responsable" in row["values"]
        else "responsables"
        if "responsables" in row["values"]
        else "k"
        if "k" in row["values"]
        else "presion_interno"
    )
    value = (
        ["Corregido"]
        if key == "responsables"
        else "Corregido"
        if key == "responsable"
        else 2
    )
    body = {
        "valores": {key: value},
        "motivo": "Corrección de carga",
        "expected_version": row["version"],
    }
    response = client.patch(f"{url}/{id_}", json=body)
    assert response.status_code == 200, response.text
    edited = response.json()
    assert edited["created_by"] == "ana"
    assert edited["version"] == 2
    assert edited["values"][key] == value
    assert edited["history"][0]["user"] == "admin"
    assert edited["history"][0]["before"][key] == row["values"][key]
    assert client.patch(f"{url}/{id_}", json=body).status_code == 409
    assert len(client.get(f"{url}/{id_}").json()["history"]) == 1


@pytest.mark.parametrize("username,status", [(None, 401), ("ana", 403), ("jefe", 403)])
def test_admin_only_even_with_spoofed_headers(admin, username, status):
    client, _ = admin
    client.cookies.clear()
    if username:
        client.cookies.set(auth.COOKIE_NAME, auth.issue_session(username))
    for url in [
        "/api/admin/catalogo",
        "/api/admin/agua-cloro/registros",
        "/api/admin/agua-cloro/registros/1",
    ]:
        assert (
            client.get(
                url, headers={"X-Role": "administrador", "X-User": "admin"}
            ).status_code
            == status
        )
    assert (
        client.patch(
            "/api/admin/agua-cloro/registros/1",
            json={},
            headers={"X-Role": "administrador"},
        ).status_code
        == status
    )


def test_validation_does_not_mutate_or_audit(admin):
    client, engine = admin
    id_ = insert(engine, "agua-fisico-quimico")
    url = f"/api/admin/agua-fisico-quimico/registros/{id_}"
    for values in [
        {"ph": 15},
        {"k": -1},
        {"id": 2},
        {"fecha_registro": "2020"},
        {"unknown": 1},
        {"responsable": ""},
    ]:
        response = client.patch(
            url, json={"valores": values, "motivo": "Corrección", "expected_version": 1}
        )
        assert response.status_code == 422, response.text
    assert (
        client.patch(
            url, json={"valores": {"ph": 1}, "motivo": "   ", "expected_version": 1}
        ).status_code
        == 422
    )
    assert client.get(url).json()["history"] == []
    assert client.get(url).json()["values"]["ph"] == 1


def test_unknown_author_and_filters(admin):
    client, engine = admin
    id_ = insert(engine, "agua-cloro")
    with Session(engine) as db:
        db.delete(db.get(AutorRegistro, ("agua-cloro", id_)))
        db.commit()
    url = "/api/admin/agua-cloro/registros"
    row = client.get(url).json()["items"][0]
    assert row["created_by"] is None and row["version"] == 0
    assert client.get(url, params={"usuario": "ana"}).json()["total"] == 0
    assert client.get(url, params={"desde": "2026-10-21"}).json()["total"] == 0
    assert client.get(url, params={"hasta": "2026-10-20"}).json()["total"] == 1
    assert client.get(url, params={"q": "%"}).json()["total"] == 0
    assert client.get(url, params={"offset": 1, "limit": 1}).json()["items"] == []
    response = client.patch(
        f"{url}/{id_}",
        json={
            "valores": {"acondicionamiento_rinser": 3},
            "motivo": "Corregir presión",
            "expected_version": 0,
        },
    )
    assert response.status_code == 200
    assert response.json()["created_by"] is None
    assert client.get("/api/admin/inexistente/registros").status_code == 404
    assert len(client.get("/api/admin/catalogo").json()) == 13


def test_rollback_does_not_keep_author():
    engine = create_engine("sqlite://").execution_options(
        schema_translate_map={"laboratorio": None}
    )
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        db.add(sample("agua-cloro", FORMS["agua-cloro"][2]))
        db.flush()
        db.rollback()
        assert db.query(AutorRegistro).count() == 0
        assert db.query(CambioRegistro).count() == 0
    engine.dispose()


@pytest.mark.parametrize("form_id", list(FORMS))
def test_admin_delete_removes_record_and_keeps_snapshot(admin, form_id):
    client, engine = admin
    record_id = insert(engine, form_id)
    url = f"/api/admin/{form_id}/registros/{record_id}"
    original = client.get(url).json()
    stale = client.request("DELETE", url, json={"expected_version": 999})
    assert stale.status_code == 409
    assert client.get(url).status_code == 200
    response = client.request(
        "DELETE", url, json={"expected_version": original["version"]}
    )
    assert response.status_code == 200, response.text
    assert client.get(url).status_code == 404
    assert client.get(f"/api/admin/{form_id}/registros").json()["total"] == 0
    assert (
        client.request(
            "DELETE", url, json={"expected_version": original["version"]}
        ).status_code
        == 404
    )
    with Session(engine) as db:
        event = db.query(CambioRegistro).one()
        assert event.usuario == "admin"
        assert event.anteriores == original["values"]
        assert event.nuevos == {"eliminado": True}


@pytest.mark.parametrize("username,status", [(None, 401), ("ana", 403), ("jefe", 403)])
def test_delete_requires_administrator(admin, username, status):
    client, engine = admin
    record_id = insert(engine, "agua-cloro")
    client.cookies.clear()
    if username:
        client.cookies.set(auth.COOKIE_NAME, auth.issue_session(username))
    response = client.request(
        "DELETE",
        f"/api/admin/agua-cloro/registros/{record_id}",
        json={"expected_version": 1},
        headers={"X-Role": "administrador"},
    )
    assert response.status_code == status
    with Session(engine) as db:
        assert db.get(FORMS["agua-cloro"][2], record_id) is not None
        assert db.query(CambioRegistro).count() == 0


def test_bottle_lot_remains_consistent_with_production_snapshot(admin):
    client, engine = admin
    record_id = insert(engine, "calidad-bebida")
    with Session(engine) as db:
        db.add(
            ControlProduccion(
                tipo_control="bebida",
                control_id=record_id,
                linea=1,
                produccion_version=1,
                turno="Mañana",
                sabor="Cola",
                concentrado="XQ",
                tamano="3L",
                lote_tapa="Ejemplo",
            )
        )
        db.commit()
    url = f"/api/admin/calidad-bebida/registros/{record_id}"
    body = {
        "valores": {"linea": 2},
        "expected_version": 1,
        "motivo": "Cambio de prueba",
    }
    assert client.patch(url, json=body).status_code == 422
    body["valores"] = {"lote_tapa": "LOTE-CORREGIDO"}
    assert client.patch(url, json=body).status_code == 200
    with Session(engine) as db:
        assert db.query(ControlProduccion).one().lote_tapa == "LOTE-CORREGIDO"
        assert db.query(ControlProduccion).one().linea == 1
    assert (
        client.request("DELETE", url, json={"expected_version": 2}).status_code == 200
    )
    with Session(engine) as db:
        assert db.query(ControlProduccion).count() == 0


def test_normal_form_creation_records_signed_in_user_not_responsible(
    admin, monkeypatch
):
    from sqlalchemy.orm import sessionmaker

    from backend.app.api.routers.agua import router as agua_router
    from backend.app.core import database, security

    _client, engine = admin
    monkeypatch.setattr(database, "SessionLocal", sessionmaker(bind=engine))
    app = FastAPI()
    app.middleware("http")(security.security_and_audit_middleware)
    app.include_router(agua_router)
    app.include_router(router)
    client = TestClient(app)
    client.cookies.set(auth.COOKIE_NAME, auth.issue_session("ana"))
    response = client.post(
        "/api/agua/analisis-cloro",
        json={
            "tanque_agua_osmosis": 1,
            "filtro_carbon_a": "Cumple",
            "filtro_carbon_b": "Cumple",
            "filtro_carbon_c": "Cumple",
            "cloro_riser_linea": "Linea 1",
            "cloro_riser_resultado": 1,
            "responsable": "Otra persona",
        },
        headers={"X-User": "admin", "X-Role": "administrador"},
    )
    assert response.status_code == 201
    client.cookies.set(auth.COOKIE_NAME, auth.issue_session("admin"))
    row = client.get("/api/admin/agua-cloro/registros").json()["items"][0]
    assert row["created_by"] == "ana"
    assert row["values"]["responsable"] == "Otra persona"
    client.cookies.clear()
    response = client.post(
        "/api/agua/analisis-cloro",
        json={
            "tanque_agua_osmosis": 1,
            "filtro_carbon_a": "Cumple",
            "filtro_carbon_b": "Cumple",
            "filtro_carbon_c": "Cumple",
            "cloro_riser_linea": "Linea 1",
            "cloro_riser_resultado": 1,
            "responsable": "Carga abierta",
        },
    )
    assert response.status_code == 201
    assert client.get("/api/admin/catalogo").status_code == 401
    client.cookies.set(auth.COOKIE_NAME, auth.issue_session("admin"))
    row = client.get("/api/admin/agua-cloro/registros").json()["items"][0]
    assert row["created_by"] is None
    assert row["values"]["responsable"] == "Carga abierta"
