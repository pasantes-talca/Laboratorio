from datetime import date

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from backend.app.api.routers.jarabe import router
from backend.app.core.database import get_db
from backend.app.core.security import security_and_audit_middleware
from backend.app.models import Base
from backend.app.models.jarabe import JarabeSimple, JarabeTerminado, ParteJarabe, SaneoTanque


@pytest.fixture
def client():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool).execution_options(schema_translate_map={'laboratorio': None})
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        common = dict(fecha=date(2026, 10, 22), tanque='1', responsables='["Ana"]')
        db.add(JarabeSimple(**common, volcado_numero=1, cantidad_bolsas=40, azucar_tipo='Común', azucar_marca='Marca'))
        for volume in (1000, None, 0):
            db.add(JarabeTerminado(**common, sabor='Naranja', concentrado='XQ', unidades=1, volcado_numero='[1]', lts_jarabe_terminado=volume))
        db.add(SaneoTanque(**common, producto='Agua', numero_saneo=1))
        db.add(ParteJarabe(**common, sabor='Naranja', turno='Mañana', numero_carga_trilay='12', azucar=20, sucralosa=0, acido_citrico=1.5))
        db.add(JarabeTerminado(fecha=date(2026, 9, 1), tanque='2', responsables='Operador', sabor='Cola', concentrado='XQ', unidades=1, volcado_numero='2', lts_jarabe_terminado=2500))
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


def test_totals_include_entire_period_not_only_history_page(client):
    response = client.get('/api/jarabe/dashboard?mes=2026-10&limit=1')
    assert response.status_code == 200, response.text
    body = response.json()
    assert body['resumen'] == dict(simple=1, terminado=3, saneo=1, parte=1, bolsas=40, litros=1000, sin_litros=1, total=6)
    assert len(body['historial']['registros']) == 1
    assert body['historial']['total'] == 6
    assert body['por_sabor'][0]['sin_litros'] == 1
    assert body['tanques'][0]['saneo'] == '2026-10-22'


def test_filters_do_not_infer_unlinked_flavors(client):
    body = client.get('/api/jarabe/dashboard?fecha=2026-10-22&tanque=1&sabor=Naranja').json()
    assert body['resumen']['total'] == 4
    assert body['resumen']['simple'] == body['resumen']['saneo'] == 0
    assert body['resumen']['bolsas'] is None
    assert client.get('/api/jarabe/dashboard?mes=2026-09&tanque=1').json()['resumen']['total'] == 0


def test_missing_and_zero_liters_are_distinct_and_filters_are_validated(client):
    body = client.get('/api/jarabe/dashboard?mes=2026-10&tipo=terminado').json()
    assert sorted(row['litros'] for row in body['historial']['registros'] if row['litros'] is not None) == [0, 1000]
    assert sum(row['litros'] is None for row in body['historial']['registros']) == 1
    assert all(row['responsables'] == ['Ana'] for row in body['historial']['registros'])
    for query in ('mes=2026-13', 'mes=0000-01', 'tipo=otro', 'limit=0'):
        assert client.get('/api/jarabe/dashboard?' + query).status_code == 422


def test_part_dashboard_uses_part_counts_and_ingredient_quantities(client):
    body = client.get('/api/jarabe/dashboard?tipo=parte&mes=2026-10').json()
    assert body['resumen']['total'] == body['resumen']['parte'] == 1
    assert body['resumen']['terminado'] == 0
    assert body['por_sabor'][0]['cantidad'] == 1
    assert body['por_sabor'][0]['litros'] is None
    quantities = {row['campo']: row['kg'] for row in body['ingredientes']}
    assert quantities['azucar'] == 20
    assert quantities['sucralosa'] == 0
    assert quantities['cafeina'] is None
    assert body['historial']['registros'][0]['numero_carga_trilay'] == '12'
    assert body['historial']['registros'][0]['sabor'] == 'Naranja'


def test_cleaning_view_returns_only_cleaning_fields_and_counts(client):
    body = client.get('/api/jarabe/dashboard?tipo=saneo').json()
    assert body['resumen']['total'] == body['resumen']['saneo'] == 1
    assert body['por_dia'][0]['saneo'] == 1
    assert body['por_tanque'] == [{'tanque': '1', 'cantidad': 1}]
    assert body['historial']['registros'][0]['producto'] == 'Agua'
    assert all(row['kg'] is None for row in body['ingredientes'])


def test_tank_state_is_independent_of_history_filters_and_history_has_entry_dates(client):
    all_data = client.get('/api/jarabe/dashboard').json()
    filtered = client.get('/api/jarabe/dashboard?tipo=saneo&mes=2026-09&tanque=2&limit=1').json()
    assert filtered['historial']['total'] == 0
    assert filtered['estado_tanques']['tanques'] == all_data['estado_tanques']['tanques']
    assert all_data['historial']['registros'][0]['cargado_en'] is not None
