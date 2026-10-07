from typing import Optional
from pydantic import BaseModel, Field


class ControlTorqueCreate(BaseModel):
    hora: Optional[str] = None
    numero_cabezal: int = Field(ge=1, le=14)
    turno: Optional[str] = None
    noche: Optional[str] = None
    linea: Optional[str] = None
    production_version: Optional[int] = Field(default=None, ge=0)
    valor: float = Field(ge=0, le=500)
    sabor: str = Field(min_length=2, max_length=100)
    marca: Optional[str] = None
    color: Optional[str] = None
    marca_tapa: Optional[str] = None
    responsable: str = Field(min_length=2, max_length=100)


class ControlPausaCreate(BaseModel):
    motivo: str = Field(min_length=2, max_length=100)
    responsable: str = Field(min_length=2, max_length=100)
    observacion: Optional[str] = None
    turno: Optional[str] = None
    linea: Optional[str] = None
