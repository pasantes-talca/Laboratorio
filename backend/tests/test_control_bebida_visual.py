import pytest
from fastapi.testclient import TestClient
from main import app


def test_control_bebida_bottle_visual():
    client = TestClient(app)
    payload = {
        "marca": "Talca",
        "tipo_concentrado": "IFF",
        "tamano": "2L",
        "lote_tapa": "Block",
        "hora": "10:00",
        "turno": "Mañana",
        "linea": "linea1",
        "carac_organolep": "okey",
        "nivel_llenado": "ok",
        "contenido": 10.0,
        "presion": 5.0,
        "temperatura": 25.0,
        "vol_gas": 0.5,
        "brix": 3.5,
        "control_videojet": "okey",
        "responsable": "Juan"
}
    }
    resp = client.post("/api/control-bebida", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "bottle_visual" in data
    bv = data["bottle_visual"]
    assert bv["brand"] == "Talca"
    assert bv["color"] == "#00FF00"
    assert bv["label"] == "talca"
