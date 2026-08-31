from typing import List, Optional
from pydantic import BaseModel


class ControlJarabeCreate(BaseModel):
    hora: Optional[str] = None
    turno: Optional[str] = None
    linea: Optional[str] = None
    sabor: str
    concentrado: str
    tanque: str
    bx_patron: float
    ta: float
    responsable: str
    observacion: Optional[str] = None
    numero_carga_trilay: Optional[str] = None


class JarabeSimpleCreate(BaseModel):
    fecha: str
    hora: Optional[str] = None
    tanque: str
    volcado_numero: int
    cantidad_bolsas: int
    azucar_tipo: str
    azucar_marca: str
    azucar_ntu: Optional[str] = None
    aux_standard: Optional[float] = None
    aux_hyflo: Optional[float] = None
    pasteurizado_desde: Optional[str] = None
    pasteurizado_hasta: Optional[str] = None
    pasteurizado_temp: Optional[float] = None
    responsables: List[str]


class JarabeTerminadoCreate(BaseModel):
    fecha: str
    sabor: str
    concentrado: str
    tanque: str
    unidades: int
    volcado_numero: str
    tiempo_filtrado: Optional[str] = None
    be_jarabe_simple: Optional[float] = None
    vol_jarabe_simple: Optional[float] = None
    lts_jarabe_terminado: Optional[float] = None
    responsables: List[str]


class SaneoTanqueCreate(BaseModel):
    fecha: str
    hora_inicio: str
    hora_fin: str
    tanque: str
    producto: str
    responsables: List[str]
    numero_saneo: Optional[int] = None


class ParteJarabeCreate(BaseModel):
    fecha: str
    turno: str
    tanque: str
    numero_carga_trilay: str
    sabor: Optional[str] = None
    responsables: List[str]
    azucar: Optional[float] = None
    sucralosa: Optional[float] = None
    reforzado_citrico: Optional[float] = None
    acesulfame_k: Optional[float] = None
    benzoato_sodio: Optional[float] = None
    sorbato_potasio: Optional[float] = None
    citrato_sodio: Optional[float] = None
    acido_citrico: Optional[float] = None
    acido_fosforico: Optional[float] = None
    acido_ascorbico: Optional[float] = None
    cafeina: Optional[float] = None
    colorante_caramelo: Optional[float] = None
