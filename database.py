import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Date, Time, MetaData, Text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DB_USER     = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST     = os.getenv("DB_HOST", "localhost")
DB_PORT     = os.getenv("DB_PORT", "5432")
DB_NAME     = os.getenv("DB_NAME", "calidad")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine       = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

metadata = MetaData(schema="laboratorio")
Base     = declarative_base(metadata=metadata)

class RegistroCalidad(Base):
    __tablename__ = "registro_calidad"
    id               = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_registro   = Column(DateTime, default=datetime.utcnow)
    marca            = Column(String(100), nullable=False)
    tipo_concentrado = Column(String(50),  nullable=False)
    tamano           = Column(String(50),  nullable=False)
    lote_tapa        = Column(String(100), nullable=False)
    hora             = Column(String(50),  nullable=False)
    carac_organolep  = Column(String(20),  nullable=False)
    nivel_llenado    = Column(String(50),  nullable=False)
    contenido        = Column(Float,       nullable=False)
    presion          = Column(Float,       nullable=False)
    temperatura      = Column(Float,       nullable=False)
    vol_gas          = Column(Float,       nullable=False)
    brix             = Column(Float,       nullable=False)
    control_videojet = Column(String(20),  nullable=False)
    responsable      = Column(String(100), nullable=False)

class ControlJarabe(Base):
    __tablename__ = "control_jarabe"
    id                  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    turno               = Column(String(20),  nullable=True)
    fecha               = Column(Date,        nullable=True)
    hora                = Column(Time,        nullable=False)
    sabor               = Column(String(100), nullable=False)
    concentrado         = Column(String(50),  nullable=False)
    tanque              = Column(String(20),  nullable=False)
    grados_brix_patron  = Column(Float,       nullable=False)
    t_a                 = Column(Float,       nullable=False)
    responsable         = Column(String(100), nullable=False)
    observacion         = Column(String,      nullable=True)
    numero_carga_trilay = Column(String(100), nullable=True)

class ControlBebida(Base):
    __tablename__ = "control_bebida"
    id               = Column(Integer, primary_key=True, index=True, autoincrement=True)
    marca            = Column(String(100), nullable=True)
    concentrado      = Column(String(50),  nullable=True)
    tamano           = Column(String(50),  nullable=True)
    responsable      = Column(String(100), nullable=True)
    tanque           = Column(String(20),  nullable=True)
    linea            = Column(Integer,     nullable=True)
    turno            = Column(String(20),  nullable=True)
    fecha            = Column(Date,        nullable=True)
    hora             = Column(Time,        nullable=False)
    carac_organolep  = Column(String(50),  nullable=True)
    nivel_llenado    = Column(String(50),  nullable=True)
    contenido        = Column(Float,       nullable=True)
    presion          = Column(Float,       nullable=True)
    temperatura      = Column(Float,       nullable=True)
    vol_gas          = Column(Float,       nullable=True)
    grados_brix      = Column(Float,       nullable=True)
    lote_tapa        = Column(String(50),  nullable=True)
    control_video_jet= Column(String(50),  nullable=True)

class ControlTorque(Base):
    __tablename__ = "control_torque"
    id             = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha          = Column(Date,        nullable=True)
    hora           = Column(Time,        nullable=True)
    turno          = Column(String(20),  nullable=True)
    linea          = Column(Integer,     nullable=True)
    numero_cabezal = Column(Integer,     nullable=False)
    sabor          = Column(String(50),  nullable=True)
    color          = Column(String(50),  nullable=True)
    valor          = Column(Float,       nullable=False)
    responsable    = Column(String(100), nullable=False)

class ControlPausa(Base):
    __tablename__ = "control_pausas"
    id           = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha        = Column(Date,        nullable=True)
    hora         = Column(Time,        nullable=True)
    turno        = Column(String(20),  nullable=True)
    linea        = Column(Integer,     nullable=True)
    motivo       = Column(String(100), nullable=False)
    responsable  = Column(String(100), nullable=False)
    observacion  = Column(String,      nullable=True)

class JarabeSimple(Base):
    __tablename__ = "jarabe_simple"
    id                 = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha              = Column(Date,    nullable=False)
    hora               = Column(Time,    nullable=True)
    tanque             = Column(String(20),  nullable=False)
    volcado_numero     = Column(Integer, nullable=False)
    cantidad_bolsas    = Column(Integer, nullable=False)
    azucar_tipo        = Column(String(50),  nullable=False)
    azucar_marca       = Column(Text,    nullable=False)
    azucar_ntu         = Column(Text,    nullable=True)
    aux_standard       = Column(Float,   nullable=True)
    aux_hyflo          = Column(Float,   nullable=True)
    pasteurizado_desde = Column(Time,    nullable=True)
    pasteurizado_hasta = Column(Time,    nullable=True)
    pasteurizado_temp  = Column(Float,   nullable=True)
    responsables       = Column(Text,    nullable=False)

class JarabeTerminado(Base):
    __tablename__ = "jarabe_terminado"
    id                   = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha                = Column(Date,    nullable=False)
    sabor                = Column(String(100), nullable=False)
    concentrado          = Column(String(50),  nullable=False)
    tanque               = Column(String(20),  nullable=False)
    unidades             = Column(Integer, nullable=False)
    volcado_numero       = Column(Text,    nullable=False)
    tiempo_filtrado      = Column(String(50), nullable=True)
    be_jarabe_simple     = Column(Float,   nullable=True)
    vol_jarabe_simple    = Column(Float,   nullable=True)
    lts_jarabe_terminado = Column(Float,   nullable=True)
    responsables         = Column(Text,    nullable=False)

class SaneoTanque(Base):
    __tablename__ = "saneo_tanques"
    id           = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha        = Column(Date,    nullable=False)
    hora_inicio  = Column(Time,    nullable=True)
    hora_fin     = Column(Time,    nullable=True)
    tanque       = Column(String(20),  nullable=False)
    producto     = Column(String(255), nullable=False)
    responsables = Column(Text,    nullable=False)

class ParteJarabe(Base):
    __tablename__ = "parte_jarabe"
    id                  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha               = Column(Date,    nullable=False)
    turno               = Column(String(20),  nullable=False)
    tanque              = Column(String(20),  nullable=False)
    sabor               = Column(String(100), nullable=True)
    numero_carga_trilay = Column(String(100), nullable=False)
    responsables        = Column(Text,    nullable=False)
    azucar              = Column(Float,   nullable=True)
    sucralosa           = Column(Float,   nullable=True)
    reforzado_citrico   = Column(Float,   nullable=True)
    acesulfame_k        = Column(Float,   nullable=True)
    benzoato_sodio      = Column(Float,   nullable=True)
    sorbato_potasio     = Column(Float,   nullable=True)
    citrato_sodio       = Column(Float,   nullable=True)
    acido_citrico       = Column(Float,   nullable=True)
    acido_fosforico     = Column(Float,   nullable=True)
    acido_ascorbico     = Column(Float,   nullable=True)
    cafeina             = Column(Float,   nullable=True)
    colorante_caramelo  = Column(Float,   nullable=True)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
