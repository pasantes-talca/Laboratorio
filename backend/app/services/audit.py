"""Capture authorship in the same transaction as each new form record."""

from sqlalchemy import event
from sqlalchemy.orm import Session

from backend.app.core.time import local_now
from backend.app.models.auditoria import FORMULARIOS_POR_TABLA, AutorRegistro


@event.listens_for(Session, "after_flush")
def capture_record_author(session, _context):
    for record in list(session.new):
        form_id = FORMULARIOS_POR_TABLA.get(getattr(record, "__tablename__", ""))
        if form_id:
            session.add(
                AutorRegistro(
                    formulario=form_id,
                    registro_id=record.id,
                    creado_por=session.info.get("actor"),
                    creado_en=local_now(),
                    version=1,
                )
            )
