from datetime import date, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AguaBase(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("*", mode="before")
    @classmethod
    def empty_string_to_none(cls, value):
        return None if value == "" else value

class ControlFisicoQuimicoCreate(AguaBase):
    model_config = ConfigDict(populate_by_name=True)
    
    tipo_agua: str = Field(..., description="Agua de Pozo, Agua Permeada, Agua Tratada")
    fecha: Optional[date] = None
    hora: Optional[time] = None
    k: float = Field(ge=0)
    dureza: float = Field(ge=0)
    cloruros: float = Field(ge=0)
    sulfatos: float = Field(ge=0)
    alcalinidad: float = Field(ge=0)
    cloro_libre: float = Field(ge=0)
    ph: float = Field(ge=0, le=14)
    responsable: str = Field(min_length=2, max_length=100)

class SalaSaneadoCreate(AguaBase):
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

    @model_validator(mode="after")
    def validate_cleaning_type(self):
        cleaning_type = self.tipo_limpieza.upper()
        if cleaning_type not in {"COP", "CIP"}:
            raise ValueError("tipo_limpieza debe ser COP o CIP")
        if cleaning_type == "COP" and not self.cop_quimico:
            raise ValueError("cop_quimico es obligatorio para limpieza COP")
        if cleaning_type == "CIP" and not any(
            (
                self.cip_sanitizante_inicio,
                self.cip_desinfectante_inicio,
                self.cip_enjuague_sanitizante_inicio,
                self.cip_enjuague_desinfectante_inicio,
            )
        ):
            raise ValueError("la limpieza CIP requiere al menos una etapa con hora de inicio")
        return self


class AnalisisCloroCreate(AguaBase):
    hora: Optional[time] = None
    tanque_agua_osmosis: float = Field(ge=0)
    filtro_carbon_a: str = Field(min_length=2, max_length=20)
    filtro_carbon_b: str = Field(min_length=2, max_length=20)
    filtro_carbon_c: str = Field(min_length=2, max_length=20)
    contralavado_tanque_a: Optional[time] = None
    contralavado_tanque_b: Optional[time] = None
    cloro_riser_linea: str = Field(min_length=2, max_length=20)
    cloro_riser_resultado: float = Field(ge=0)
    acondicionamiento_rinser: Optional[float] = Field(default=None, ge=0, allow_inf_nan=False)
    responsable: str = Field(min_length=2, max_length=100)


class OsmosisInversaCreate(AguaBase):
    hora: Optional[time] = None
    k: float = Field(ge=0)
    h: float = Field(ge=0)
    q_perm: float = Field(ge=0)
    q_mezcla: float = Field(ge=0)
    q_rechazo: float = Field(ge=0)
    p_select: str = Field(pattern=r"^P[1-9][0-9]*$")
    p_valor: float = Field(ge=0)


class FiltroArenaCreate(AguaBase):
    hora: Optional[time] = None
    presion_interno: float = Field(ge=0)
    presion_externo: float = Field(ge=0)
    fecha_contralavado: Optional[date] = None
