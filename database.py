import os
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Date, Time, MetaData, Text, ForeignKey
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

# Modelo para la tabla control_jarabe (con FKs a tablas maestras)
class ControlJarabe(Base):
    __tablename__ = "control_jarabe"

    id                 = Column(Integer, primary_key=True, index=True, autoincrement=True)
    turno              = Column(String(20), nullable=True)
    fecha              = Column(Date, nullable=True)
    hora               = Column(Time, nullable=False)
    marca_id           = Column(Integer, nullable=False)
    concentrado_id     = Column(Integer, nullable=False)
    tanque_id          = Column(Integer, nullable=False)
    grados_brix_patron = Column(Float, nullable=False)
    t_a                = Column(Float, nullable=False)
    responsable_id     = Column(Integer, nullable=False)
    observacion        = Column(String, nullable=True)
    numero_carga_trilay = Column(String(100), nullable=True)


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

# Modelo para la tabla control_torque (con FKs a marcas y responsables)
class ControlTorque(Base):
    __tablename__ = "control_torque"

    id             = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha          = Column(Date, nullable=True)
    hora           = Column(Time, nullable=True)
    turno          = Column(String(20), nullable=True)
    linea          = Column(Integer, nullable=True)
    numero_cabezal = Column(Integer, nullable=False)
    marca_id       = Column(Integer, nullable=False)
    responsable_id = Column(Integer, nullable=False)
    sabor          = Column(String(50), nullable=True)
    color          = Column(String(50), nullable=True)
    valor          = Column(Float, nullable=False)

# Modelo para la tabla control_pausas (con FK a responsables)
class ControlPausa(Base):
    __tablename__ = "control_pausas"

    id             = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha          = Column(Date, nullable=True)
    hora           = Column(Time, nullable=True)
    turno          = Column(String(20), nullable=True)
    linea          = Column(Integer, nullable=True)
    motivo         = Column(String(100), nullable=False)
    responsable_id = Column(Integer, nullable=False)
    observacion    = Column(String, nullable=True)


# ============================================================
# Nuevas tablas para los formularios de Sala de Jarabe
# ============================================================

class JarabeSimple(Base):
    """Registro de preparación de jarabe simple."""
    __tablename__ = "jarabe_simple"

    id                  = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha               = Column(Date, nullable=False)
    hora                = Column(Time, nullable=True)
    tanque_id           = Column(Integer, ForeignKey("laboratorio.tanques.id"), nullable=False)
    volcado_numero      = Column(Integer, nullable=False)
    cantidad_bolsas     = Column(Integer, nullable=False)
    azucar_tipo         = Column(String(50), nullable=False)
    azucar_marca        = Column(String(100), nullable=False)
    azucar_ntu          = Column(Float, nullable=True)
    aux_standard        = Column(Float, nullable=True)
    aux_hyflo           = Column(Float, nullable=True)
    pasteurizado_desde  = Column(Time, nullable=True)
    pasteurizado_hasta  = Column(Time, nullable=True)
    pasteurizado_temp   = Column(Float, nullable=True)
    responsables        = Column(Text, nullable=False)          # JSON array of names


class JarabeTerminado(Base):
    """Registro de preparación de jarabe terminado."""
    __tablename__ = "jarabe_terminado"

    id                     = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha                  = Column(Date, nullable=False)
    marca_id               = Column(Integer, ForeignKey("laboratorio.marcas.id"), nullable=False)
    concentrado_id         = Column(Integer, ForeignKey("laboratorio.tipos_concentrado.id"), nullable=False)
    tanque_id              = Column(Integer, ForeignKey("laboratorio.tanques.id"), nullable=False)
    unidades               = Column(Integer, nullable=False)
    volcado_numero         = Column(Integer, nullable=False)
    tiempo_filtrado        = Column(String(50), nullable=True)
    be_jarabe_simple       = Column(Float, nullable=True)
    vol_jarabe_simple      = Column(Float, nullable=True)
    lts_jarabe_terminado   = Column(Float, nullable=True)
    responsables           = Column(Text, nullable=False)       # JSON array of names


class SaneoTanque(Base):
    """Registro de saneo (CIP) de tanques."""
    __tablename__ = "saneo_tanques"

    id             = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha          = Column(Date, nullable=False)
    hora           = Column(Time, nullable=True)
    tanque_id      = Column(Integer, ForeignKey("laboratorio.tanques.id"), nullable=False)
    producto       = Column(String(255), nullable=False)
    responsables   = Column(Text, nullable=False)               # JSON array of names


class ParteJarabe(Base):
    """Parte de dosificación de ingredientes por tanque."""
    __tablename__ = "parte_jarabe"

    id                    = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha                 = Column(Date, nullable=False)
    turno                 = Column(String(20), nullable=False)
    tanque_id             = Column(Integer, ForeignKey("laboratorio.tanques.id"), nullable=False)
    numero_carga_trilay   = Column(String(100), nullable=False)
    marca_id              = Column(Integer, ForeignKey("laboratorio.marcas.id"), nullable=True)
    responsables          = Column(Text, nullable=False)        # JSON array of names
    # Componentes
    azucar                = Column(Float, nullable=True)
    sucralosa             = Column(Float, nullable=True)
    acesulfame_k          = Column(Float, nullable=True)
    benzoato_sodio        = Column(Float, nullable=True)
    sorbato_potasio       = Column(Float, nullable=True)
    citrato_sodio         = Column(Float, nullable=True)
    acido_citrico         = Column(Float, nullable=True)
    acido_fosforico       = Column(Float, nullable=True)
    acido_ascorbico       = Column(Float, nullable=True)
    cafeina               = Column(Float, nullable=True)
    colorante_caramelo    = Column(Float, nullable=True)

# Función para inicializar las tablas
def init_db():
    Base.metadata.create_all(bind=engine)



# Dependencia para obtener la sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
