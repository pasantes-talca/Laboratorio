import os
import json
from typing import List, Optional
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session
from database import init_db, get_db, RegistroCalidad, ControlJarabe, ControlBebida, ControlTorque, ControlPausa, JarabeSimple, JarabeTerminado, SaneoTanque, ParteJarabe


# --- MAESTROS DESDE JSON ---
_MAESTROS_PATH = os.path.join(os.path.dirname(__file__), "static", "data", "maestros.json")

def load_maestros() -> dict:
    """Reads master data from static/data/maestros.json. Returns empty lists on error."""
    try:
        with open(_MAESTROS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"responsables": [], "marcas": [], "tipos_concentrado": [], "tamanos": [], "tanques": []}
from script import extraer_datos_reporte


# Lifespan para inicializar la base de datos
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

# Inicializar FastAPI
app = FastAPI(
    title="Laboratorio de Calidad - Control de Bebida Terminada",
    version="1.0.0",
    lifespan=lifespan
)

# Montar archivos estáticos (CSS, JS)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir)
    os.makedirs(os.path.join(static_dir, "css"), exist_ok=True)
    os.makedirs(os.path.join(static_dir, "js"), exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Configurar motor de plantillas
templates = Jinja2Templates(directory="templates")


# Esquemas Pydantic para validación de datos
class RegistroCalidadCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    # Parámetros del Formulario de Calidad
    hora: Optional[str] = None
    turno: Optional[str] = None
    linea: Optional[str] = None
    carac_organolep: str = Field(..., description="okey o no okey")
    nivel_llenado: str
    contenido: float
    presion: float
    temperatura: float
    vol_gas: float
    brix: float = Field(..., alias="brix")
    control_videojet: str = Field(..., description="okey o no okey")
    responsable: str
    
    # Parámetros del Producto (Sidebar)
    marca: str
    tipo_concentrado: str
    tamano: str
    lote_tapa: str
    tanque: Optional[str] = None


class RegistroCalidadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fecha_registro: datetime
    hora: str
    carac_organolep: str
    nivel_llenado: str
    contenido: float
    presion: float
    temperatura: float
    vol_gas: float
    brix: float
    control_videojet: str
    responsable: str
    marca: str
    tipo_concentrado: str
    tamano: str
    lote_tapa: str


class ControlJarabeCreate(BaseModel):
    hora: Optional[str] = None
    turno: Optional[str] = None
    linea: Optional[str] = None
    sabor: str
    concentrado: str
    tanque: str
    bx_patron: float
    ta: float
    responsable: str
    observacion: Optional[str] = None
    numero_carga_trilay: Optional[str] = None


class JarabeSimpleCreate(BaseModel):
    fecha: str
    hora: Optional[str] = None
    tanque: str
    volcado_numero: int
    cantidad_bolsas: int
    azucar_tipo: str
    azucar_marca: str
    azucar_ntu: Optional[str] = None
    aux_standard: Optional[float] = None
    aux_hyflo: Optional[float] = None
    pasteurizado_desde: Optional[str] = None
    pasteurizado_hasta: Optional[str] = None
    pasteurizado_temp: Optional[float] = None
    responsables: List[str]


class JarabeTerminadoCreate(BaseModel):
    fecha: str
    sabor: str
    concentrado: str
    tanque: str
    unidades: int
    volcado_numero: str
    tiempo_filtrado: Optional[str] = None
    be_jarabe_simple: Optional[float] = None
    vol_jarabe_simple: Optional[float] = None
    lts_jarabe_terminado: Optional[float] = None
    responsables: List[str]


class SaneoTanqueCreate(BaseModel):
    fecha: str
    hora_inicio: str
    hora_fin: str
    tanque: str
    producto: str
    responsables: List[str]


class ParteJarabeCreate(BaseModel):
    fecha: str
    turno: str
    tanque: str
    numero_carga_trilay: str
    sabor: Optional[str] = None
    responsables: List[str]
    azucar: Optional[float] = None
    sucralosa: Optional[float] = None
    reforzado_citrico: Optional[float] = None
    acesulfame_k: Optional[float] = None
    benzoato_sodio: Optional[float] = None
    sorbato_potasio: Optional[float] = None
    citrato_sodio: Optional[float] = None
    acido_citrico: Optional[float] = None
    acido_fosforico: Optional[float] = None
    acido_ascorbico: Optional[float] = None
    cafeina: Optional[float] = None
    colorante_caramelo: Optional[float] = None

class ControlTorqueCreate(BaseModel):
    numero_cabezal: int
    turno: Optional[str] = None
    noche: Optional[str] = None
    linea: Optional[str] = None
    valor: float
    sabor: str
    marca: Optional[str] = None
    color: Optional[str] = None
    responsable: str

class ControlPausaCreate(BaseModel):
    motivo: str
    responsable: str
    observacion: Optional[str] = None
    turno: Optional[str] = None
    linea: Optional[str] = None




# --- RUTAS DE NAVEGACIÓN ---

@app.get("/", response_class=HTMLResponse)
async def get_index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"title": "Control de Calidad | Laboratorio"}
    )

