"""Tests for ops endpoints: saneo-tanques, parte-jarabe, controles-torque, pausas."""

from datetime import datetime

import pytest
from sqlalchemy import text


class TestSaneoTanques:

    def test_post_happy_path(self, client, payloads):
        resp = client.post("/api/saneo-tanques", json=payloads.saneo_tanque())
        assert resp.status_code == 201
        body = resp.json()
        assert set(body.keys()) == {"id", "message"}
        assert body["message"] == "Saneo de tanque registrado con éxito"

    def test_invalid_hora_inicio_stored_as_null(self, client, payloads, db_engine):
        created = client.post(
            "/api/saneo-tanques",
            json=payloads.saneo_tanque(hora_inicio="99:99"),
        ).json()
        with db_engine.connect() as conn:
            row = conn.execute(
                text("SELECT hora_inicio, hora_fin FROM laboratorio.saneo_tanques WHERE id = :id"),
                {"id": created["id"]},
            ).one()
        assert row.hora_inicio is None
        assert row.hora_fin is not None  # valid hora_fin parsed normally

    def test_invalid_fecha_falls_back_to_today(self, client, payloads, db_engine):
        created = client.post(
            "/api/saneo-tanques", json=payloads.saneo_tanque(fecha="25/08/2026")
        ).json()
        with db_engine.connect() as conn:
            fecha = conn.execute(
                text("SELECT fecha FROM laboratorio.saneo_tanques WHERE id = :id"),
                {"id": created["id"]},
            ).scalar_one()
        assert fecha == datetime.now().date()


class TestParteJarabe:

    def test_post_happy_path_with_all_additive_fields(self, client, payloads):
        resp = client.post("/api/parte-jarabe", json=payloads.parte_jarabe())
        assert resp.status_code == 201
        body = resp.json()
        assert set(body.keys()) == {"id", "message"}
        assert body["message"] == "Parte de Jarabe registrado con éxito"

    def test_minimal_payload_only_required_fields_works(self, client, payloads):
        payload = payloads.parte_jarabe()
        minimal = {
            k: v for k, v in payload.items()
            if k in {"fecha", "turno", "tanque", "numero_carga_trilay", "responsables"}
        }
        resp = client.post("/api/parte-jarabe", json=minimal)
        assert resp.status_code == 201

    @pytest.mark.parametrize("campo_requerido", ["fecha", "turno", "tanque", "numero_carga_trilay"])
    def test_missing_required_field_returns_422(self, client, payloads, campo_requerido):
        payload = payloads.parte_jarabe()
        del payload[campo_requerido]
        resp = client.post("/api/parte-jarabe", json=payload)
        assert resp.status_code == 422


