from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class RegistroCalidadCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    # Parámetros del Formulario de Calidad
    hora: Optional[str] = None
    turno: Optional[str] = None
    linea: Optional[str] = None
    carac_organolep: str = Field(..., description="okey o no okey")
    nivel_llenado: str
    contenido: float
    presion: float
    temperatura: float
    vol_gas: float
    brix: float = Field(..., alias="brix")
    control_videojet: str = Field(..., description="okey o no okey")
    responsable: str

    # Parámetros del Producto (Sidebar)
    marca: str
    tipo_concentrado: str
    tamano: str
    lote_tapa: str
    tanque: Optional[str] = None


class RegistroCalidadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fecha_registro: datetime
    hora: str
    carac_organolep: str
    nivel_llenado: str
    contenido: float
    presion: float
    temperatura: float
    vol_gas: float
    brix: float
    control_videojet: str
    responsable: str
    marca: str
    tipo_concentrado: str
    tamano: str
    lote_tapa: str


class ControlBebidaBottleVisual(BaseModel):
    brand: str
    color: str
    label: str


class ControlBebidaResponse(BaseModel):
    id: int
    message: str
    bottle_visual: Optional[ControlBebidaBottleVisual] = None
