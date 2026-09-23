from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.agua import AnalisisCloro, ControlFisicoQuimico, FiltroArena, OsmosisInversa, SalaSaneado
from backend.app.schemas.agua import AnalisisCloroCreate, ControlFisicoQuimicoCreate, FiltroArenaCreate, OsmosisInversaCreate, SalaSaneadoCreate

router = APIRouter(prefix="/api/agua", tags=["Agua"])

@router.post("/fisico-quimico", status_code=status.HTTP_201_CREATED)
def create_control_fisico_quimico(data: ControlFisicoQuimicoCreate, db: Session = Depends(get_db)):
    ahora = datetime.utcnow()
    fecha_val = data.fecha if data.fecha else ahora.date()
    hora_val = data.hora if data.hora else ahora.time()
    
    nuevo_registro = ControlFisicoQuimico(
        tipo_agua=data.tipo_agua,
        fecha=fecha_val,
        hora=hora_val,
        k=data.k,
        dureza=data.dureza,
        cloruros=data.cloruros,
        sulfatos=data.sulfatos,
        alcalinidad=data.alcalinidad,
        cloro_libre=data.cloro_libre,
        ph=data.ph,
        responsable=data.responsable
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return {"message": "Control físico químico guardado exitosamente", "id": nuevo_registro.id}


@router.get("/fisico-quimico")
def list_control_fisico_quimico(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return db.query(ControlFisicoQuimico).order_by(ControlFisicoQuimico.id.desc()).offset(offset).limit(limit).all()


@router.post("/analisis-cloro", status_code=status.HTTP_201_CREATED)
def create_analisis_cloro(data: AnalisisCloroCreate, db: Session = Depends(get_db)):
    registro = AnalisisCloro(**data.model_dump())
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"message": "Análisis de cloro guardado exitosamente", "id": registro.id}


@router.get("/analisis-cloro")
def list_analisis_cloro(limit: int = Query(100, ge=1, le=500), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return db.query(AnalisisCloro).order_by(AnalisisCloro.id.desc()).offset(offset).limit(limit).all()


@router.post("/osmosis-inversa", status_code=status.HTTP_201_CREATED)
def create_osmosis_inversa(data: OsmosisInversaCreate, db: Session = Depends(get_db)):
    registro = OsmosisInversa(**data.model_dump())
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"message": "Control de ósmosis inversa guardado exitosamente", "id": registro.id}


@router.get("/osmosis-inversa")
def list_osmosis_inversa(limit: int = Query(100, ge=1, le=500), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return db.query(OsmosisInversa).order_by(OsmosisInversa.id.desc()).offset(offset).limit(limit).all()


@router.post("/filtro-arena", status_code=status.HTTP_201_CREATED)
def create_filtro_arena(data: FiltroArenaCreate, db: Session = Depends(get_db)):
    registro = FiltroArena(**data.model_dump())
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"message": "Control de filtro de arena guardado exitosamente", "id": registro.id}


@router.get("/filtro-arena")
def list_filtro_arena(limit: int = Query(100, ge=1, le=500), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return db.query(FiltroArena).order_by(FiltroArena.id.desc()).offset(offset).limit(limit).all()


WATER_MODELS = {
    "fisico-quimico": ControlFisicoQuimico,
    "analisis-cloro": AnalisisCloro,
    "osmosis-inversa": OsmosisInversa,
    "filtro-arena": FiltroArena,
}


@router.delete("/{control_type}/{control_id}")
def delete_water_control(control_type: str, control_id: int, db: Session = Depends(get_db)):
    model = WATER_MODELS.get(control_type)
    if model is None:
        raise HTTPException(status_code=404, detail="Tipo de control de agua desconocido")
    registro = db.get(model, control_id)
    if registro is None:
        raise HTTPException(status_code=404, detail="Registro de agua no encontrado")
    db.delete(registro)
    db.commit()
    return {"message": "Registro eliminado con éxito"}

@router.post("/sala-saneado", status_code=status.HTTP_201_CREATED)
def create_sala_saneado(data: SalaSaneadoCreate, db: Session = Depends(get_db)):
    nuevo_registro = SalaSaneado(
        linea=data.linea,
        post_mantenimiento=data.post_mantenimiento,
        tipo_limpieza=data.tipo_limpieza,
        responsable=data.responsable,
        cop_quimico=data.cop_quimico,
        cop_hora_inicio=data.cop_hora_inicio,
        cop_hora_fin=data.cop_hora_fin,
        cip_sanitizante_temp=data.cip_sanitizante_temp,
        cip_sanitizante_inicio=data.cip_sanitizante_inicio,
        cip_sanitizante_fin=data.cip_sanitizante_fin,
        cip_desinfectante_temp=data.cip_desinfectante_temp,
        cip_desinfectante_inicio=data.cip_desinfectante_inicio,
        cip_desinfectante_fin=data.cip_desinfectante_fin,
        cip_enjuague_sanitizante_inicio=data.cip_enjuague_sanitizante_inicio,
        cip_enjuague_sanitizante_fin=data.cip_enjuague_sanitizante_fin,
        cip_enjuague_desinfectante_inicio=data.cip_enjuague_desinfectante_inicio,
        cip_enjuague_desinfectante_fin=data.cip_enjuague_desinfectante_fin
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return {"message": "Control de sala de saneado guardado exitosamente", "id": nuevo_registro.id}
