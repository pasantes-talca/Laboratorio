from sqlalchemy import Column, Integer, String, Float, Date, Time, Text
from backend.app.models.base import Base


class ControlJarabe(Base):
    __tablename__ = "control_jarabe"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    turno = Column(String(20), nullable=True)
    fecha = Column(Date, nullable=True)
    hora = Column(Time, nullable=False)
    sabor = Column(String(100), nullable=False)
    concentrado = Column(String(50), nullable=False)
    tanque = Column(String(20), nullable=False)
    grados_brix_patron = Column(Float, nullable=False)
    t_a = Column(Float, nullable=False)
    responsable = Column(String(100), nullable=False)
    observacion = Column(String, nullable=True)
    numero_carga_trilay = Column(String(100), nullable=True)


class JarabeSimple(Base):
    __tablename__ = "jarabe_simple"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=True)
    tanque = Column(String(20), nullable=False)
    volcado_numero = Column(Integer, nullable=False)
    cantidad_bolsas = Column(Integer, nullable=False)
    azucar_tipo = Column(String(50), nullable=False)
    azucar_marca = Column(Text, nullable=False)
    azucar_ntu = Column(Text, nullable=True)
    aux_standard = Column(Float, nullable=True)
    aux_hyflo = Column(Float, nullable=True)
    pasteurizado_desde = Column(Time, nullable=True)
    pasteurizado_hasta = Column(Time, nullable=True)
    pasteurizado_temp = Column(Float, nullable=True)
    responsables = Column(Text, nullable=False)


class JarabeTerminado(Base):
    __tablename__ = "jarabe_terminado"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=False)
    sabor = Column(String(100), nullable=False)
    concentrado = Column(String(50), nullable=False)
    tanque = Column(String(20), nullable=False)
    unidades = Column(Integer, nullable=False)
    volcado_numero = Column(Text, nullable=False)
    tiempo_filtrado = Column(String(50), nullable=True)
    be_jarabe_simple = Column(Float, nullable=True)
    vol_jarabe_simple = Column(Float, nullable=True)
    lts_jarabe_terminado = Column(Float, nullable=True)
    responsables = Column(Text, nullable=False)


class SaneoTanque(Base):
    __tablename__ = "saneo_tanques"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=True)
    hora_fin = Column(Time, nullable=True)
    tanque = Column(String(20), nullable=False)
    producto = Column(String(255), nullable=False)
    responsables = Column(Text, nullable=False)
    numero_saneo = Column(Integer, nullable=True)


class ParteJarabe(Base):
    __tablename__ = "parte_jarabe"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=False)
    turno = Column(String(20), nullable=False)
    tanque = Column(String(20), nullable=False)
    sabor = Column(String(100), nullable=True)
    numero_carga_trilay = Column(String(100), nullable=False)
    responsables = Column(Text, nullable=False)
    azucar = Column(Float, nullable=True)
    sucralosa = Column(Float, nullable=True)
    reforzado_citrico = Column(Float, nullable=True)
    acesulfame_k = Column(Float, nullable=True)
    benzoato_sodio = Column(Float, nullable=True)
    sorbato_potasio = Column(Float, nullable=True)
    citrato_sodio = Column(Float, nullable=True)
    acido_citrico = Column(Float, nullable=True)
    acido_fosforico = Column(Float, nullable=True)
    acido_ascorbico = Column(Float, nullable=True)
    cafeina = Column(Float, nullable=True)
    colorante_caramelo = Column(Float, nullable=True)
