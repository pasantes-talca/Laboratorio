"""Retira exclusivamente el lote DEMO_AGUA_GRAFICOS y conserva su auditoría."""
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.encoders import jsonable_encoder
from sqlalchemy import func, select

from backend.app.core.database import SessionLocal
from backend.app.core.time import local_now
from backend.app.models.auditoria import AutorRegistro, CambioRegistro
from backend.app.models.agua import AnalisisCloro, ControlFisicoQuimico, FiltroArena, OsmosisInversa

MARKER = 'DEMO_AGUA_GRAFICOS'
MODELS = {'agua-fisico-quimico': ControlFisicoQuimico, 'agua-cloro': AnalisisCloro,
          'agua-osmosis': OsmosisInversa, 'agua-filtro-arena': FiltroArena}


def main():
    with SessionLocal.begin() as db:
        before = {key: db.scalar(select(func.count()).select_from(model)) for key, model in MODELS.items()}
        authors = db.scalars(select(AutorRegistro).where(AutorRegistro.creado_por == MARKER).with_for_update()).all()
        removed = Counter()
        for author in authors:
            if author.formulario not in MODELS:
                raise RuntimeError('El lote contiene un formulario inesperado; se cancela la transacción.')
            model = MODELS[author.formulario]
            record = db.scalar(select(model).where(model.id == author.registro_id).with_for_update())
            if record is not None:
                snapshot = {column.name: getattr(record, column.name) for column in model.__table__.columns}
                db.add(CambioRegistro(formulario=author.formulario, registro_id=record.id,
                    usuario=MARKER, fecha=local_now(), motivo='Retiro de datos ficticios solicitado por el usuario',
                    anteriores=jsonable_encoder(snapshot), nuevos={'eliminado': True, 'lote_demo': MARKER}))
                db.delete(record)
                removed[author.formulario] += 1
            db.delete(author)
        db.flush()
        after = {key: db.scalar(select(func.count()).select_from(model)) for key, model in MODELS.items()}
        assert all(before[key] - after[key] == removed[key] for key in MODELS)
    print('Registros ficticios eliminados:', dict(removed), 'Total:', sum(removed.values()))
    print('Registros restantes:', after)


if __name__ == '__main__':
    main()
