from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.config import BRAND_BOTTLE_COLOR
from backend.app.core.database import get_db
from backend.app.models.calidad import RegistroCalidad, ControlBebida
from backend.app.schemas.calidad import (
    RegistroCalidadCreate,
    RegistroCalidadResponse,
)

router = APIRouter(prefix="/api", tags=["Calidad"])


@router.post("/controles", response_model=RegistroCalidadResponse, status_code=status.HTTP_201_CREATED)
def create_control(data: RegistroCalidadCreate, db: Session = Depends(get_db)):
    """Legacy endpoint — still inserts into registro_calidad for backwards compatibility."""
    hora_registro = data.hora
    if not hora_registro or not hora_registro.strip():
        hora_registro = datetime.now().strftime("%H:%M")

    db_registro = RegistroCalidad(
        hora=hora_registro,
        carac_organolep=data.carac_organolep,
        nivel_llenado=data.nivel_llenado,
        contenido=data.contenido,
        presion=data.presion,
        temperatura=data.temperatura,
        vol_gas=data.vol_gas,
        brix=data.brix,
        control_videojet=data.control_videojet,
        responsable=data.responsable,
        marca=data.marca,
        tipo_concentrado=data.tipo_concentrado,
        tamano=data.tamano,
        lote_tapa=data.lote_tapa,
    )

    db.add(db_registro)
    db.commit()
    db.refresh(db_registro)
    return db_registro


@router.get("/controles", response_model=List[RegistroCalidadResponse])
def get_controles(db: Session = Depends(get_db)):
    return db.query(RegistroCalidad).order_by(RegistroCalidad.id.desc()).all()


@router.delete("/controles/{control_id}")
def delete_control(control_id: int, db: Session = Depends(get_db)):
    control = db.query(RegistroCalidad).filter(RegistroCalidad.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Registro de control no encontrado")
    db.delete(control)
    db.commit()
    return {"message": "Registro eliminado con éxito"}


@router.post("/calidad/bebida_terminada", status_code=status.HTTP_201_CREATED)
@router.post("/calidad/bebida-terminada", status_code=status.HTTP_201_CREATED)
@router.post("/control-bebida", status_code=status.HTTP_201_CREATED)
def create_control_bebida(data: RegistroCalidadCreate, db: Session = Depends(get_db)):
    now = datetime.now()

    if data.hora and data.hora.strip():
        try:
            hora_obj = datetime.strptime(data.hora.strip(), "%H:%M").time()
        except ValueError:
            hora_obj = now.time().replace(second=0, microsecond=0)
    else:
        hora_obj = now.time().replace(second=0, microsecond=0)

    linea_num = 1 if (data.linea or "") == "linea1" else 2

    registro = ControlBebida(
        marca=data.marca,
        concentrado=data.tipo_concentrado,
        tamano=data.tamano,
        responsable=data.responsable,
        tanque=data.tanque if hasattr(data, "tanque") else None,
        linea=linea_num,
        turno=data.turno,
        fecha=now.date(),
        hora=hora_obj,
        carac_organolep=data.carac_organolep,
        nivel_llenado=data.nivel_llenado,
        contenido=data.contenido,
        presion=data.presion,
        temperatura=data.temperatura,
        vol_gas=data.vol_gas,
        grados_brix=data.brix,
        lote_tapa=data.lote_tapa,
        control_video_jet=data.control_videojet,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {
        "id": registro.id,
        "message": "Control de bebida registrado con éxito",
        "bottle_visual": {
            "brand": data.marca,
            "color": BRAND_BOTTLE_COLOR.get(data.marca.lower(), "#CCCCCC"),
            "label": data.marca.lower(),
        },
    }


@router.get("/calidad/bebida_terminada")
@router.get("/calidad/bebida-terminada")
@router.get("/control-bebida")
def get_controles_bebida(db: Session = Depends(get_db)):
    registros = db.query(ControlBebida).order_by(ControlBebida.id.desc()).all()
    return [
        {
            "id": r.id,
            "marca": r.marca,
            "concentrado": r.concentrado,
            "tamano": r.tamano,
            "responsable": r.responsable,
            "tanque": r.tanque,
            "linea": r.linea,
            "turno": r.turno,
            "fecha": str(r.fecha) if r.fecha else None,
            "hora": r.hora.strftime("%H:%M") if r.hora else None,
            "carac_organolep": r.carac_organolep,
            "nivel_llenado": r.nivel_llenado,
            "contenido": r.contenido,
            "presion": r.presion,
            "temperatura": r.temperatura,
            "vol_gas": r.vol_gas,
            "grados_brix": r.grados_brix,
            "lote_tapa": r.lote_tapa,
            "control_video_jet": r.control_video_jet,
        }
        for r in registros
    ]


@router.delete("/calidad/bebida_terminada/{control_id}")
@router.delete("/calidad/bebida-terminada/{control_id}")
@router.delete("/control-bebida/{control_id}")
def delete_control_bebida(control_id: int, db: Session = Depends(get_db)):
    control = db.query(ControlBebida).filter(ControlBebida.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Registro de control de bebida no encontrado")
    db.delete(control)
    db.commit()
    return {"message": "Registro eliminado con éxito"}

