import pytest

from backend.app.schemas.ops import TORQUE_HEADS_BY_LINE
from tests.test_load_date import make_client


def open_line(client, line):
    response = client.put(f"/api/calidad/produccion/{line}", json={
        "expected_version": 0, "turno": "Mañana", "sabor": "Cola",
        "concentrado": "XQ", "tamano": "500ml",
    })
    assert response.status_code == 200, response.text


def post_torque(client, line, head):
    return client.post("/api/calidad/torque", json={
        "linea": f"linea{line}", "production_version": 1, "numero_cabezal": head,
        "valor": 17, "sabor": "Cola", "responsable": "Operador", "lote_tapa": "LT-1",
    })


def test_heads_per_line():
    assert TORQUE_HEADS_BY_LINE == {1: 12, 2: 14, 3: 16}


@pytest.mark.parametrize("line", [1, 2, 3])
def test_last_head_of_each_line_is_accepted(line):
    client, _ = make_client()
    if line != 1:
        open_line(client, line)
    response = post_torque(client, line, TORQUE_HEADS_BY_LINE[line])
    assert response.status_code == 201, response.text


@pytest.mark.parametrize("line", [1, 2, 3])
def test_head_beyond_line_capacity_is_rejected(line):
    client, _ = make_client()
    if line != 1:
        open_line(client, line)
    response = post_torque(client, line, TORQUE_HEADS_BY_LINE[line] + 1)
    assert response.status_code == 422
    assert "cabezal" in str(response.json()["detail"]).lower()
