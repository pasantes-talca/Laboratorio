"""Tests for the HTML trazability-report parser via POST /api/parse-jarabe-excel.

Report structure expected by script.py:
  - At least 4 <table> elements.
  - tables[1] = details   -> rows keyed by first cell ('Camara').
  - tables[2] = header    -> rows keyed by first cell ('Nombre', 'Cantidad', 'Fecha').
  - tables[3] = ingredients -> header row + data rows where cell[1] holds the
    component name and cell[3] the quantity (comma decimal separator).
"""

import pytest


def make_table(rows):
    trs = "".join(
        "<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>" for row in rows
    )
    return f"<table>{trs}</table>"


def build_report_html():
    """A minimal-but-valid report with the exact layout script.py expects."""
    tabla_0 = make_table([["Reporte de Trazabilidad"], ["Generado por SIOM"]])
    tabla_detalles = make_table(
        [
            ["Campo", "Valor"],
            ["Camara", "7"],
            ["Operario", "Moya Luis"],
        ]
    )
    tabla_cabecera = make_table(
        [
            ["Concepto", "Detalle"],
            ["Nombre", "Cola"],
            ["Cantidad", "1500"],
            ["Fecha", "25/08/2026"],
        ]
    )
    tabla_ingredientes = make_table(
        [
            ["Tipo", "Componente", "Clase", "Cant.", "UM", "Lote"],
            ["Solido", "Azucar Blanca", "MP", "120,5", "KG", "L-001"],
            ["Liquido", "Ácido Cítrico", "A", "1,5", "KG", "L-002"],
            ["Conservante", "Benzoato de Sodio", "A", "0,3", "KG", "L-003"],
            ["Conservante", "Sorbato de Potasio", "A", "0,25", "KG", "L-004"],
            ["Edulcorante", "Sucralosa", "A", "0,08", "KG", "L-005"],
            ["Edulcorante", "Acesulfame K", "A", "0,1", "KG", "L-006"],
            ["Regulador", "Citrato de Sodio", "A", "0,5", "KG", "L-007"],
            ["Colorante", "Colorante Caramelo", "A", "0,2", "KG", "L-008"],
            ["Acidulante", "Ácido Fosfórico", "A", "2,0", "KG", "L-009"],
            ["Estimulante", "Cafeína", "A", "0,15", "KG", "L-010"],
            ["Vitamina", "Ácido Ascórbico", "A", "0,05", "KG", "L-011"],
        ]
    )
    html = (
        "<html><body>"
        f"{tabla_0}{tabla_detalles}{tabla_cabecera}{tabla_ingredientes}"
        "</body></html>"
    )
    return html.encode("utf-8")


EXPECTED_INGREDIENTS = {
    "azucar": 120.5,
    "acido_citrico": 1.5,
    "benzoato_sodio": 0.3,
    "sorbato_potasio": 0.25,
    "sucralosa": 0.08,
    "acesulfame_k": 0.1,
    "citrato_sodio": 0.5,
    "colorante_caramelo": 0.2,
    "acido_fosforico": 2.0,
    "cafeina": 0.15,
    "acido_ascorbico": 0.05,
}


def post_report(client, html_bytes):
    return client.post(
        "/api/parse-jarabe-excel",
        files={"file": ("report.html", html_bytes, "text/html")},
    )


class TestParseJarabeExcel:

    def test_valid_report_parsed_correctly(self, client):
        resp = post_report(client, build_report_html())
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "success"
        datos = body["data"]
        assert set(datos.keys()) == {
            "fecha", "fecha_original", "tanque", "sabor", "unidades",
            *EXPECTED_INGREDIENTS.keys(),
        }
        assert datos["tanque"] == "7"
        assert datos["sabor"] == "Cola"
        assert datos["unidades"] == "1500"
        assert datos["fecha_original"] == "25/08/2026"
        assert datos["fecha"] == "2026-08-25"  # converted DD/MM/YYYY -> ISO

    def test_all_ingredients_extracted_as_floats(self, client):
        datos = post_report(client, build_report_html()).json()["data"]
        for campo, esperado in EXPECTED_INGREDIENTS.items():
            assert isinstance(datos[campo], float), campo
            assert datos[campo] == pytest.approx(esperado), campo

    def test_missing_ingredient_defaults_to_zero(self, client):
        # Report without Sucralosa row -> default 0.0
        html = (
            "<html><body>"
            + make_table([["x"]])
            + make_table([["Campo", "Valor"], ["Camara", "7"]])
            + make_table(
                [["Concepto", "Detalle"], ["Nombre", "Cola"], ["Cantidad", "10"], ["Fecha", "01/02/2026"]]
            )
            + make_table(
                [
                    ["Tipo", "Componente", "Clase", "Cant.", "UM", "Lote"],
                    ["Solido", "Azucar Blanca", "MP", "50,0", "KG", "L-1"],
                ]
            )
            + "</body></html>"
        ).encode("utf-8")
        datos = post_report(client, html).json()["data"]
        assert datos["azucar"] == 50.0
        assert datos["sucralosa"] == 0.0

    def test_file_with_fewer_than_4_tables_returns_422(self, client):
        incomplete = (
            "<html><body>"
            + make_table([["tabla uno"]])
            + make_table([["tabla dos"]])
            + "</body></html>"
        ).encode("utf-8")
        resp = post_report(client, incomplete)
        assert resp.status_code == 422
        assert resp.json()["detail"].startswith("Error al procesar el archivo Excel:")
        assert "formato esperado" in resp.json()["detail"]

    def test_malformed_garbage_bytes_return_422(self, client):
        resp = post_report(client, b"\x00\x01\x02garbage-not-html\xff\xfe")
        assert resp.status_code == 422
        assert "Error al procesar el archivo Excel:" in resp.json()["detail"]

    def test_empty_file_returns_422(self, client):
        resp = post_report(client, b"")
        assert resp.status_code == 422

    def test_missing_file_returns_422(self, client):
        resp = client.post("/api/parse-jarabe-excel")
        assert resp.status_code == 422
