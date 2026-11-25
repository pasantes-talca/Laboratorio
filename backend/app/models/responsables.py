from sqlalchemy import Column, Integer, String, UniqueConstraint

from backend.app.models.base import Base


class Responsable(Base):
    """Person selectable as responsible when loading data in a module."""

    __tablename__ = "responsables"
    __table_args__ = (UniqueConstraint("modulo", "nombre", name="uq_responsables_modulo_nombre"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    modulo = Column(String(20), nullable=False, index=True)
    nombre = Column(String(100), nullable=False)