@app.get("/preparacion-jarabe", response_class=HTMLResponse)
@app.get("/produccion-jarabe", response_class=HTMLResponse)
async def get_produccion_jarabe(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="produccion_jarabe.html",
        context={"title": "Preparación Sala de Jarabe | Laboratorio"}
    )

@app.get("/portal", response_class=HTMLResponse)
async def get_portal(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="portal.html",
        context={"title": "Portal de Calidad | Laboratorio"}
    )



# --- RUTAS DE LA API (MAESTRAS) ---

@app.post("/api/parse-jarabe-excel")
async def parse_jarabe_excel(file: UploadFile = File(...)):
    """Parsea el reporte Excel/HTML de Sala de Jarabe y extrae las cantidades e identificación."""
    try:
        content = await file.read()
        datos = extraer_datos_reporte(content, es_ruta=False)
        return {"status": "success", "data": datos}
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error al procesar el archivo Excel: {str(e)}")

@app.get("/api/marcas")
def get_marcas():
    m = load_maestros()
    return [{"id": i, "nombre": v} for i, v in enumerate(m.get("marcas", []), 1)]


@app.get("/api/tipos-concentrado")
def get_tipos_concentrado():
    m = load_maestros()
    return [{"id": i, "codigo": v} for i, v in enumerate(m.get("tipos_concentrado", []), 1)]


@app.get("/api/tamanos")
def get_tamanos():
    m = load_maestros()
    return [{"id": i, "valor": v} for i, v in enumerate(m.get("tamanos", []), 1)]


@app.get("/api/responsables")
def get_responsables():
    m = load_maestros()
    return [{"id": i, "nombre_completo": v} for i, v in enumerate(m.get("responsables", []), 1)]


@app.get("/api/responsables-jarabe")
def get_responsables_jarabe():
    """Responsables específicos para los formularios de Sala de Jarabe."""
    m = load_maestros()
    return [{"id": i, "nombre_completo": v} for i, v in enumerate(m.get("responsables_jarabe", []), 1)]


# --- RUTAS DE TRANSACCIONES (CONTROLES) ---

@app.post("/api/controles", response_model=RegistroCalidadResponse, status_code=status.HTTP_201_CREATED)
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
        lote_tapa=data.lote_tapa
    )
    
    db.add(db_registro)
    db.commit()
    db.refresh(db_registro)
    return db_registro


