from typing import Optional
from pydantic import BaseModel


class ControlTorqueCreate(BaseModel):
    hora: Optional[str] = None
    numero_cabezal: int
    turno: Optional[str] = None
    noche: Optional[str] = None
    linea: Optional[str] = None
    valor: float
    sabor: str
    marca: Optional[str] = None
    color: Optional[str] = None
    marca_tapa: Optional[str] = None
    responsable: str


class ControlPausaCreate(BaseModel):
    motivo: str
    responsable: str
    observacion: Optional[str] = None
    turno: Optional[str] = None
    linea: Optional[str] = None
