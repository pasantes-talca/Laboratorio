from datetime import date

from pydantic import BaseModel, Field


class ControlJarabeCreate(BaseModel):
    fecha: date | None = None
    hora: str | None = None
    turno: str | None = None
    linea: str | None = None
    production_version: int | None = Field(default=None, ge=0)
    sabor: str = Field(min_length=2, max_length=100)
    concentrado: str = Field(min_length=1, max_length=50)
    tanque: str = Field(min_length=1, max_length=20)
    bx_patron: float = Field(ge=0, le=100)
    ta: float = Field(ge=0)
    responsable: str = Field(min_length=2, max_length=100)
    observacion: str | None = None
    numero_carga_trilay: str | None = None


class JarabeSimpleCreate(BaseModel):
    fecha: date | None = None
    hora: str | None = None
    tanque: str
    volcado_numero: int = Field(ge=1)
    cantidad_bolsas: int = Field(ge=0)
    azucar_tipo: str
    azucar_marca: str
    azucar_ntu: str | None = None
    aux_standard: float | None = None
    aux_hyflo: float | None = None
    pasteurizado_desde: str | None = None
    pasteurizado_hasta: str | None = None
    pasteurizado_temp: float | None = None
    responsables: list[str]


class JarabeTerminadoCreate(BaseModel):
    fecha: str
    sabor: str
    concentrado: str
    tanque: str
    unidades: int = Field(ge=0)
    volcado_numero: str
    tiempo_filtrado: str | None = None
    be_jarabe_simple: float | None = None
    vol_jarabe_simple: float | None = None
    lts_jarabe_terminado: float | None = None
    responsables: list[str]


class SaneoTanqueCreate(BaseModel):
    fecha: str
    hora_inicio: str
    hora_fin: str
    tanque: str
    producto: str
    responsables: list[str]
    numero_saneo: int | None = None


class ParteJarabeCreate(BaseModel):
    fecha: str
    turno: str
    tanque: str
    numero_carga_trilay: str
    sabor: str | None = None
    responsables: list[str]
    azucar: float | None = None
    sucralosa: float | None = None
    reforzado_citrico: float | None = None
    acesulfame_k: float | None = None
    benzoato_sodio: float | None = None
    sorbato_potasio: float | None = None
    citrato_sodio: float | None = None
    acido_citrico: float | None = None
    acido_fosforico: float | None = None
    acido_ascorbico: float | None = None
    cafeina: float | None = None
    colorante_caramelo: float | None = None
