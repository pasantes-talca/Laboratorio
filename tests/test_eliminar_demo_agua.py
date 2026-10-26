from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker

from backend.app.models import Base
from backend.app.models.auditoria import AutorRegistro, CambioRegistro
from backend.app.models.agua import AnalisisCloro
from scripts import eliminar_demo_agua


def test_only_marked_records_are_removed_and_audit_is_preserved(monkeypatch):
    engine = create_engine('sqlite://').execution_options(schema_translate_map={'laboratorio': None})
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine)
    values = dict(tanque_agua_osmosis=0, filtro_carbon_a='Cumple', filtro_carbon_b='Cumple', filtro_carbon_c='Cumple', cloro_riser_linea='Linea 1', cloro_riser_resultado=1, responsable='Operador real')
    with factory.begin() as db:
        real = AnalisisCloro(**values)
        db.add(real)
        db.flush()
        real_id = real.id
        db.info['actor'] = eliminar_demo_agua.MARKER
        fake = AnalisisCloro(**{**values, 'responsable': 'DEMO - Operador A'})
        db.add(fake)
        db.flush()
        fake_id = fake.id
    monkeypatch.setattr(eliminar_demo_agua, 'SessionLocal', factory)
    eliminar_demo_agua.main()
    eliminar_demo_agua.main()  # Retrying must preserve remaining real records.
    with Session(engine) as db:
        assert db.get(AnalisisCloro, real_id) is not None
        assert db.get(AnalisisCloro, fake_id) is None
        assert db.get(AutorRegistro, ('agua-cloro', real_id)) is not None
        assert db.scalar(select(func.count()).select_from(CambioRegistro)) == 1
        change = db.scalars(select(CambioRegistro)).one()
        assert change.anteriores['responsable'] == 'DEMO - Operador A'
        assert change.nuevos['eliminado'] is True
    engine.dispose()
