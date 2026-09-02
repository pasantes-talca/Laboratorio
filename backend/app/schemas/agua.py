from typing import Optional
from datetime import date, time, datetime
from pydantic import BaseModel, Field, ConfigDict

class ControlFisicoQuimicoCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    tipo_agua: str = Field(..., description="Agua de Pozo, Agua Permeada, Agua Tratada")
    fecha: Optional[date] = None
    hora: Optional[time] = None
    k: float
    dureza: float
    cloruros: float
    sulfatos: float
    alcalinidad: float
    cloro_libre: float
    ph: float
    responsable: str

class SalaSaneadoCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    linea: str
    post_mantenimiento: bool
    tipo_limpieza: str = Field(..., description="COP o CIP")
    responsable: str
    
    cop_quimico: Optional[str] = None
    cop_hora_inicio: Optional[time] = None
    cop_hora_fin: Optional[time] = None
    
    cip_sanitizante_temp: Optional[float] = None
    cip_sanitizante_inicio: Optional[time] = None
    cip_sanitizante_fin: Optional[time] = None
    
    cip_desinfectante_temp: Optional[float] = None
    cip_desinfectante_inicio: Optional[time] = None
    cip_desinfectante_fin: Optional[time] = None
    
    cip_enjuague_sanitizante_inicio: Optional[time] = None
    cip_enjuague_sanitizante_fin: Optional[time] = None
    
    cip_enjuague_desinfectante_inicio: Optional[time] = None
    cip_enjuague_desinfectante_fin: Optional[time] = None
