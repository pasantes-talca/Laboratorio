from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

VALID_PRODUCT_OPTIONS = {
    "cola": ({"XQ", "KG", "IFF"}, {"3L", "2,25L", "2.25L", "500ml"}),
    "pomelo": ({"IFF", "TP", "BA"}, {"3L", "2,25L", "2.25L", "500ml"}),
    "lima": ({"IFF", "TP", "BA"}, {"3L", "2,25L", "2.25L", "500ml"}),
    "naranja": ({"IFF", "TP", "BA"}, {"3L", "2,25L", "2.25L", "500ml"}),
    "manzana": ({"IFF", "TP", "BA", "XQ", "KG"}, {"3L", "2,25L", "2.25L", "500ml"}),
    "soda": ({"TALCA", "N/A"}, {"2,25L", "2.25L", "500ml"}),
    "sifon": ({"TALCA", "N/A"}, {"2L"}),
}


class RegistroCalidadCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    # Parámetros del Formulario de Calidad
    hora: Optional[str] = None
    turno: Optional[str] = None
    linea: Optional[str] = None
    production_version: Optional[int] = Field(default=None, ge=0)
    carac_organolep: str = Field(..., description="okey o no okey")
    nivel_llenado: str
    contenido: float = Field(ge=0)
    presion: float = Field(ge=0)
    temperatura: float = Field(ge=-10, le=100)
    vol_gas: float = Field(ge=0)
    brix: float = Field(ge=0, le=100, alias="brix")
    control_videojet: str = Field(..., description="okey o no okey")
    responsable: str

    # Parámetros del Producto (Sidebar)
    marca: str
    tipo_concentrado: str
    tamano: str
    lote_tapa: str = Field(max_length=50)
    tanque: Optional[str] = None

    @field_validator("responsable", "marca", "tamano", "lote_tapa")
    @classmethod
    def required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("el campo no puede estar vacío")
        return value

    @model_validator(mode="after")
    def validate_product_combination(self):
        key = self.marca.lower().replace("ó", "o")
        match = next((name for name in VALID_PRODUCT_OPTIONS if name in key), None)
        if match:
            concentrates, sizes = VALID_PRODUCT_OPTIONS[match]
            if self.tipo_concentrado.upper() not in concentrates:
                raise ValueError("el concentrado no corresponde al producto")
            if self.tamano not in sizes:
                raise ValueError("el tamaño no corresponde al producto")
        return self


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
