from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.app.core import security


def make_client():
    app = FastAPI()
    app.middleware("http")(security.security_and_audit_middleware)

    @app.post("/api/resource")
    def create_resource():
        return {"ok": True}

    @app.delete("/api/resource/1")
    def delete_resource():
        return {"ok": True}

    return TestClient(app)


def test_write_protection_rejects_invalid_key(monkeypatch):
    monkeypatch.setattr(security, "API_KEY", "secret")
    response = make_client().post("/api/resource", headers={"X-API-Key": "wrong"})
    assert response.status_code == 401
    assert response.headers["X-Request-ID"]


def test_operator_can_create_but_cannot_delete(monkeypatch):
    monkeypatch.setattr(security, "API_KEY", "secret")
    client = make_client()
    headers = {"X-API-Key": "secret", "X-Role": "operador", "X-User": "Ana"}
    assert client.post("/api/resource", headers=headers).status_code == 200
    assert client.delete("/api/resource/1", headers=headers).status_code == 403


def test_supervisor_can_delete(monkeypatch):
    monkeypatch.setattr(security, "API_KEY", "secret")
    response = make_client().delete(
        "/api/resource/1",
        headers={"X-API-Key": "secret", "X-Role": "supervisor"},
    )
    assert response.status_code == 200
