from pydantic import BaseModel, Field, model_validator

from backend.app.schemas.calidad import VALID_PRODUCT_OPTIONS


class ProduccionActivaUpdate(BaseModel):
    expected_version: int = Field(ge=0)
    turno: str = Field(min_length=1, max_length=20)
    sabor: str = Field(min_length=1, max_length=100)
    concentrado: str = Field(min_length=1, max_length=50)
    tamano: str = Field(min_length=1, max_length=50)

    @model_validator(mode="after")
    def validate_product(self):
        key = self.sabor.lower().replace("ó", "o")
        match = next((name for name in VALID_PRODUCT_OPTIONS if name in key), None)
        if match:
            concentrates, sizes = VALID_PRODUCT_OPTIONS[match]
            if self.concentrado.upper() not in concentrates or self.tamano not in sizes:
                raise ValueError("El concentrado o tamaño no corresponde al sabor")
        return self


class ProduccionActivaResponse(BaseModel):
    linea: int
    turno: str
    sabor: str
    concentrado: str
    tamano: str
    version: int
    actualizada_en: str | None
    actualizada_por: str | None
