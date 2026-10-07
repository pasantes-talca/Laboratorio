from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.app.models.production import ControlProduccion, ProduccionActiva


def linea_numero(linea: str | None) -> int:
    if linea == "linea1":
        return 1
    if linea == "linea2":
        return 2
    raise HTTPException(status_code=422, detail="Seleccione una línea válida")


def require_production(db: Session, linea: str | None, version: int | None) -> ProduccionActiva:
    number = linea_numero(linea)
    if version is None:
        raise HTTPException(status_code=409, detail="Actualice la producción antes de registrar el control")
    production = (
        db.query(ProduccionActiva)
        .filter(ProduccionActiva.linea == number)
        .with_for_update()
        .one_or_none()
    )
    if production is None:
        raise HTTPException(status_code=409, detail="Configure la producción de esta línea antes de registrar controles")
    if production.version != version:
        raise HTTPException(status_code=409, detail="La producción cambió. Actualice los datos antes de registrar el control")
    return production


def attach_control_production(
    db: Session, tipo: str, control_id: int, production: ProduccionActiva, lote_tapa: str = "",
) -> None:
    db.add(ControlProduccion(
        tipo_control=tipo,
        control_id=control_id,
        linea=production.linea,
        produccion_version=production.version,
        turno=production.turno,
        sabor=production.sabor,
        concentrado=production.concentrado,
        tamano=production.tamano,
        lote_tapa=lote_tapa,
    ))
