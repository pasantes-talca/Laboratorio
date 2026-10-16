from fastapi import APIRouter, Depends, HTTPException, Path, Request
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.time import local_now
from backend.app.models.production import ProduccionActiva
from backend.app.schemas.production import ProduccionActivaResponse, ProduccionActivaUpdate

router = APIRouter(prefix="/api/calidad/produccion", tags=["Producción activa"])


def as_response(production: ProduccionActiva | None, linea: int) -> ProduccionActivaResponse:
    if production is None:
        return ProduccionActivaResponse(
            linea=linea, turno="Mañana", sabor="", concentrado="", tamano="",
            version=0, actualizada_en=None, actualizada_por=None,
        )
    return ProduccionActivaResponse(
        linea=linea,
        turno=production.turno,
        sabor=production.sabor,
        concentrado=production.concentrado,
        tamano=production.tamano,
        version=production.version,
        actualizada_en=production.actualizada_en.isoformat(),
        actualizada_por=production.actualizada_por,
    )


@router.get("/{linea}", response_model=ProduccionActivaResponse)
def get_production(linea: int = Path(ge=1, le=2), db: Session = Depends(get_db)):
    return as_response(db.get(ProduccionActiva, linea), linea)


@router.put("/{linea}", response_model=ProduccionActivaResponse)
def update_production(
    data: ProduccionActivaUpdate,
    request: Request,
    linea: int = Path(ge=1, le=2),
    db: Session = Depends(get_db),
):
    values = {
        "turno": data.turno.strip(),
        "sabor": data.sabor.strip(),
        "concentrado": data.concentrado.strip(),
        "tamano": data.tamano.strip(),
        "lote_tapa": "",  # Campo heredado; el lote se registra en cada control de bebida.
        "actualizada_en": local_now(),
        "actualizada_por": getattr(request.state, "actor", "desarrollo-local"),
    }
    if any(not values[field] for field in ("turno", "sabor", "concentrado", "tamano")):
        raise HTTPException(status_code=422, detail="Complete todos los datos de producción")

    if data.expected_version == 0:
        db.add(ProduccionActiva(linea=linea, version=1, **values))
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise HTTPException(status_code=409, detail="La producción cambió. Actualice y vuelva a intentar") from exc
    else:
        result = db.execute(
            update(ProduccionActiva)
            .where(ProduccionActiva.linea == linea, ProduccionActiva.version == data.expected_version)
            .values(version=data.expected_version + 1, **values)
        )
        if result.rowcount != 1:
            db.rollback()
            raise HTTPException(status_code=409, detail="La producción cambió. Actualice y vuelva a intentar")
        db.commit()
    return as_response(db.get(ProduccionActiva, linea), linea)
