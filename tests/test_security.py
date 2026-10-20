import json

import pytest
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from backend.app.api.routers.auth import failures, router
from backend.app.core import auth, security

PASSWORD = "test-password-123"
PASSWORD_HASH = auth.hash_password(PASSWORD)


@pytest.fixture(autouse=True)
def configured_auth(monkeypatch):
    monkeypatch.setattr(auth, "AUTH_USERS", json.dumps({
        "ana": {"password_hash": PASSWORD_HASH, "role": "operador"},
        "jefe": {"password_hash": PASSWORD_HASH, "role": "supervisor"},
    }))
    monkeypatch.setattr(auth, "SESSION_SECRET", "a-long-test-secret-with-at-least-32-characters")
    failures.clear()


def make_client():
    app = FastAPI()
    app.middleware("http")(security.security_and_audit_middleware)
    app.include_router(router)

    @app.get("/api/resource")
    @app.post("/api/resource")
    def create_resource(request: Request):
        return {"actor": request.state.actor, "role": request.state.role}

    @app.delete("/api/resource/1")
    def delete_resource():
        return {"ok": True}

    @app.put("/api/calidad/produccion/1")
    def select_production():
        return {"ok": True}

    @app.get("/api/admin/catalogo")
    @app.patch("/api/admin/registros/1")
    def admin_resource():
        return {"ok": True}

    return TestClient(app)


def login(client, username="ana"):
    response = client.post("/api/auth/login", json={"username": username, "password": PASSWORD})
    assert response.status_code == 200
    return response


def test_forms_are_public_and_administration_requires_identity():
    client = make_client()
    for method in (client.get, client.post):
        response = method("/api/resource", headers={"X-API-Key": "secret", "X-Role": "administrador"})
        assert response.status_code == 200
        assert response.json()["actor"] is None
        assert response.headers["X-Request-ID"]
    assert client.put("/api/calidad/produccion/1").status_code == 200
    assert client.get("/api/admin/catalogo").status_code == 401
    assert client.patch("/api/admin/registros/1", json={}).status_code == 401
    assert client.delete("/api/resource/1").status_code == 401


def test_operator_cannot_promote_itself_through_headers():
    client = make_client()
    login(client)
    headers = {"X-Role": "administrador", "X-User": "jefe"}
    assert client.post("/api/resource", headers=headers).json() == {"actor": "ana", "role": "operador"}
    assert client.delete("/api/resource/1", headers=headers).status_code == 403


def test_supervisor_can_delete_and_logout_removes_browser_access():
    client = make_client()
    response = login(client, "jefe")
    cookie = response.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=strict" in cookie
    assert client.delete("/api/resource/1").status_code == 200
    assert client.get("/api/auth/session").json()["user"]["username"] == "jefe"
    assert client.post("/api/auth/logout").status_code == 200
    assert client.get("/api/resource").status_code == 200
    assert client.get("/api/admin/catalogo").status_code == 401


def test_invalid_password_and_attempt_limit():
    client = make_client()
    for _ in range(5):
        assert client.post("/api/auth/login", json={"username": "ana", "password": "wrong"}).status_code == 401
    assert client.post("/api/auth/login", json={"username": "ana", "password": PASSWORD}).status_code == 429


def test_cookie_tampering_expiration_and_password_rotation(monkeypatch):
    token = auth.issue_session("ana")
    assert auth.read_session(token)["username"] == "ana"
    assert auth.read_session(token + "x") is None
    now = auth.time.time()
    monkeypatch.setattr(auth.time, "time", lambda: now + auth.SESSION_SECONDS + 1)
    assert auth.read_session(token) is None
    monkeypatch.setattr(auth.time, "time", lambda: now)
    monkeypatch.setattr(auth, "AUTH_USERS", json.dumps({"ana": {"role": "operador", "password_hash": auth.hash_password("changed-password")}}))
    assert auth.read_session(token) is None


def test_browser_cross_origin_writes_are_rejected():
    client = make_client()
    login(client)
    assert client.post("/api/resource", headers={"Origin": "https://attacker.example"}).status_code == 403


def test_production_requires_configured_users_and_secret(monkeypatch):
    monkeypatch.setattr(auth, "ENVIRONMENT", "production")
    monkeypatch.setattr(auth, "AUTH_USERS", "{}")
    with pytest.raises(ValueError, match="AUTH_USERS"):
        auth.validate_auth_config()
    monkeypatch.setattr(auth, "AUTH_USERS", json.dumps({"ana": {"password_hash": PASSWORD_HASH, "role": "operador"}}))
    monkeypatch.setattr(auth, "SESSION_SECRET", "short")
    with pytest.raises(ValueError, match="SESSION_SECRET"):
        auth.validate_auth_config()


def test_development_without_users_cannot_delete(monkeypatch):
    monkeypatch.setattr(auth, "AUTH_USERS", "{}")
    client = make_client()
    assert client.post("/api/resource").status_code == 200
    assert client.delete("/api/resource/1", headers={"X-Role": "administrador"}).status_code == 403


@pytest.mark.parametrize("encoded", ["plain-password", "pbkdf2_sha256$1$salt$digest", 123])
def test_invalid_password_hash_configuration_is_rejected(monkeypatch, encoded):
    monkeypatch.setattr(auth, "AUTH_USERS", json.dumps({"ana": {"role": "operador", "password_hash": encoded}}))
    with pytest.raises(ValueError, match="PBKDF2"):
        auth.validate_auth_config()
