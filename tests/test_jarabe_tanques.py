from datetime import date, datetime, time

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from backend.app.models import Base
from backend.app.models.auditoria import AutorRegistro
from backend.app.models.jarabe import JarabeSimple, JarabeTerminado, ParteJarabe, SaneoTanque
from backend.app.services.jarabe_tanques import tank_states


@pytest.fixture
def db():
    engine = create_engine('sqlite://').execution_options(schema_translate_map={'laboratorio': None})
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    engine.dispose()


def record(db, kind, day, hour=None, finish=None, tank='1'):
    common = dict(fecha=date(2026, 10, day), tanque=tank, responsables='["Ana"]')
    if kind == 'simple':
        row = JarabeSimple(**common, hora=time(hour) if hour is not None else None, volcado_numero=1, cantidad_bolsas=40, azucar_tipo='Común', azucar_marca='Marca')
    elif kind == 'terminado':
        row = JarabeTerminado(**common, sabor='Lima', concentrado='TP', unidades=1, volcado_numero='1', lts_jarabe_terminado=1000)
    elif kind == 'parte':
        row = ParteJarabe(**common, sabor='Lima', turno='Mañana', numero_carga_trilay='12')
    else:
        row = SaneoTanque(**common, hora_inicio=time(hour) if hour is not None else None, hora_fin=time(finish) if finish is not None else None, producto='CIP')
    db.add(row)
    db.commit()
    return row


def state(db, now=datetime(2026, 10, 26, 18)):
    return tank_states(db, catalog=['1', '2', 'N/A', 'TALCA'], now=now)


def test_full_cycle_and_new_preparation_remove_readiness(db):
    assert state(db)['tanques'][0]['estado'] == 'sin_datos'
    record(db, 'simple', 20, 8)
    assert state(db)['tanques'][0]['estado'] == 'preparando'
    record(db, 'terminado', 21)
    assert state(db)['tanques'][0]['estado'] == 'terminado'
    record(db, 'saneo', 22, 8)
    assert state(db)['tanques'][0]['estado'] == 'saneando'
    record(db, 'saneo', 23, 8, 9)
    assert state(db)['tanques'][0]['apto'] is True
    record(db, 'simple', 24, 8)
    assert state(db)['tanques'][0]['estado'] == 'preparando'
    assert state(db)['tanques'][0]['apto'] is False


def test_ambiguous_same_day_and_parts_never_claim_readiness(db):
    record(db, 'terminado', 20)
    record(db, 'saneo', 20, 15, 16)
    assert state(db)['tanques'][0]['estado'] == 'revisar'
    record(db, 'saneo', 21, 8, 9)
    assert state(db)['tanques'][0]['estado'] == 'apto'
    record(db, 'parte', 22)
    assert state(db)['tanques'][0]['estado'] == 'revisar'
    assert state(db)['tanques'][0]['movimientos']['parte']['sabor'] == 'Lima'


def test_future_finishing_time_and_overnight_cleaning(db):
    record(db, 'saneo', 25, 23, 1)
    assert state(db, datetime(2026, 10, 26, 0, 30))['tanques'][0]['estado'] == 'saneando'
    assert state(db, datetime(2026, 10, 26, 2))['tanques'][0]['estado'] == 'apto'
    assert state(db, datetime(2026, 10, 26, 2))['tanques'][0]['movimientos']['saneo']['fecha_fin'] == date(2026, 10, 26)
    record(db, 'simple', 26, 22)  # A future operation must not replace the current state.
    assert state(db, datetime(2026, 10, 26, 18))['tanques'][0]['estado'] == 'apto'


def test_catalog_and_unassigned_rows_do_not_invent_an_available_tank(db):
    record(db, 'simple', 22, 8, tank='N/A')
    result = state(db)
    assert [row['tanque'] for row in result['tanques']] == ['1', '2']
    assert result['sin_tanque_asignado'] is True
    assert all(row['apto'] is False for row in result['tanques'])


def test_same_day_audited_submission_can_order_a_finished_form(db):
    record(db, 'simple', 26, 8)
    finished = record(db, 'terminado', 26)
    author = db.scalars(select(AutorRegistro).where(AutorRegistro.formulario == 'jarabe-terminado', AutorRegistro.registro_id == finished.id)).one()
    author.creado_en = datetime(2026, 10, 26, 10)
    db.commit()
    result = state(db)['tanques'][0]
    assert result['estado'] == 'terminado'
    assert result['movimientos']['terminado']['hora_de_carga'] is True
