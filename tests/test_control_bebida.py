"""Tests for /api/control-bebida (current path) and legacy /api/controles."""

import re
from datetime import datetime

import pytest


def _get_records(client):
    resp = client.get("/api/control-bebida")
    assert resp.status_code == 200
    return resp.json()


EXPECTED_KEYS = {
    "id", "marca", "concentrado", "tamano", "responsable", "tanque", "linea",
    "turno", "fecha", "hora", "carac_organolep", "nivel_llenado", "contenido",
    "presion", "temperatura", "vol_gas", "grados_brix", "lote_tapa",
    "control_video_jet",
}


class TestControlBebidaCreate:

    def test_happy_path_returns_201_with_id_and_message(self, client, payloads):
        resp = client.post("/api/control-bebida", json=payloads.control_bebida())
        assert resp.status_code == 201
        body = resp.json()
        assert set(body.keys()) == {"id", "message"}
        assert isinstance(body["id"], int)
        assert body["message"] == "Control de bebida registrado con éxito"

    @pytest.mark.parametrize(
        "linea_enviada, esperado",
        [
            ("linea1", 1),
            ("linea2", 2),
            (None, 2),          # anything != "linea1" maps to 2
            ("linea3", 2),      # unknown values also fall to 2
        ],
    )
    def test_linea_mapping(self, client, payloads, linea_enviada, esperado):
        payload = payloads.control_bebida(linea=linea_enviada)
        resp = client.post("/api/control-bebida", json=payload)
        assert resp.status_code == 201
        records = _get_records(client)
        created = next(r for r in records if r["id"] == resp.json()["id"])
        assert created["linea"] == esperado

    def test_hora_empty_defaults_to_now(self, client, payloads):
        before = datetime.now()
        resp = client.post(
            "/api/control-bebida", json=payloads.control_bebida(hora=None)
        )
        assert resp.status_code == 201
        record = _get_records(client)[0]
        assert re.fullmatch(r"\d{2}:\d{2}", record["hora"])
        hh, mm = map(int, record["hora"].split(":"))
        stored = before.replace(hour=hh, minute=mm, second=0, microsecond=0)
        delta = abs((stored - before.replace(second=0, microsecond=0)).total_seconds())
        assert delta < 120  # within a couple of minutes of test execution

    def test_hora_invalid_falls_back_silently_to_now(self, client, payloads):
        resp = client.post(
            "/api/control-bebida", json=payloads.control_bebida(hora="99:99")
        )
        assert resp.status_code == 201  # no validation error — silent fallback
        record = _get_records(client)[0]
        assert re.fullmatch(r"\d{2}:\d{2}", record["hora"])
        assert record["hora"] != "99:99"

    def test_turno_stored_verbatim_without_normalization(self, client, payloads):
        # FINDING: control-bebida does NOT normalize turno (torque/pausas DO).
        resp = client.post(
            "/api/control-bebida", json=payloads.control_bebida(turno="mañana")
        )
        assert resp.status_code == 201
        record = _get_records(client)[0]
        assert record["turno"] == "mañana"  # stored exactly as sent

    def test_stored_values_round_trip_via_get(self, client, payloads):
        payload = payloads.control_bebida()
        created = client.post("/api/control-bebida", json=payload).json()
        record = _get_records(client)[0]
        assert record["id"] == created["id"]
        assert record["marca"] == "Cola"
        assert record["concentrado"] == "KG"
        assert record["tamano"] == "2L"
        assert record["responsable"] == "Moya Luis"
        assert record["tanque"] == "7"
        assert record["turno"] == "Mañana"
        assert record["fecha"] == datetime.now().strftime("%Y-%m-%d")
        assert record["hora"] == "08:30"
        assert record["contenido"] == 2250.0
        assert record["grados_brix"] == 11.8
        assert record["control_video_jet"] == "okey"


class TestControlBebidaList:

    def test_returns_list_desc_with_expected_keys_and_formatted_hora(self, client, payloads):
        for i in range(3):
            resp = client.post("/api/control-bebida", json=payloads.control_bebida())
            assert resp.status_code == 201

        records = _get_records(client)
        assert len(records) == 3
        ids = [r["id"] for r in records]
        assert ids == sorted(ids, reverse=True)  # ordered desc by id
        for record in records:
            assert set(record.keys()) == EXPECTED_KEYS
            assert re.fullmatch(r"\d{2}:\d{2}", record["hora"])  # %H:%M format
            assert isinstance(record["linea"], int)


class TestControlBebidaDelete:

    def test_delete_existing_succeeds(self, client, payloads):
        created = client.post("/api/control-bebida", json=payloads.control_bebida()).json()
        resp = client.delete(f"/api/control-bebida/{created['id']}")
        assert resp.status_code == 200
        assert resp.json() == {"message": "Registro eliminado con éxito"}
        assert all(r["id"] != created["id"] for r in _get_records(client))

    def test_delete_nonexistent_returns_404(self, client):
        resp = client.delete("/api/control-bebida/999999")
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Registro de control de bebida no encontrado"


class TestValidation:

    def test_missing_required_marca_returns_422(self, client, payloads):
        payload = payloads.control_bebida()
        del payload["marca"]
        resp = client.post("/api/control-bebida", json=payload)
        assert resp.status_code == 422

    @pytest.mark.parametrize("campo", ["contenido", "presion", "temperatura"])
    def test_non_float_numeric_fields_return_422(self, client, payloads, campo):
        payload = payloads.control_bebida(**{campo: "not-a-number"})
        resp = client.post("/api/control-bebida", json=payload)
        assert resp.status_code == 422


class TestLegacyControles:

    LEGACY_RESPONSE_FIELDS = {
        "id", "fecha_registro", "hora", "carac_organolep", "nivel_llenado",
        "contenido", "presion", "temperatura", "vol_gas", "brix",
        "control_videojet", "responsable", "marca", "tipo_concentrado",
        "tamano", "lote_tapa",
    }

    def test_post_legacy_controles_returns_201_with_response_model_fields(
        self, client, payloads
    ):
        resp = client.post("/api/controles", json=payloads.control_bebida())
        assert resp.status_code == 201
        body = resp.json()
        assert set(body.keys()) == self.LEGACY_RESPONSE_FIELDS
        assert body["marca"] == "Cola"
        assert body["brix"] == 11.8
        assert body["hora"] == "08:30"
        assert body["fecha_registro"] is not None

    def test_get_legacy_controles_ordered_desc(self, client, payloads):
        for _ in range(2):
            assert client.post("/api/controles", json=payloads.control_bebida()).status_code == 201
        resp = client.get("/api/controles")
        assert resp.status_code == 200
        data = resp.json()
        ids = [r["id"] for r in data]
        assert ids == sorted(ids, reverse=True)

    def test_delete_legacy_nonexistent_returns_404(self, client):
        resp = client.delete("/api/controles/424242")
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Registro de control no encontrado"

    def test_legacy_and_control_bebida_are_independent_tables(self, client, payloads):
        client.post("/api/controles", json=payloads.control_bebida())
        client.post("/api/control-bebida", json=payloads.control_bebida())
        assert len(client.get("/api/controles").json()) == 1
        assert len(client.get("/api/control-bebida").json()) == 1
