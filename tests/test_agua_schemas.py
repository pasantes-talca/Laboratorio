import pytest
from pydantic import ValidationError

from backend.app.schemas.agua import (
    AnalisisCloroCreate,
    ControlFisicoQuimicoCreate,
    FiltroArenaCreate,
    OsmosisInversaCreate,
)


def test_fisico_quimico_rejects_invalid_ph():
    with pytest.raises(ValidationError):
        ControlFisicoQuimicoCreate(
            tipo_agua="Agua tratada",
            k=1,
            dureza=1,
            cloruros=1,
            sulfatos=1,
            alcalinidad=1,
            cloro_libre=1,
            ph=15,
            responsable="Operador",
        )


def test_empty_optional_values_are_normalized():
    control = FiltroArenaCreate(
        hora="",
        fecha_contralavado="",
        presion_interno=1,
        presion_externo=2,
    )
    assert control.hora is None
    assert control.fecha_contralavado is None


def test_osmosis_rejects_negative_values_and_bad_pressure_name():
    with pytest.raises(ValidationError):
        OsmosisInversaCreate(hora="06:00", k=-1, h=1, q_perm=1, q_mezcla=1, q_rechazo=1, p_select="X", p_valor=1)


def test_chlorine_requires_responsible_operator():
    with pytest.raises(ValidationError):
        AnalisisCloroCreate(
            tanque_agua_osmosis=1,
            filtro_carbon_a="Cumple",
            filtro_carbon_b="Cumple",
            filtro_carbon_c="Cumple",
            cloro_riser_linea="Linea 1",
            cloro_riser_resultado=1,
            responsable="",
        )
