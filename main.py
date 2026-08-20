import os
import time
from typing import List, Optional
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy.orm import Session
from database import init_db, get_db, Marca, TipoConcentrado, Tamano, Tanque, Responsable, RegistroCalidad, ControlJarabe, ControlBebida, ControlTorque, ControlPausa


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

@app.get("/api/marcas")
def get_marcas(db: Session = Depends(get_db)):
    marcas = db.query(Marca).order_by(Marca.nombre).all()
    return [{"id": m.id, "nombre": m.nombre} for m in marcas]


@app.get("/api/tipos-concentrado")
def get_tipos_concentrado(db: Session = Depends(get_db)):
    tipos = db.query(TipoConcentrado).order_by(TipoConcentrado.codigo).all()
    return [{"id": t.id, "codigo": t.codigo} for t in tipos]


@app.get("/api/tamanos")
def get_tamanos(db: Session = Depends(get_db)):
    tamanos = db.query(Tamano).order_by(Tamano.valor).all()
    # Limpiamos el valor por si acaso tiene espacios
    return [{"id": t.id, "valor": t.valor.strip()} for t in tamanos]


@app.get("/api/responsables")
def get_responsables(db: Session = Depends(get_db)):
    responsables = db.query(Responsable).order_by(Responsable.apellido, Responsable.nombre).all()
    # Devolver nombre y apellido combinados para los dropdowns
    return [
        {
            "id": r.id,
            "nombre_completo": f"{r.nombre} {r.apellido}".strip()
        } for r in responsables
    ]


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
    """Inserta en la tabla control_bebida resolviendo FKs por nombre."""
    now = datetime.now()

    # Convertir hora a objeto time (TIME sin timezone)
    hora_str = data.hora if (data.hora and data.hora.strip()) else now.strftime("%H:%M")
    try:
        hora_obj = datetime.strptime(hora_str, "%H:%M").time()
    except ValueError:
        hora_obj = now.time().replace(second=0, microsecond=0)

    # Resolver FK: marca
    marca_obj = db.query(Marca).filter(Marca.nombre == data.marca).first()
    if not marca_obj:
        raise HTTPException(status_code=422, detail=f"Marca '{data.marca}' no encontrada")

    # Resolver FK: concentrado
    conc_obj = db.query(TipoConcentrado).filter(TipoConcentrado.codigo == data.tipo_concentrado).first()
    if not conc_obj:
        raise HTTPException(status_code=422, detail=f"Concentrado '{data.tipo_concentrado}' no encontrado")

    # Resolver FK: tamaño (comparación con strip para evitar espacios)
    tam_obj = db.query(Tamano).filter(Tamano.valor == data.tamano).first()
    if not tam_obj:
        # Fallback: buscar ignorando espacios
        for t in db.query(Tamano).all():
            if t.valor.strip() == data.tamano.strip():
                tam_obj = t
                break
    if not tam_obj:
        raise HTTPException(status_code=422, detail=f"Tamaño '{data.tamano}' no encontrado")

    # Resolver FK: responsable — buscar en todos y comparar nombre completo
    responsable_buscado = data.responsable.strip()
    resp_obj = None
    for r in db.query(Responsable).all():
        nombre_completo = f"{r.nombre} {r.apellido}".strip()
        if nombre_completo == responsable_buscado:
            resp_obj = r
            break
    if not resp_obj:
        raise HTTPException(status_code=422, detail=f"Responsable '{data.responsable}' no encontrado")

    # Determinar número de línea
    linea_num = 1 if (data.linea or "") == "linea1" else 2

    # Resolver FK: tanque (opcional)
    tanque_id = None
    if data.tanque:
        tanque_obj = db.query(Tanque).filter(Tanque.numero == data.tanque).first()
        if tanque_obj:
            tanque_id = tanque_obj.id

    registro = ControlBebida(
        marca_id=marca_obj.id,
        concentrado_id=conc_obj.id,
        tamano_id=tam_obj.id,
        responsable_id=resp_obj.id,
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
        tanque_id=tanque_id,
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
    """Inserta en la tabla control_jarabe resolviendo FKs por nombre/código/número."""
    now = datetime.now()

    # Convertir hora a objeto time (TIME sin timezone)
    hora_str = data.hora if (data.hora and data.hora.strip()) else now.strftime("%H:%M")
    try:
        hora_obj = datetime.strptime(hora_str, "%H:%M").time()
    except ValueError:
        hora_obj = now.time().replace(second=0, microsecond=0)

    # Resolver FK: marca (sabor)
    marca_obj = db.query(Marca).filter(Marca.nombre == data.sabor).first()
    if not marca_obj:
        raise HTTPException(status_code=422, detail=f"Sabor '{data.sabor}' no encontrado")

    # Resolver FK: concentrado
    conc_obj = db.query(TipoConcentrado).filter(TipoConcentrado.codigo == data.concentrado).first()
    if not conc_obj:
        raise HTTPException(status_code=422, detail=f"Concentrado '{data.concentrado}' no encontrado")

    # Resolver FK: tanque
    tanque_buscado = data.tanque.strip()
    tanque_obj = db.query(Tanque).filter(Tanque.numero == data.tanque).first()
    if not tanque_obj:
        for t in db.query(Tanque).all():
            if (t.numero or "").strip() == tanque_buscado:
                tanque_obj = t
                break
    if not tanque_obj:
        raise HTTPException(status_code=422, detail=f"Tanque '{data.tanque}' no encontrado")

    # Resolver FK: responsable
    responsable_buscado = data.responsable.strip()
    resp_obj = None
    for r in db.query(Responsable).all():
        nombre_completo = f"{r.nombre} {r.apellido}".strip()
        if nombre_completo == responsable_buscado:
            resp_obj = r
            break
    if not resp_obj:
        raise HTTPException(status_code=422, detail=f"Responsable '{data.responsable}' no encontrado")

    registro = ControlJarabe(
        turno=data.turno,
        fecha=now.date(),
        hora=hora_obj,
        marca_id=marca_obj.id,
        concentrado_id=conc_obj.id,
        tanque_id=tanque_obj.id,
        grados_brix_patron=data.bx_patron,
        t_a=data.ta,
        responsable_id=resp_obj.id,
        observacion=data.observacion.strip() if data.observacion and data.observacion.strip() else None,
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Control de jarabe registrado con éxito"}

@app.get("/api/controles-jarabe")
def get_controles_jarabe(db: Session = Depends(get_db)):
    controles = db.query(ControlJarabe).order_by(ControlJarabe.id.desc()).all()
    marcas = {m.id: m.nombre for m in db.query(Marca).all()}
    concentrados = {c.id: c.codigo for c in db.query(TipoConcentrado).all()}
    tanques = {t.id: (t.numero or "").strip() for t in db.query(Tanque).all()}
    responsables = {r.id: f"{r.nombre} {r.apellido}".strip() for r in db.query(Responsable).all()}

    return [
        {
            "id": c.id,
            "turno": c.turno,
            "fecha": str(c.fecha) if c.fecha else None,
            "hora": c.hora.strftime("%H:%M") if c.hora else None,
            "sabor": marcas.get(c.marca_id, str(c.marca_id)),
            "concentrado": concentrados.get(c.concentrado_id, str(c.concentrado_id)),
            "tanque": tanques.get(c.tanque_id, str(c.tanque_id)),
            "bx_patron": float(c.grados_brix_patron) if c.grados_brix_patron is not None else None,
            "ta": float(c.t_a) if c.t_a is not None else None,
            "responsable": responsables.get(c.responsable_id, str(c.responsable_id)),
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

@app.get("/api/sabores")
def get_sabores(db: Session = Depends(get_db)):
    """Marcas para Control de Jarabe, excluyendo Soda y Sifon."""
    excluidas = {"soda", "sifon"}
    marcas = db.query(Marca).order_by(Marca.nombre).all()
    return [{"id": m.id, "nombre": m.nombre} for m in marcas
            if m.nombre.strip().lower() not in excluidas]

@app.get("/api/tanques")
def get_tanques(db: Session = Depends(get_db)):
    tanques = db.query(Tanque).all()

    def clave_orden(t):
        n = (t.numero or "").strip()
        return (0, int(n), "") if n.isdigit() else (1, 0, n)

    return [{"id": t.id, "numero": (t.numero or "").strip()}
            for t in sorted(tanques, key=clave_orden)]

# --- RUTAS DE CONTROL DE TORQUE ---

@app.post("/api/controles-torque", status_code=status.HTTP_201_CREATED)
def create_control_torque(data: ControlTorqueCreate, db: Session = Depends(get_db)):
    """Inserta en la tabla control_torque resolviendo FKs."""
    now = datetime.now()

    # Resolver FK: marca (desde el sabor seleccionado)
    marca_obj = db.query(Marca).filter(Marca.nombre == data.sabor).first()
    if not marca_obj:
        raise HTTPException(status_code=422, detail=f"Sabor/Marca '{data.sabor}' no encontrado")

    # Resolver FK: responsable
    responsable_buscado = data.responsable.strip()
    resp_obj = None
    for r in db.query(Responsable).all():
        nombre_completo = f"{r.nombre} {r.apellido}".strip()
        if nombre_completo == responsable_buscado:
            resp_obj = r
            break
    if not resp_obj:
        raise HTTPException(status_code=422, detail=f"Responsable '{data.responsable}' no encontrado")

    # Determinar número de línea (1 o 2)
    linea_num = 1 if (data.linea or "") == "linea1" else (2 if (data.linea or "") == "linea2" else 1)

    # Determinar turno: si es noche y tiene noche 1 o noche 2
    turno_final = data.noche if ((data.turno or "").lower() == "noche" and data.noche) else data.turno
    if turno_final and turno_final.lower() in ["mañana", "tarde", "noche"]:
        turno_final = turno_final.capitalize()

    registro = ControlTorque(
        fecha=now.date(),
        hora=now.time().replace(second=0, microsecond=0),
        turno=turno_final,
        linea=linea_num,
        numero_cabezal=data.numero_cabezal,
        marca_id=marca_obj.id,
        responsable_id=resp_obj.id,
        sabor=data.sabor,
        color=data.color,
        valor=data.valor
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Control de torque registrado con éxito"}

@app.get("/api/controles-torque")
def get_controles_torque(db: Session = Depends(get_db)):
    controles = db.query(ControlTorque).order_by(ControlTorque.id.desc()).all()
    marcas = {m.id: m.nombre for m in db.query(Marca).all()}
    responsables = {r.id: f"{r.nombre} {r.apellido}".strip() for r in db.query(Responsable).all()}

    return [
        {
            "id": c.id,
            "fecha": str(c.fecha) if c.fecha else None,
            "hora": c.hora.strftime("%H:%M") if c.hora else None,
            "turno": c.turno,
            "linea": c.linea,
            "numero_cabezal": c.numero_cabezal,
            "sabor": c.sabor or marcas.get(c.marca_id, str(c.marca_id)),
            "color": c.color,
            "valor": float(c.valor) if c.valor is not None else None,
            "responsable": responsables.get(c.responsable_id, str(c.responsable_id))
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
    """Registra una pausa de línea resolviendo FK del responsable."""
    now = datetime.now()

    # Resolver FK: responsable
    responsable_buscado = data.responsable.strip()
    resp_obj = None
    for r in db.query(Responsable).all():
        nombre_completo = f"{r.nombre} {r.apellido}".strip()
        if nombre_completo == responsable_buscado:
            resp_obj = r
            break
    if not resp_obj:
        raise HTTPException(status_code=422, detail=f"Responsable '{data.responsable}' no encontrado")

    # Determinar número de línea
    linea_num = 1 if (data.linea or "") == "linea1" else (2 if (data.linea or "") == "linea2" else 1)

    turno_val = (data.turno or "").capitalize() if (data.turno or "").lower() in ["mañana", "tarde", "noche"] else data.turno

    registro = ControlPausa(
        fecha=now.date(),
        hora=now.time().replace(second=0, microsecond=0),
        turno=turno_val,
        linea=linea_num,
        motivo=data.motivo,
        responsable_id=resp_obj.id,
        observacion=data.observacion.strip() if data.observacion and data.observacion.strip() else None
    )
    db.add(registro)
    db.commit()
    db.refresh(registro)
    return {"id": registro.id, "message": "Pausa registrada con éxito"}

@app.get("/api/pausas")
def get_pausas(db: Session = Depends(get_db)):
    pausas = db.query(ControlPausa).order_by(ControlPausa.id.desc()).all()
    responsables = {r.id: f"{r.nombre} {r.apellido}".strip() for r in db.query(Responsable).all()}

    return [
        {
            "id": p.id,
            "fecha": str(p.fecha) if p.fecha else None,
            "hora": p.hora.strftime("%H:%M") if p.hora else None,
            "turno": p.turno,
            "linea": p.linea,
            "motivo": p.motivo,
            "responsable": responsables.get(p.responsable_id, str(p.responsable_id)),
            "observacion": p.observacion
        }
        for p in pausas
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
