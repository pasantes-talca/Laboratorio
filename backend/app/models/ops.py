from sqlalchemy import Column, Integer, String, Float, Date, Time
from backend.app.models.base import Base


class ControlTorque(Base):
    __tablename__ = "control_torque"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=True)
    hora = Column(Time, nullable=True)
    turno = Column(String(20), nullable=True)
    linea = Column(Integer, nullable=True)
    numero_cabezal = Column(Integer, nullable=False)
    sabor = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
    marca_tapa = Column(String(20), nullable=True)
    valor = Column(Float, nullable=False)
    responsable = Column(String(100), nullable=False)


class ControlPausa(Base):
    __tablename__ = "control_pausas"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fecha = Column(Date, nullable=True)
    hora = Column(Time, nullable=True)
    turno = Column(String(20), nullable=True)
    linea = Column(Integer, nullable=True)
    motivo = Column(String(100), nullable=False)
    responsable = Column(String(100), nullable=False)
    observacion = Column(String, nullable=True)
