"""GET maestros endpoints — served from static/data/maestros.json, not the DB."""

import json
import os

import pytest

MAESTROS_PATH = os.path.join(
    os.path.dirname(__file__), "..", "static", "data", "maestros.json"
)


@pytest.fixture(scope="module")
def maestros():
    with open(MAESTROS_PATH, encoding="utf-8") as f:
        return json.load(f)


def test_get_marcas(client, maestros):
    resp = client.get("/api/marcas")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list) and len(data) == len(maestros["marcas"])
    for item in data:
        assert set(item.keys()) == {"id", "nombre"}
    assert [item["nombre"] for item in data] == maestros["marcas"]
    assert [item["id"] for item in data] == list(range(1, len(data) + 1))


def test_get_tipos_concentrado(client, maestros):
    resp = client.get("/api/tipos-concentrado")
    assert resp.status_code == 200
    data = resp.json()
    for item in data:
        assert set(item.keys()) == {"id", "codigo"}
    assert [item["codigo"] for item in data] == maestros["tipos_concentrado"]


def test_get_tamanos(client, maestros):
    resp = client.get("/api/tamanos")
    assert resp.status_code == 200
    data = resp.json()
    for item in data:
        assert set(item.keys()) == {"id", "valor"}
    assert [item["valor"] for item in data] == maestros["tamanos"]


def test_get_responsables(client, maestros):
    resp = client.get("/api/responsables")
    assert resp.status_code == 200
    data = resp.json()
    for item in data:
        assert set(item.keys()) == {"id", "nombre_completo"}
    assert [item["nombre_completo"] for item in data] == maestros["responsables"]


def test_get_responsables_jarabe(client, maestros):
    resp = client.get("/api/responsables-jarabe")
    assert resp.status_code == 200
    data = resp.json()
    for item in data:
        assert set(item.keys()) == {"id", "nombre_completo"}
    assert [item["nombre_completo"] for item in data] == maestros["responsables_jarabe"]


def test_get_sabores_excludes_soda_y_sifon(client, maestros):
    resp = client.get("/api/sabores")
    assert resp.status_code == 200
    data = resp.json()
    nombres = [item["nombre"] for item in data]
    # Case-insensitive exclusion of Soda/Sifon
    for nombre in nombres:
        assert nombre.strip().lower() not in ("soda", "sifon")
    expected = [
        m for m in maestros["marcas"] if m.strip().lower() not in ("soda", "sifon")
    ]
    assert nombres == expected
    assert all(set(item.keys()) == {"id", "nombre"} for item in data)


def test_get_tanques(client, maestros):
    resp = client.get("/api/tanques")
    assert resp.status_code == 200
    data = resp.json()
    for item in data:
        assert set(item.keys()) == {"id", "numero"}
    assert [str(item["numero"]) for item in data] == [str(t) for t in maestros["tanques"]]
