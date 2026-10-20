from sqlalchemy import JSON, Column, DateTime, Integer, String

from backend.app.models.base import Base


class AutorRegistro(Base):
    __tablename__ = "autor_registro"

    formulario = Column(String(60), primary_key=True)
    registro_id = Column(Integer, primary_key=True)
    creado_por = Column(String(100), nullable=True)
    creado_en = Column(DateTime(timezone=True), nullable=True)
    version = Column(Integer, nullable=False, default=1)


class CambioRegistro(Base):
    __tablename__ = "cambio_registro"

    id = Column(Integer, primary_key=True, autoincrement=True)
    formulario = Column(String(60), nullable=False, index=True)
    registro_id = Column(Integer, nullable=False, index=True)
    usuario = Column(String(100), nullable=False)
    fecha = Column(DateTime(timezone=True), nullable=False)
    motivo = Column(String(500), nullable=False)
    anteriores = Column(JSON, nullable=False)
    nuevos = Column(JSON, nullable=False)


# One canonical identifier per persisted form, including both saneado routes.
FORMULARIOS_POR_TABLA = {
    "control_bebida": "calidad-bebida",
    "control_jarabe": "calidad-jarabe",
    "control_torque": "calidad-torque",
    "control_pausas": "calidad-pausas",
    "jarabe_simple": "jarabe-simple",
    "jarabe_terminado": "jarabe-terminado",
    "saneo_tanques": "jarabe-saneo",
    "parte_jarabe": "jarabe-parte",
    "control_fisico_quimico_agua": "agua-fisico-quimico",
    "analisis_cloro_agua": "agua-cloro",
    "osmosis_inversa": "agua-osmosis",
    "filtro_arena": "agua-filtro-arena",
    "sala_saneado": "saneado-control",
}
