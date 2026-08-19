import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Date, Time, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker

# Cargar variables de entorno
load_dotenv()

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "calidad")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Crear motor de base de datos
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Configurar sesión local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarar esquema específico
metadata = MetaData(schema="laboratorio")
Base = declarative_base(metadata=metadata)

# Modelos para tablas maestras existentes
class Marca(Base):
    __tablename__ = "marcas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)

class TipoConcentrado(Base):
    __tablename__ = "tipos_concentrado"
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), nullable=False)

class Tamano(Base):
    __tablename__ = "tamanos"
    id = Column(Integer, primary_key=True, index=True)
    valor = Column(String(20), nullable=False)

class Tanque(Base):
    __tablename__ = "tanques"
    id = Column(Integer, primary_key=True, index=True)
    numero = Column(String(10), nullable=False)

class Responsable(Base):
    __tablename__ = "responsables"
    id = Column(Integer, primary_key=True, index=True)
    apellido = Column(String(50), nullable=False)
    nombre = Column(String(50), nullable=False)

# Nuevo modelo para guardar los resultados del formulario de control de calidad
class RegistroCalidad(Base):
    __tablename__ = "registro_calidad"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    
    # Datos de producción (Sidebar/Cuadro)
    marca = Column(String(100), nullable=False)
    tipo_concentrado = Column(String(50), nullable=False)
    tamano = Column(String(50), nullable=False)
    lote_tapa = Column(String(100), nullable=False)
    
    # Datos de control de calidad
    hora = Column(String(50), nullable=False)
    carac_organolep = Column(String(20), nullable=False)  # "okey" / "no okey"
    nivel_llenado = Column(String(50), nullable=False)
    contenido = Column(Float, nullable=False)
    presion = Column(Float, nullable=False)
    temperatura = Column(Float, nullable=False)
    vol_gas = Column(Float, nullable=False)
    brix = Column(Float, nullable=False)
    control_videojet = Column(String(20), nullable=False)  # "okey" / "no okey"
    responsable = Column(String(100), nullable=False)       # Nombre + Apellido combinados

# Nuevo modelo para el Control de Jarabe
class ControlJarabe(Base):
    __tablename__ = "control_jarabe"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    hora = Column(String(50), nullable=False)
    sabor = Column(String(100), nullable=False)        # marca (sin Soda ni Sifon)
    concentrado = Column(String(50), nullable=False)   # código de tipos_concentrado
    tanque = Column(String(10), nullable=False)        # número de tanque
    bx_patron = Column(Float, nullable=False)          # °Bx Patr.
    ta = Column(Float, nullable=False)                 # T.A.
    responsable = Column(String(100), nullable=False)
    observacion = Column(String(500), nullable=True) 
    
  # opcional

# Modelo para la tabla control_bebida (con FKs a tablas maestras)
class ControlBebida(Base):
    __tablename__ = "control_bebida"

    id              = Column(Integer, primary_key=True, index=True, autoincrement=True)
    marca_id        = Column(Integer, nullable=False)
    concentrado_id  = Column(Integer, nullable=False)
    tamano_id       = Column(Integer, nullable=False)
    responsable_id  = Column(Integer, nullable=False)
    linea           = Column(Integer, nullable=True)
    turno           = Column(String(20), nullable=True)
    fecha           = Column(Date, nullable=True)
    hora            = Column(Time, nullable=False)
    carac_organolep = Column(String(50), nullable=True)
    nivel_llenado   = Column(String(50), nullable=True)
    contenido       = Column(Float, nullable=True)
    presion         = Column(Float, nullable=True)
    temperatura     = Column(Float, nullable=True)
    vol_gas         = Column(Float, nullable=True)
    grados_brix     = Column(Float, nullable=True)
    lote_tapa       = Column(String(50), nullable=True)
    control_video_jet = Column(String(50), nullable=True)
    tanque_id       = Column(Integer, nullable=True)

# Función para inicializar las tablas
def init_db():
    # Crear las tablas que no existan en el esquema (en este caso creará 'registro_calidad')
    Base.metadata.create_all(bind=engine)

# Dependencia para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
