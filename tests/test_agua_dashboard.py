from datetime import date, datetime, time

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.routers.agua import router
from backend.app.core.database import get_db
from backend.app.core.security import security_and_audit_middleware
from backend.app.models import Base
from backend.app.models.agua import AnalisisCloro, ControlFisicoQuimico, FiltroArena, OsmosisInversa


@pytest.fixture
def client():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool).execution_options(schema_translate_map={'laboratorio': None})
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        for water, ph in [('Pozo', 7), ('Pozo', 9), ('Tratada', 6)]:
            db.add(ControlFisicoQuimico(fecha=date(2026, 10, 22), hora=time(8), tipo_agua=water, k=100, dureza=5, cloruros=2, sulfatos=2, alcalinidad=1, cloro_libre=0, ph=ph, responsable='Ana'))
        # 02:00 UTC belongs to the previous day at the plant.
        for pressure in (None, 0):
            db.add(AnalisisCloro(fecha_registro=datetime(2026, 10, 23, 2), tanque_agua_osmosis=0, filtro_carbon_a='Cumple', filtro_carbon_b='Cumple', filtro_carbon_c='Cumple', cloro_riser_linea='Línea 1', cloro_riser_resultado=1, acondicionamiento_rinser=pressure, responsable='Ana'))
        db.add(OsmosisInversa(fecha_registro=datetime(2026, 10, 22, 14), k=12, h=1, q_perm=2, q_mezcla=3, q_rechazo=4, p_select='P1', p_valor=5))
        db.add(FiltroArena(fecha_registro=datetime(2026, 9, 1, 14), presion_interno=2, presion_externo=1))
        db.commit()
    app = FastAPI()
    app.middleware('http')(security_and_audit_middleware)
    app.include_router(router)

    def database():
        with Session(engine) as db:
            yield db

    app.dependency_overrides[get_db] = database
    with TestClient(app) as test_client:
        yield test_client
    engine.dispose()


def test_counts_and_averages_cover_full_period_despite_history_pagination(client):
    response = client.get('/api/agua/dashboard?mes=2026-10&limit=1')
    assert response.status_code == 200, response.text
    body = response.json()
    assert body['conteos'] == {'fisico-quimico': 3, 'analisis-cloro': 2, 'osmosis-inversa': 1, 'filtro-arena': 0}
    assert body['historial']['total'] == 3
    assert len(body['historial']['registros']) == 1
    assert {row['grupo']: row['ph'] for row in body['series']} == {'Pozo': 8, 'Tratada': 6}


def test_water_groups_are_not_mixed_and_counts_describe_the_whole_period(client):
    body = client.get('/api/agua/dashboard?fecha=2026-10-22&grupo=Tratada').json()
    assert body['historial']['total'] == 1
    assert body['conteos']['fisico-quimico'] == 3
    assert body['series'][0]['ph'] == 6
    assert body['historial']['registros'][0]['responsable'] == 'Ana'


def test_utc_record_dates_are_filtered_in_plant_time_and_missing_is_not_zero(client):
    body = client.get('/api/agua/dashboard?tipo=analisis-cloro&fecha=2026-10-22').json()
    assert body['historial']['total'] == 2
    assert {row['fecha_control'] for row in body['historial']['registros']} == {'2026-10-22'}
    assert [row['acondicionamiento_rinser'] for row in body['historial']['registros']] == [0, None]
    assert client.get('/api/agua/dashboard?tipo=analisis-cloro&fecha=2026-10-23').json()['historial']['total'] == 0


def test_other_forms_and_invalid_filters(client):
    body = client.get('/api/agua/dashboard?tipo=osmosis-inversa').json()
    assert body['series'][0]['grupo'] == 'P1'
    assert body['metricas'][0]['titulo'] == 'Conductividad'
    assert 'responsable' not in body['historial']['registros'][0]
    assert client.get('/api/agua/dashboard?tipo=filtro-arena').json()['historial']['total'] == 1
    for query in ('tipo=otro', 'mes=2026-13', 'mes=0000-01', 'limit=0'):
        assert client.get('/api/agua/dashboard?' + query).status_code == 422