class TestControlesTorque:

    EXPECTED_KEYS = {
        "id", "fecha", "hora", "turno", "linea", "numero_cabezal", "sabor",
        "color", "valor", "responsable",
    }

    def _create(self, client, payloads, **overrides):
        return client.post(
            "/api/controles-torque",
            json={k: v for k, v in payloads.control_torque(**overrides).items() if v is not None or k != "noche"},
        )

    def test_post_happy_path(self, client, payloads):
        resp = client.post("/api/controles-torque", json=payloads.control_torque())
        assert resp.status_code == 201
        body = resp.json()
        assert body["message"] == "Control de torque registrado con éxito"

    @pytest.mark.parametrize(
        "linea_enviada, esperado",
        [
            ("linea1", 1),
            ("linea2", 2),
            ("linea_desconocida", 1),  # unknown values fall back to 1
            (None, 1),
        ],
    )
    def test_linea_mapping(self, client, payloads, linea_enviada, esperado):
        created = self._create(client, payloads, linea=linea_enviada).json()
        record = client.get("/api/controles-torque").json()[0]
        assert record["id"] == created["id"]
        assert record["linea"] == esperado

    @pytest.mark.parametrize(
        "turno_enviado, esperado",
        [("mañana", "Mañana"), ("tarde", "Tarde"), ("noche", "Noche")],
    )
    def test_turno_normalization(self, client, payloads, turno_enviado, esperado):
        self._create(client, payloads, turno=turno_enviado)
        record = client.get("/api/controles-torque").json()[0]
        assert record["turno"] == esperado

    def test_turno_already_capitalized_stays_intact(self, client, payloads):
        self._create(client, payloads, turno="Mañana")
        assert client.get("/api/controles-torque").json()[0]["turno"] == "Mañana"

    def test_noche_field_overrides_turno_when_turno_is_noche(self, client, payloads):
        # When turno=="noche" and `noche` is provided, the `noche` value wins.
        self._create(client, payloads, turno="noche", noche="Noche (22-06)")
        record = client.get("/api/controles-torque").json()[0]
        assert record["turno"] == "Noche (22-06)"

    def test_noche_field_ignored_when_turno_is_not_noche(self, client, payloads):
        self._create(client, payloads, turno="tarde", noche="Noche (22-06)")
        record = client.get("/api/controles-torque").json()[0]
        assert record["turno"] == "Tarde"  # override NOT applied

    def test_missing_numero_cabezal_returns_422(self, client, payloads):
        payload = payloads.control_torque()
        del payload["numero_cabezal"]
        resp = client.post("/api/controles-torque", json=payload)
        assert resp.status_code == 422

    def test_get_keys_and_desc_order(self, client, payloads):
        for i in range(2):
            assert self._create(client, payloads, numero_cabezal=i + 1).status_code == 201
        records = client.get("/api/controles-torque").json()
        ids = [r["id"] for r in records]
        assert ids == sorted(ids, reverse=True)
        for record in records:
            assert set(record.keys()) == self.EXPECTED_KEYS
            assert isinstance(record["valor"], float)

    def test_delete_existing(self, client, payloads):
        created = self._create(client, payloads).json()
        resp = client.delete(f"/api/controles-torque/{created['id']}")
        assert resp.status_code == 200
        assert resp.json() == {"message": "Registro eliminado con éxito"}

    def test_delete_nonexistent_returns_404(self, client):
        resp = client.delete("/api/controles-torque/555555")
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Registro de torque no encontrado"


class TestPausas:

    EXPECTED_KEYS = {
        "id", "fecha", "hora", "turno", "linea", "motivo", "responsable",
        "observacion",
    }

    def test_post_happy_path(self, client, payloads):
        resp = client.post("/api/pausas", json=payloads.pausa())
        assert resp.status_code == 201
        body = resp.json()
        assert body["message"] == "Pausa registrada con éxito"

    @pytest.mark.parametrize(
        "turno_enviado, esperado",
        [("mañana", "Mañana"), ("tarde", "Tarde"), ("noche", "Noche")],
    )
    def test_turno_normalization(self, client, payloads, turno_enviado, esperado):
        client.post("/api/pausas", json=payloads.pausa(turno=turno_enviado))
        assert client.get("/api/pausas").json()[0]["turno"] == esperado

    def test_turno_unknown_value_stored_verbatim(self, client, payloads):
        client.post("/api/pausas", json=payloads.pausa(turno="NOCHE EXTRA"))
        assert client.get("/api/pausas").json()[0]["turno"] == "NOCHE EXTRA"

    @pytest.mark.parametrize(
        "linea_enviada, esperado",
        [
            ("linea1", 1),
            ("linea2", 2),
            ("otra", 1),  # unknown -> 1
            (None, 1),
        ],
    )
    def test_linea_mapping(self, client, payloads, linea_enviada, esperado):
        client.post("/api/pausas", json=payloads.pausa(linea=linea_enviada))
        assert client.get("/api/pausas").json()[0]["linea"] == esperado

    def test_observacion_whitespace_only_stored_as_null(self, client, payloads):
        client.post("/api/pausas", json=payloads.pausa(observacion="   "))
        assert client.get("/api/pausas").json()[0]["observacion"] is None

    def test_get_keys_and_desc_order(self, client, payloads):
        for _ in range(2):
            assert client.post("/api/pausas", json=payloads.pausa()).status_code == 201
        records = client.get("/api/pausas").json()
        ids = [r["id"] for r in records]
        assert ids == sorted(ids, reverse=True)
        for record in records:
            assert set(record.keys()) == self.EXPECTED_KEYS
