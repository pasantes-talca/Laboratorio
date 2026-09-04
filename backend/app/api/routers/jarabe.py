import json
from datetime import datetime, date as date_type
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.jarabe import (
    ControlJarabe,
    JarabeSimple,
    JarabeTerminado,
    SaneoTanque,
    ParteJarabe,
)
from backend.app.schemas.jarabe import (
    ControlJarabeCreate,
    JarabeSimpleCreate,
    JarabeTerminadoCreate,
    SaneoTanqueCreate,
    ParteJarabeCreate,
)
from backend.app.services.excel_parser import extraer_datos_reporte

router = APIRouter(prefix="/api", tags=["Sala de Jarabe"])


@router.post("/parse-jarabe-excel")
async def parse_jarabe_excel(file: UploadFile = File(...)):
    """Parsea el reporte Excel/HTML de Sala de Jarabe y extrae las cantidades e identificación."""
    try:
        content = await file.read()
        datos = extraer_datos_reporte(content, es_ruta=False)
        return {"status": "success", "data": datos}
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Error al procesar el archivo Excel: {str(e)}",
        )


@router.post("/calidad/jarabe", status_code=status.HTTP_201_CREATED)
@router.post("/calidad/control-jarabe", status_code=status.HTTP_201_CREATED)
@router.post("/calidad/controles-jarabe", status_code=status.HTTP_201_CREATED)
@router.post("/controles-jarabe", status_code=status.HTTP_201_CREATED)
def create_control_jarabe(data: ControlJarabeCreate, db: Session = Depends(get_db)):
    """Inserta en la tabla control_jarabe guardando strings directamente."""
    now = datetime.now()
    hora_str = data.hora if (data.hora and data.hora.strip()) else now.strftime("%H:%M")
    try:
        hora_obj = datetime.strptime(hora_str, "%H:%M").time()
    except ValueError:
        hora_obj = now.time().replace(second=0, microsecond=0)

    registro = ControlJarabe(
        turno=data.turno,
        fecha=now.date(),
        hora=hora_obj,
        sabor=data.sabor,
        concentrado=data.concentrado,
        tanque=data.tanque.strip(),
        grados_brix_patron=data.bx_patron,
        t_a=data.ta,
        responsable=data.responsable,
        observacion=data.observacion.strip() if data.observacion and data.observacion.strip() else None,
        numero_carga_trilay=data.numero_carga_trilay.strip() if data.numero_carga_trilay and data.numero_carga_trilay.strip() else None,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Control de jarabe registrado con éxito"}


@router.get("/calidad/jarabe")
@router.get("/calidad/control-jarabe")
@router.get("/calidad/controles-jarabe")
@router.get("/controles-jarabe")
def get_controles_jarabe(db: Session = Depends(get_db)):
    controles = db.query(ControlJarabe).order_by(ControlJarabe.id.desc()).all()
    return [
        {
            "id": c.id,
            "turno": c.turno,
            "fecha": str(c.fecha) if c.fecha else None,
            "hora": c.hora.strftime("%H:%M") if c.hora else None,
            "sabor": c.sabor,
            "concentrado": c.concentrado,
            "tanque": c.tanque,
            "bx_patron": float(c.grados_brix_patron) if c.grados_brix_patron is not None else None,
            "ta": float(c.t_a) if c.t_a is not None else None,
            "responsable": c.responsable,
            "observacion": c.observacion,
        }
        for c in controles
    ]


@router.delete("/calidad/jarabe/{control_id}")
@router.delete("/calidad/control-jarabe/{control_id}")
@router.delete("/calidad/controles-jarabe/{control_id}")
@router.delete("/controles-jarabe/{control_id}")
def delete_control_jarabe(control_id: int, db: Session = Depends(get_db)):
    control = db.query(ControlJarabe).filter(ControlJarabe.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Registro de jarabe no encontrado")
    db.delete(control)
    db.commit()
    return {"message": "Registro eliminado con éxito"}


@router.post("/jarabe-simple", status_code=status.HTTP_201_CREATED)
def create_jarabe_simple(data: JarabeSimpleCreate, db: Session = Depends(get_db)):
    """Registra una preparación de jarabe simple."""
    try:
        fecha_obj = date_type.fromisoformat(data.fecha)
    except ValueError:
        fecha_obj = datetime.now().date()

    hora_obj = None
    if data.hora and data.hora.strip():
        try:
            hora_obj = datetime.strptime(data.hora, "%H:%M").time()
        except ValueError:
            pass

    def parse_time(t):
        if t and t.strip():
            try:
                return datetime.strptime(t, "%H:%M").time()
            except ValueError:
                return None
        return None

    registro = JarabeSimple(
        fecha=fecha_obj,
        hora=hora_obj,
        tanque=data.tanque.strip(),
        volcado_numero=data.volcado_numero,
        cantidad_bolsas=data.cantidad_bolsas,
        azucar_tipo=data.azucar_tipo,
        azucar_marca=data.azucar_marca,
        azucar_ntu=data.azucar_ntu,
        aux_standard=data.aux_standard,
        aux_hyflo=data.aux_hyflo,
        pasteurizado_desde=parse_time(data.pasteurizado_desde),
        pasteurizado_hasta=parse_time(data.pasteurizado_hasta),
        pasteurizado_temp=data.pasteurizado_temp,
        responsables=json.dumps(data.responsables, ensure_ascii=False),
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Jarabe Simple registrado con éxito"}


@router.get("/jarabe-simple")
def get_jarabe_simples(tanque: str = None, fecha: str = None, sabor: str = None, db: Session = Depends(get_db)):
    """Devuelve registros de jarabe simple. Permite filtrar por tanque, fecha y/o sabor."""
    query = db.query(JarabeSimple).order_by(JarabeSimple.id.desc())
    if tanque:
        query = query.filter(JarabeSimple.tanque == tanque.strip())
    if fecha:
        try:
            fecha_obj = date_type.fromisoformat(fecha)
            query = query.filter(JarabeSimple.fecha == fecha_obj)
        except ValueError:
            pass
    if sabor:
        query = query.filter(JarabeSimple.azucar_marca.ilike(f"%{sabor.strip()}%"))
    registros = query.all()
    return [
        {
            "id": r.id,
            "fecha": str(r.fecha) if r.fecha else None,
            "hora": r.hora.strftime("%H:%M") if r.hora else None,
            "tanque": r.tanque,
            "volcado_numero": r.volcado_numero,
            "cantidad_bolsas": r.cantidad_bolsas,
            "azucar_tipo": r.azucar_tipo,
            "azucar_marca": r.azucar_marca,
            "responsables": r.responsables,
        }
        for r in registros
    ]


@router.post("/jarabe-terminado", status_code=status.HTTP_201_CREATED)
def create_jarabe_terminado(data: JarabeTerminadoCreate, db: Session = Depends(get_db)):
    """Registra una preparación de jarabe terminado."""
    try:
        fecha_obj = date_type.fromisoformat(data.fecha)
    except ValueError:
        fecha_obj = datetime.now().date()

    registro = JarabeTerminado(
        fecha=fecha_obj,
        sabor=data.sabor,
        concentrado=data.concentrado,
        tanque=data.tanque.strip(),
        unidades=data.unidades,
        volcado_numero=data.volcado_numero,
        tiempo_filtrado=data.tiempo_filtrado,
        be_jarabe_simple=data.be_jarabe_simple,
        vol_jarabe_simple=data.vol_jarabe_simple,
        lts_jarabe_terminado=data.lts_jarabe_terminado,
        responsables=json.dumps(data.responsables, ensure_ascii=False),
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Jarabe Terminado registrado con éxito"}


@router.post("/saneo-tanques", status_code=status.HTTP_201_CREATED)
def create_saneo_tanque(data: SaneoTanqueCreate, db: Session = Depends(get_db)):
    """Registra un saneo (CIP) de tanque."""
    try:
        fecha_obj = date_type.fromisoformat(data.fecha)
    except ValueError:
        fecha_obj = datetime.now().date()

    def parse_time(t):
        if t and t.strip():
            try:
                return datetime.strptime(t, "%H:%M").time()
            except ValueError:
                return None
        return None

    registro = SaneoTanque(
        fecha=fecha_obj,
        hora_inicio=parse_time(data.hora_inicio),
        hora_fin=parse_time(data.hora_fin),
        tanque=data.tanque.strip(),
        producto=data.producto,
        responsables=json.dumps(data.responsables, ensure_ascii=False),
        numero_saneo=data.numero_saneo,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Saneo de tanque registrado con éxito"}


@router.post("/parte-jarabe", status_code=status.HTTP_201_CREATED)
def create_parte_jarabe(data: ParteJarabeCreate, db: Session = Depends(get_db)):
    """Registra un parte de dosificación de jarabe."""
    try:
        fecha_obj = date_type.fromisoformat(data.fecha)
    except ValueError:
        fecha_obj = datetime.now().date()

    registro = ParteJarabe(
        fecha=fecha_obj,
        turno=data.turno,
        tanque=data.tanque.strip(),
        sabor=data.sabor,
        numero_carga_trilay=data.numero_carga_trilay,
        responsables=json.dumps(data.responsables, ensure_ascii=False),
        azucar=data.azucar,
        sucralosa=data.sucralosa,
        reforzado_citrico=data.reforzado_citrico,
        acesulfame_k=data.acesulfame_k,
        benzoato_sodio=data.benzoato_sodio,
        sorbato_potasio=data.sorbato_potasio,
        citrato_sodio=data.citrato_sodio,
        acido_citrico=data.acido_citrico,
        acido_fosforico=data.acido_fosforico,
        acido_ascorbico=data.acido_ascorbico,
        cafeina=data.cafeina,
        colorante_caramelo=data.colorante_caramelo,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Parte de Jarabe registrado con éxito"}
