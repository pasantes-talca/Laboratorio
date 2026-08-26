"""Tests for /api/controles-jarabe, /api/jarabe-simple and /api/jarabe-terminado."""

import json
from datetime import datetime

import pytest


class TestControlesJarabe:

    EXPECTED_KEYS = {
        "id", "turno", "fecha", "hora", "sabor", "concentrado", "tanque",
        "bx_patron", "ta", "responsable", "observacion",
    }

    def test_post_happy_path(self, client, payloads):
        resp = client.post("/api/controles-jarabe", json=payloads.control_jarabe())
        assert resp.status_code == 201
        body = resp.json()
        assert set(body.keys()) == {"id", "message"}
        assert isinstance(body["id"], int)
        assert body["message"] == "Control de jarabe registrado con éxito"

    def test_tanque_is_stripped(self, client, payloads):
        created = client.post(
            "/api/controles-jarabe", json=payloads.control_jarabe(tanque="  8  ")
        ).json()
        resp = client.get("/api/controles-jarabe")
        record = next(r for r in resp.json() if r["id"] == created["id"])
        assert record["tanque"] == "8"

    def test_observacion_whitespace_only_stored_as_null(self, client, payloads):
        created = client.post(
            "/api/controles-jarabe",
            json=payloads.control_jarabe(observacion="   \n\t "),
        ).json()
        record = next(
            r for r in client.get("/api/controles-jarabe").json()
            if r["id"] == created["id"]
        )
        assert record["observacion"] is None

    def test_numero_carga_trilay_whitespace_only_stored_as_null(self, client, payloads):
        # NOTE: numero_carga_trilay is NOT exposed by the GET endpoint; verify
        # via direct DB access.
        import database
        from sqlalchemy import text

        created = client.post(
            "/api/controles-jarabe",
            json=payloads.control_jarabe(numero_carga_trilay="   "),
        ).json()
        with database.engine.connect() as conn:
            value = conn.execute(
                text("SELECT numero_carga_trilay FROM laboratorio.control_jarabe WHERE id = :id"),
                {"id": created["id"]},
            ).scalar_one()
        assert value is None

    def test_get_keys_desc_order_and_float_fields(self, client, payloads):
        for _ in range(2):
            assert client.post(
                "/api/controles-jarabe", json=payloads.control_jarabe(bx_patron=61.2, ta=1.1)
            ).status_code == 201
        records = client.get("/api/controles-jarabe").json()
        ids = [r["id"] for r in records]
        assert ids == sorted(ids, reverse=True)
        for record in records:
            assert set(record.keys()) == self.EXPECTED_KEYS
            assert isinstance(record["bx_patron"], float)
            assert isinstance(record["ta"], float)

    def test_delete_existing(self, client, payloads):
        created = client.post(
            "/api/controles-jarabe", json=payloads.control_jarabe()
        ).json()
        resp = client.delete(f"/api/controles-jarabe/{created['id']}")
        assert resp.status_code == 200
        assert resp.json() == {"message": "Registro eliminado con éxito"}
        assert all(r["id"] != created["id"] for r in client.get("/api/controles-jarabe").json())

    def test_delete_nonexistent_returns_404(self, client):
        resp = client.delete("/api/controles-jarabe/777777")
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Registro de jarabe no encontrado"


class TestJarabeSimple:

    EXPECTED_KEYS = {
        "id", "fecha", "hora", "tanque", "volcado_numero", "cantidad_bolsas",
        "azucar_tipo", "azucar_marca", "responsables",
    }

    def test_post_happy_path(self, client, payloads):
        resp = client.post("/api/jarabe-simple", json=payloads.jarabe_simple())
        assert resp.status_code == 201
        body = resp.json()
        assert body["message"] == "Jarabe Simple registrado con éxito"

    def test_invalid_fecha_falls_back_to_today_and_still_creates(self, client, payloads):
        resp = client.post(
            "/api/jarabe-simple", json=payloads.jarabe_simple(fecha="not-a-date")
        )
        assert resp.status_code == 201
        records = client.get("/api/jarabe-simple").json()
        assert len(records) == 1
        assert records[0]["fecha"] == datetime.now().strftime("%Y-%m-%d")

    def test_responsables_serialized_as_json_string_round_trips(self, client, payloads):
        responsables = ["Carlos Videla", "Pedro Guerra"]
        client.post(
            "/api/jarabe-simple",
            json=payloads.jarabe_simple(responsables=responsables),
        )
        record = client.get("/api/jarabe-simple").json()[0]
        assert isinstance(record["responsables"], str)
        assert json.loads(record["responsables"]) == responsables
        assert record["responsables"] == json.dumps(responsables, ensure_ascii=False)

    def test_get_filters_by_tanque(self, client, payloads):
        client.post("/api/jarabe-simple", json=payloads.jarabe_simple(tanque="9"))
        client.post("/api/jarabe-simple", json=payloads.jarabe_simple(tanque="10"))
        resp = client.get("/api/jarabe-simple", params={"tanque": "9"})
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["tanque"] == "9"

    def test_get_filters_by_fecha_iso(self, client, payloads):
        client.post("/api/jarabe-simple", json=payloads.jarabe_simple(fecha="2026-08-25"))
        client.post("/api/jarabe-simple", json=payloads.jarabe_simple(fecha="2026-08-20"))
        resp = client.get("/api/jarabe-simple", params={"fecha": "2026-08-20"})
        data = resp.json()
        assert len(data) == 1
        assert data[0]["fecha"] == "2026-08-20"

    def test_get_invalid_fecha_param_is_ignored_returns_all(self, client, payloads):
        client.post("/api/jarabe-simple", json=payloads.jarabe_simple(fecha="2026-08-25"))
        client.post("/api/jarabe-simple", json=payloads.jarabe_simple(fecha="2026-08-20"))
        resp = client.get("/api/jarabe-simple", params={"fecha": "not-a-date"})
        assert resp.status_code == 200
        assert len(resp.json()) == 2

    def test_get_no_filter_returns_all_ordered_desc(self, client, payloads):
        for _ in range(3):
            client.post("/api/jarabe-simple", json=payloads.jarabe_simple())
        resp = client.get("/api/jarabe-simple")
        data = resp.json()
        assert len(data) == 3
        ids = [r["id"] for r in data]
        assert ids == sorted(ids, reverse=True)
        assert all(set(r.keys()) == self.EXPECTED_KEYS for r in data)


class TestJarabeTerminado:

    def test_post_happy_path(self, client, payloads):
        resp = client.post("/api/jarabe-terminado", json=payloads.jarabe_terminado())
        assert resp.status_code == 201
        body = resp.json()
        assert body["message"] == "Jarabe Terminado registrado con éxito"
        assert isinstance(body["id"], int)

    def test_invalid_fecha_falls_back_to_today(self, client, payloads):
        resp = client.post(
            "/api/jarabe-terminado", json=payloads.jarabe_terminado(fecha="31/12/2026")
        )
        assert resp.status_code == 201  # silently accepted

    @pytest.mark.parametrize("campo_requerido", ["fecha", "sabor", "concentrado", "tanque", "unidades", "volcado_numero"])
    def test_missing_required_field_returns_422(self, client, payloads, campo_requerido):
        payload = payloads.jarabe_terminado()
        del payload[campo_requerido]
        resp = client.post("/api/jarabe-terminado", json=payload)
        assert resp.status_code == 422

    def test_missing_responsables_returns_422(self, client, payloads):
        payload = payloads.jarabe_terminado()
        del payload["responsables"]
        resp = client.post("/api/jarabe-terminado", json=payload)
        assert resp.status_code == 422
