"""Shared administration of explicitly registered laboratory forms."""

from datetime import date, datetime, time
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import DateTime, String, cast, or_
from sqlalchemy.orm import Session

from backend.app.core.auth import COOKIE_NAME, read_session
from backend.app.core.database import get_db
from backend.app.core.time import local_now
from backend.app.models.auditoria import AutorRegistro, CambioRegistro
from backend.app.models.production import ControlProduccion
from backend.app.services.admin_catalog import (
    FORMS,
    catalogue,
    serialize,
    validate_update,
)


def require_admin(request: Request):
    user = read_session(request.cookies.get(COOKIE_NAME))
    if not user:
        raise HTTPException(401, "Ingrese con una cuenta de administrador")
    if user["role"] != "administrador":
        raise HTTPException(403, "Esta sección requiere permisos de administrador")
    return user


router = APIRouter(
    prefix="/api/admin", tags=["Administración"], dependencies=[Depends(require_admin)]
)
DbSession = Annotated[Session, Depends(get_db)]
AdminUser = Annotated[dict, Depends(require_admin)]


def model_for(formulario):
    if formulario not in FORMS:
        raise HTTPException(404, "Formulario no encontrado")
    return FORMS[formulario][2]


def row_data(db, formulario, record, history=False, author=...):
    if author is ...:
        author = db.get(AutorRegistro, (formulario, record.id))
    result = {
        "id": record.id,
        "values": serialize(record),
        "created_by": author.creado_por if author else None,
        "created_at": author.creado_en if author else None,
        "version": author.version if author else 0,
    }
    if history:
        changes = (
            db.query(CambioRegistro)
            .filter_by(formulario=formulario, registro_id=record.id)
            .order_by(CambioRegistro.id.desc())
            .all()
        )
        result["history"] = [
            {
                "id": c.id,
                "user": c.usuario,
                "date": c.fecha,
                "reason": c.motivo,
                "before": c.anteriores,
                "after": c.nuevos,
            }
            for c in changes
        ]
    return result


@router.get("/catalogo")
def get_catalogue():
    return catalogue()


@router.get("/{formulario}/registros")
def list_records(
    formulario: str,
    db: DbSession,
    desde: date | None = None,
    hasta: date | None = None,
    q: str = Query("", max_length=100),
    usuario: str = Query("", max_length=100),
    responsable: str = Query("", max_length=100),
    linea: int | None = Query(None, ge=1, le=2),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    model = model_for(formulario)
    if desde and hasta and desde > hasta:
        raise HTTPException(422, "La fecha inicial debe ser anterior a la final")
    query = db.query(model).outerjoin(
        AutorRegistro,
        (AutorRegistro.formulario == formulario)
        & (AutorRegistro.registro_id == model.id),
    )
    date_column = getattr(model, "fecha", getattr(model, "fecha_registro", None))
    if date_column is not None:
        if desde:
            start = (
                datetime.combine(desde, time.min)
                if isinstance(date_column.type, DateTime)
                else desde
            )
            query = query.filter(date_column >= start)
        if hasta:
            end = (
                datetime.combine(hasta, time.max)
                if isinstance(date_column.type, DateTime)
                else hasta
            )
            query = query.filter(date_column <= end)
    if usuario:
        query = query.filter(
            AutorRegistro.creado_por.contains(usuario, autoescape=True)
        )
    if responsable:
        column = getattr(model, "responsable", getattr(model, "responsables", None))
        if column is not None:
            query = query.filter(column.contains(responsable, autoescape=True))
    if linea:
        if hasattr(model, "linea"):
            query = query.filter(
                cast(model.linea, String).in_([str(linea), f"linea{linea}"])
            )
        elif formulario == "calidad-jarabe":
            query = query.join(
                ControlProduccion,
                (ControlProduccion.tipo_control == "jarabe")
                & (ControlProduccion.control_id == model.id),
            ).filter(ControlProduccion.linea == linea)
        elif hasattr(model, "cloro_riser_linea"):
            query = query.filter(model.cloro_riser_linea == f"Linea {linea}")
    if q:
        columns = [c for c in model.__table__.columns if isinstance(c.type, String)]
        query = query.filter(
            or_(
                cast(model.id, String).contains(q, autoescape=True),
                *[c.contains(q, autoescape=True) for c in columns],
            )
        )
    total = query.count()
    records = (
        query.add_entity(AutorRegistro)
        .order_by(model.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return {
        "items": [
            row_data(db, formulario, record, author=author)
            for record, author in records
        ],
        "total": total,
    }


@router.get("/{formulario}/registros/{registro_id}")
def detail(formulario: str, registro_id: int, db: DbSession):
    record = db.get(model_for(formulario), registro_id)
    if not record:
        raise HTTPException(404, "Registro no encontrado")
    return row_data(db, formulario, record, history=True)


class EditRecord(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    expected_version: int = Field(ge=0)
    motivo: str = Field(min_length=5, max_length=500)
    valores: dict[str, Any]


@router.patch("/{formulario}/registros/{registro_id}")
def edit(
    formulario: str,
    registro_id: int,
    body: EditRecord,
    db: DbSession,
    user: AdminUser,
):
    model = model_for(formulario)
    record = db.query(model).filter(model.id == registro_id).with_for_update().first()
    if not record:
        raise HTTPException(404, "Registro no encontrado")
    author = db.get(AutorRegistro, (formulario, registro_id))
    version = author.version if author else 0
    if body.expected_version != version:
        raise HTTPException(
            409,
            "Otra persona modificó este registro. Vuelva a cargarlo antes de guardar.",
        )
    try:
        changes = validate_update(formulario, record, body.valores)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    before = serialize(record)
    changes = {k: v for k, v in changes.items() if getattr(record, k) != v}
    if not changes:
        raise HTTPException(400, "No hay cambios para guardar")
    for key, value in changes.items():
        setattr(record, key, value)
    after = serialize(record)
    if formulario == "calidad-bebida" and "lote_tapa" in changes:
        linked = (
            db.query(ControlProduccion)
            .filter_by(tipo_control="bebida", control_id=registro_id)
            .first()
        )
        if linked:
            linked.lote_tapa = record.lote_tapa
    if not author:
        author = AutorRegistro(
            formulario=formulario, registro_id=registro_id, version=1
        )
        db.add(author)
    else:
        author.version += 1
    db.add(
        CambioRegistro(
            formulario=formulario,
            registro_id=registro_id,
            usuario=user["username"],
            fecha=local_now(),
            motivo=body.motivo,
            anteriores={k: before[k] for k in changes},
            nuevos={k: after[k] for k in changes},
        )
    )
    db.commit()
    return row_data(db, formulario, record, history=True)
