import pytest

from backend.app.services.excel_parser import extraer_datos_reporte


def test_parser_rejects_unknown_layout():
    with pytest.raises(ValueError, match="formato esperado"):
        extraer_datos_reporte("<html><table><tr><td>x</td></tr></table></html>", es_ruta=False)