@app.post("/api/control-bebida", status_code=status.HTTP_201_CREATED)
def create_control_bebida(data: RegistroCalidadCreate, db: Session = Depends(get_db)):
    """Inserta en la tabla control_bebida guardando strings directamente."""
    now = datetime.now()
    hora_str = data.hora if (data.hora and data.hora.strip()) else now.strftime("%H:%M")
    try:
        hora_obj = datetime.strptime(hora_str, "%H:%M").time()
    except ValueError:
        hora_obj = now.time().replace(second=0, microsecond=0)

    linea_num = 1 if (data.linea or "") == "linea1" else 2

    registro = ControlBebida(
        marca=data.marca,
        concentrado=data.tipo_concentrado,
        tamano=data.tamano,
        responsable=data.responsable,
        tanque=data.tanque,
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
    return {"id": registro.id, "message": "Control de bebida registrado con éxito"}


@app.get("/api/controles", response_model=List[RegistroCalidadResponse])
def get_controles(db: Session = Depends(get_db)):
    # Devolver todos los registros ordenados del más reciente al más antiguo
    return db.query(RegistroCalidad).order_by(RegistroCalidad.id.desc()).all()


@app.delete("/api/controles/{control_id}")
def delete_control(control_id: int, db: Session = Depends(get_db)):
    control = db.query(RegistroCalidad).filter(RegistroCalidad.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Registro de control no encontrado")
    
    db.delete(control)
    db.commit()
    return {"message": "Registro eliminado con éxito"}

@app.post("/api/controles-jarabe", status_code=status.HTTP_201_CREATED)
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

@app.get("/api/controles-jarabe")
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

@app.delete("/api/controles-jarabe/{control_id}")
def delete_control_jarabe(control_id: int, db: Session = Depends(get_db)):
    control = db.query(ControlJarabe).filter(ControlJarabe.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Registro de jarabe no encontrado")
    db.delete(control)
    db.commit()
    return {"message": "Registro eliminado con éxito"}


# --- RUTAS: JARABE SIMPLE ---

@app.post("/api/jarabe-simple", status_code=status.HTTP_201_CREATED)
def create_jarabe_simple(data: JarabeSimpleCreate, db: Session = Depends(get_db)):
    """Registra una preparación de jarabe simple."""
    from datetime import date as date_type
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


# --- RUTAS: JARABE TERMINADO ---

@app.post("/api/jarabe-terminado", status_code=status.HTTP_201_CREATED)
def create_jarabe_terminado(data: JarabeTerminadoCreate, db: Session = Depends(get_db)):
    """Registra una preparación de jarabe terminado."""
    from datetime import date as date_type
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


# --- RUTAS: SANEO DE TANQUES ---

@app.post("/api/saneo-tanques", status_code=status.HTTP_201_CREATED)
def create_saneo_tanque(data: SaneoTanqueCreate, db: Session = Depends(get_db)):
    """Registra un saneo (CIP) de tanque."""
    from datetime import date as date_type
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
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Saneo de tanque registrado con éxito"}


# --- RUTAS: PARTE DE JARABE ---

@app.post("/api/parte-jarabe", status_code=status.HTTP_201_CREATED)
def create_parte_jarabe(data: ParteJarabeCreate, db: Session = Depends(get_db)):
    """Registra un parte de dosificación de jarabe."""
    from datetime import date as date_type
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

@app.get("/api/sabores")
def get_sabores():
    """Marcas para Control de Jarabe, excluyendo Soda y Sifon."""
    excluidas = {"soda", "sifon"}
    m = load_maestros()
    marcas = [v for v in m.get("marcas", []) if v.strip().lower() not in excluidas]
    return [{"id": i, "nombre": v} for i, v in enumerate(marcas, 1)]


@app.get("/api/tanques")
def get_tanques():
    m = load_maestros()
    tanques = m.get("tanques", [])
    return [{"id": i, "numero": v} for i, v in enumerate(tanques, 1)]

# --- RUTAS DE CONTROL DE TORQUE ---

@app.post("/api/controles-torque", status_code=status.HTTP_201_CREATED)
def create_control_torque(data: ControlTorqueCreate, db: Session = Depends(get_db)):
    """Inserta en la tabla control_torque guardando strings directamente."""
    now = datetime.now()
    linea_num = 1 if (data.linea or "") == "linea1" else (2 if (data.linea or "") == "linea2" else 1)
    turno_final = data.noche if ((data.turno or "").lower() == "noche" and data.noche) else data.turno
    if turno_final and turno_final.lower() in ["mañana", "tarde", "noche"]:
        turno_final = turno_final.capitalize()

    registro = ControlTorque(
        fecha=now.date(),
        hora=now.time().replace(second=0, microsecond=0),
        turno=turno_final,
        linea=linea_num,
        numero_cabezal=data.numero_cabezal,
        sabor=data.sabor,
        color=data.color,
        valor=data.valor,
        responsable=data.responsable,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Control de torque registrado con éxito"}

@app.get("/api/controles-torque")
def get_controles_torque(db: Session = Depends(get_db)):
    controles = db.query(ControlTorque).order_by(ControlTorque.id.desc()).all()
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
            "valor": float(c.valor) if c.valor is not None else None,
            "responsable": c.responsable,
        }
        for c in controles
    ]

@app.delete("/api/controles-torque/{control_id}")
def delete_control_torque(control_id: int, db: Session = Depends(get_db)):
    control = db.query(ControlTorque).filter(ControlTorque.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Registro de torque no encontrado")
    db.delete(control)
    db.commit()
    return {"message": "Registro eliminado con éxito"}

# --- RUTAS DE CONTROL DE PAUSAS ---

@app.post("/api/pausas", status_code=status.HTTP_201_CREATED)
def create_pausa(data: ControlPausaCreate, db: Session = Depends(get_db)):
    """Registra una pausa de línea guardando strings directamente."""
    now = datetime.now()
    linea_num = 1 if (data.linea or "") == "linea1" else (2 if (data.linea or "") == "linea2" else 1)
    turno_val = (data.turno or "").capitalize() if (data.turno or "").lower() in ["mañana", "tarde", "noche"] else data.turno

    registro = ControlPausa(
        fecha=now.date(),
        hora=now.time().replace(second=0, microsecond=0),
        turno=turno_val,
        linea=linea_num,
        motivo=data.motivo,
        responsable=data.responsable,
        observacion=data.observacion.strip() if data.observacion and data.observacion.strip() else None
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Pausa registrada con éxito"}

@app.get("/api/pausas")
def get_pausas(db: Session = Depends(get_db)):
    pausas = db.query(ControlPausa).order_by(ControlPausa.id.desc()).all()
    return [
        {
            "id": p.id,
            "fecha": str(p.fecha) if p.fecha else None,
            "hora": p.hora.strftime("%H:%M") if p.hora else None,
            "turno": p.turno,
            "linea": p.linea,
            "motivo": p.motivo,
            "responsable": p.responsable,
            "observacion": p.observacion
        }
        for p in pausas
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
