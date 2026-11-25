from datetime import date

from pydantic import BaseModel, Field, field_validator


class ControlTorqueCreate(BaseModel):
    fecha: date | None = None
    hora: str | None = None
    numero_cabezal: int = Field(ge=1, le=14)
    turno: str | None = None
    noche: str | None = None
    linea: str | None = None
    production_version: int | None = Field(default=None, ge=0)
    valor: float = Field(ge=0, le=500)
    sabor: str = Field(min_length=2, max_length=100)
    marca: str | None = None
    color: str | None = None
    marca_tapa: str | None = None
    lote_tapa: str = Field(max_length=50)
    responsable: str = Field(min_length=2, max_length=100)

    @field_validator("lote_tapa")
    @classmethod
    def required_lote_tapa(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("el campo no puede estar vacío")
        return value


class ControlPausaCreate(BaseModel):
    fecha: date | None = None
    hora: str | None = None
    motivo: str = Field(min_length=2, max_length=100)
    responsable: str = Field(min_length=2, max_length=100)
    observacion: str | None = None
    turno: str | None = None
    linea: str | None = None
