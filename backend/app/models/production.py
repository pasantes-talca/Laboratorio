from sqlalchemy import Column, DateTime, Integer, String, UniqueConstraint

from backend.app.models.base import Base


class ProduccionActiva(Base):
    __tablename__ = "produccion_activa"

    linea = Column(Integer, primary_key=True)
    turno = Column(String(20), nullable=False)
    sabor = Column(String(100), nullable=False)
    concentrado = Column(String(50), nullable=False)
    tamano = Column(String(50), nullable=False)
    lote_tapa = Column(String(100), nullable=False)  # Columna heredada; no forma parte de producción activa.
    version = Column(Integer, nullable=False, default=1)
    actualizada_en = Column(DateTime(timezone=True), nullable=False)
    actualizada_por = Column(String(100), nullable=False)


class ControlProduccion(Base):
    __tablename__ = "control_produccion"
    __table_args__ = (UniqueConstraint("tipo_control", "control_id"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    tipo_control = Column(String(20), nullable=False)
    control_id = Column(Integer, nullable=False)
    linea = Column(Integer, nullable=False)
    produccion_version = Column(Integer, nullable=False)
    turno = Column(String(20), nullable=False)
    sabor = Column(String(100), nullable=False)
    concentrado = Column(String(50), nullable=False)
    tamano = Column(String(50), nullable=False)
    lote_tapa = Column(String(100), nullable=False)
