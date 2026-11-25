import json
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.routers.administracion import router as admin_router
from backend.app.api.routers.maestros import router as maestros_router
from backend.app.core import auth
from backend.app.core.database import get_db
from backend.app.models import Base
from backend.app.models.auditoria import CambioRegistro
from backend.app.models.responsables import Responsable
from backend.app.services.responsables import seed_responsables


def make_client(monkeypatch, user="admin"):
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
    monkeypatch.setattr(auth, "SESSION_SECRET", "test-admin-secret-at-least-32-characters")
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    ).execution_options(schema_translate_map={"laboratorio": None})
    Base.metadata.create_all(engine)
    app = FastAPI()
    app.include_router(admin_router)
    app.include_router(maestros_router)

    def database(request: Request):
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = database
    client = TestClient(app)
    if user:
        client.cookies.set(auth.COOKIE_NAME, auth.issue_session(user))
    return client, engine


@pytest.fixture
def admin(monkeypatch):
    client, engine = make_client(monkeypatch)
    with Session(engine) as db:
        seed_responsables(db)
    yield client, engine
    engine.dispose()


def names(response, modulo):
    return [r["nombre"] for r in response.json()[modulo]]


def test_admin_endpoints_require_authentication_and_admin_role(monkeypatch):
    anonymous, engine = make_client(monkeypatch, user=None)
    assert anonymous.get("/api/admin/responsables").status_code == 401
    assert anonymous.post("/api/admin/responsables", json={"modulo": "agua", "nombre": "X"}).status_code == 401
    assert anonymous.delete("/api/admin/responsables/1").status_code == 401
    for username in ("ana", "jefe"):
        client, _ = make_client(monkeypatch, user=username)
        assert client.get("/api/admin/responsables").status_code == 403
        assert client.post("/api/admin/responsables", json={"modulo": "agua", "nombre": "X"}).status_code == 403
        assert client.delete("/api/admin/responsables/1").status_code == 403
    engine.dispose()


def test_list_is_grouped_by_module_and_filterable(admin):
    client, _ = admin
    body = client.get("/api/admin/responsables").json()
    assert set(body) == {"calidad", "agua", "jarabe"}
    assert "Moya Luis" in names(client.get("/api/admin/responsables"), "calidad")
    assert "Gustavo Funes" in names(client.get("/api/admin/responsables"), "jarabe")
    filtered = client.get("/api/admin/responsables", params={"modulo": "agua"}).json()
    assert set(filtered) == {"agua"}
    assert {"id", "nombre"} <= set(filtered["agua"][0])
    assert client.get("/api/admin/responsables", params={"modulo": "otro"}).status_code == 422


def test_add_trims_name_persists_and_audits(admin):
    client, engine = admin
    response = client.post("/api/admin/responsables", json={"modulo": "agua", "nombre": "  Perez Juan  "})
    assert response.status_code == 201
    assert response.json()["nombre"] == "Perez Juan"
    assert "Perez Juan" in names(client.get("/api/admin/responsables"), "agua")
    assert "Perez Juan" not in names(client.get("/api/admin/responsables"), "calidad")
    with Session(engine) as db:
        change = db.query(CambioRegistro).filter_by(formulario="responsables").one()
        assert change.usuario == "admin"
        assert change.nuevos["nombre"] == "Perez Juan"


def test_duplicate_in_same_module_is_rejected_but_allowed_across_modules(admin):
    client, _ = admin
    assert client.post("/api/admin/responsables", json={"modulo": "calidad", "nombre": "Moya Luis"}).status_code == 409
    assert client.post("/api/admin/responsables", json={"modulo": "calidad", "nombre": " Moya Luis "}).status_code == 409
    assert client.post("/api/admin/responsables", json={"modulo": "jarabe", "nombre": "Moya Luis"}).status_code == 201


@pytest.mark.parametrize(
    "payload",
    [
        {"modulo": "agua", "nombre": ""},
        {"modulo": "agua", "nombre": "   "},
        {"modulo": "agua", "nombre": "x" * 101},
        {"modulo": "otro", "nombre": "Perez Juan"},
        {"nombre": "Perez Juan"},
    ],
)
def test_invalid_payload_is_422(admin, payload):
    client, _ = admin
    assert client.post("/api/admin/responsables", json=payload).status_code == 422


def test_delete_removes_person_and_audits(admin):
    client, engine = admin
    target = client.get("/api/admin/responsables", params={"modulo": "agua"}).json()["agua"][0]
    assert client.delete(f"/api/admin/responsables/{target['id']}").status_code == 200
    assert target["nombre"] not in names(client.get("/api/admin/responsables"), "agua")
    assert target["nombre"] in names(client.get("/api/admin/responsables"), "calidad")
    with Session(engine) as db:
        change = db.query(CambioRegistro).filter_by(formulario="responsables").one()
        assert change.anteriores["nombre"] == target["nombre"]
        assert change.nuevos == {"eliminado": True}


def test_delete_unknown_is_404(admin):
    client, _ = admin
    assert client.delete("/api/admin/responsables/99999").status_code == 404


def test_maestros_endpoints_reflect_database(admin):
    client, _ = admin
    client.post("/api/admin/responsables", json={"modulo": "calidad", "nombre": "Nuevo Calidad"})
    client.post("/api/admin/responsables", json={"modulo": "agua", "nombre": "Nuevo Agua"})
    client.post("/api/admin/responsables", json={"modulo": "jarabe", "nombre": "Nuevo Jarabe"})
    calidad = client.get("/api/responsables").json()
    assert calidad[0] == {"id": 1, "nombre_completo": "Moya Luis"}
    assert "Nuevo Calidad" in [r["nombre_completo"] for r in calidad]
    assert "Nuevo Agua" not in [r["nombre_completo"] for r in calidad]
    assert "Nuevo Jarabe" in [r["nombre_completo"] for r in client.get("/api/responsables-jarabe").json()]
    agua = client.get("/api/responsables-agua").json()
    assert "Nuevo Agua" in [r["nombre_completo"] for r in agua]
    assert "Nuevo Calidad" not in [r["nombre_completo"] for r in agua]
    removed = client.get("/api/admin/responsables", params={"modulo": "calidad"}).json()["calidad"][0]
    client.delete(f"/api/admin/responsables/{removed['id']}")
    assert removed["nombre"] not in [r["nombre_completo"] for r in client.get("/api/responsables").json()]


def test_seed_runs_only_when_table_is_empty(admin):
    _client, engine = admin
    with Session(engine) as db:
        before = db.query(Responsable).count()
        assert seed_responsables(db) is False
        assert db.query(Responsable).count() == before


def test_migration_creates_and_seeds_responsables_table():
    config = Config()
    config.set_main_option("script_location", str(Path(__file__).resolve().parents[1] / "migrations"))
    engine = create_engine("sqlite://")
    with engine.begin() as raw:
        connection = raw.execution_options(schema_translate_map={"laboratorio": None})
        config.attributes["connection"] = connection
        command.upgrade(config, "head")
        command.upgrade(config, "head")
        total = connection.execute(text("SELECT COUNT(*) FROM responsables")).scalar_one()
        assert total >= 18
        assert connection.execute(
            text("SELECT COUNT(*) FROM responsables WHERE modulo='agua' AND nombre='Moya Luis'")
        ).scalar_one() == 1
