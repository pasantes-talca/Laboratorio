from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Time
from backend.app.models.base import Base


class RegistroCalidad(Base):
    __tablename__ = "registro_calidad"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    marca = Column(String(100), nullable=False)
    tipo_concentrado = Column(String(50), nullable=False)
    tamano = Column(String(50), nullable=False)
    lote_tapa = Column(String(100), nullable=False)
    hora = Column(String(50), nullable=False)
    carac_organolep = Column(String(20), nullable=False)
    nivel_llenado = Column(String(50), nullable=False)
    contenido = Column(Float, nullable=False)
    presion = Column(Float, nullable=False)
    temperatura = Column(Float, nullable=False)
    vol_gas = Column(Float, nullable=False)
    brix = Column(Float, nullable=False)
    control_videojet = Column(String(20), nullable=False)
    responsable = Column(String(100), nullable=False)


class ControlBebida(Base):
    __tablename__ = "control_bebida"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    marca = Column(String(100), nullable=True)
    concentrado = Column(String(50), nullable=True)
    tamano = Column(String(50), nullable=True)
    responsable = Column(String(100), nullable=True)
    tanque = Column(String(20), nullable=True)
    linea = Column(Integer, nullable=True)
    turno = Column(String(20), nullable=True)
    fecha = Column(Date, nullable=True)
    hora = Column(Time, nullable=False)
    carac_organolep = Column(String(50), nullable=True)
    nivel_llenado = Column(String(50), nullable=True)
    contenido = Column(Float, nullable=True)
    presion = Column(Float, nullable=True)
    temperatura = Column(Float, nullable=True)
    vol_gas = Column(Float, nullable=True)
    grados_brix = Column(Float, nullable=True)
    lote_tapa = Column(String(50), nullable=True)
    control_video_jet = Column(String(50), nullable=True)
