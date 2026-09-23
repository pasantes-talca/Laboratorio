from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.time import local_now
from backend.app.models.ops import ControlTorque, ControlPausa
from backend.app.schemas.ops import ControlTorqueCreate, ControlPausaCreate

router = APIRouter(prefix="/api", tags=["Operaciones"])


@router.post("/calidad/torque", status_code=status.HTTP_201_CREATED)
@router.post("/calidad/control-torque", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/calidad/controles-torque", status_code=status.HTTP_201_CREATED, include_in_schema=False)
@router.post("/controles-torque", status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_control_torque(data: ControlTorqueCreate, db: Session = Depends(get_db)):
    """Inserta en la tabla control_torque guardando strings directamente."""
    now = local_now()
    if data.hora and data.hora.strip():
        try:
            hora_obj = datetime.strptime(data.hora.strip(), "%H:%M").time()
        except ValueError as exc:
            raise HTTPException(status_code=422, detail="La hora debe tener formato HH:MM") from exc
    else:
        hora_obj = now.time().replace(second=0, microsecond=0)

    linea_num = 1 if (data.linea or "") == "linea1" else (2 if (data.linea or "") == "linea2" else 1)
    turno_final = data.noche if ((data.turno or "").lower() == "noche" and data.noche) else data.turno
    if turno_final and turno_final.lower() in ["mañana", "tarde", "noche"]:
        turno_final = turno_final.capitalize()

    registro = ControlTorque(
        fecha=now.date(),
        hora=hora_obj,
        turno=turno_final,
        linea=linea_num,
        numero_cabezal=data.numero_cabezal,
        sabor=data.sabor,
        color=data.color,
        marca_tapa=data.marca_tapa,
        valor=data.valor,
        responsable=data.responsable,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Control de torque registrado con éxito"}


@router.get("/calidad/torque")
@router.get("/calidad/control-torque", include_in_schema=False)
@router.get("/calidad/controles-torque", include_in_schema=False)
@router.get("/controles-torque", include_in_schema=False)
def get_controles_torque(
    linea: int | None = Query(None, ge=1, le=2),
    limit: int = Query(500, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(ControlTorque)
    if linea is not None:
        query = query.filter(ControlTorque.linea == linea)
    controles = query.order_by(ControlTorque.id.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": c.id,
            "fecha": str(c.fecha) if c.fecha else None,
            "hora": c.hora.strftime("%H:%M") if c.hora else None,
            "turno": c.turno,
            "linea": c.linea,
            "numero_cabezal": c.numero_cabezal,
            "sabor": c.sabor,
            "color": c.color,
            "marca_tapa": c.marca_tapa,
            "valor": float(c.valor) if c.valor is not None else None,
            "responsable": c.responsable,
        }
        for c in controles
    ]


@router.delete("/calidad/torque/{control_id}")
@router.delete("/calidad/control-torque/{control_id}", include_in_schema=False)
@router.delete("/calidad/controles-torque/{control_id}", include_in_schema=False)
@router.delete("/controles-torque/{control_id}", include_in_schema=False)
def delete_control_torque(control_id: int, db: Session = Depends(get_db)):
    control = db.query(ControlTorque).filter(ControlTorque.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Registro de torque no encontrado")
    db.delete(control)
    db.commit()
    return {"message": "Registro eliminado con éxito"}


@router.post("/calidad/pausa", status_code=status.HTTP_201_CREATED)
@router.post("/calidad/pausas", status_code=status.HTTP_201_CREATED)
@router.post("/pausas", status_code=status.HTTP_201_CREATED)
def create_pausa(data: ControlPausaCreate, db: Session = Depends(get_db)):
    """Registra una pausa de línea guardando strings directamente."""
    now = local_now()
    linea_num = 1 if (data.linea or "") == "linea1" else (2 if (data.linea or "") == "linea2" else 1)
    turno_val = (data.turno or "").capitalize() if (data.turno or "").lower() in ["mañana", "tarde", "noche"] else data.turno

    registro = ControlPausa(
        fecha=now.date(),
        hora=now.time().replace(second=0, microsecond=0),
        turno=turno_val,
        linea=linea_num,
        motivo=data.motivo,
        responsable=data.responsable,
        observacion=data.observacion.strip() if data.observacion and data.observacion.strip() else None,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Pausa registrada con éxito"}


@router.get("/calidad/pausa")
@router.get("/calidad/pausas")
@router.get("/pausas")
def get_pausas(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    pausas = db.query(ControlPausa).order_by(ControlPausa.id.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": p.id,
            "fecha": str(p.fecha) if p.fecha else None,
            "hora": p.hora.strftime("%H:%M") if p.hora else None,
            "turno": p.turno,
            "linea": p.linea,
            "motivo": p.motivo,
            "responsable": p.responsable,
            "observacion": p.observacion,
        }
        for p in pausas
    ]
