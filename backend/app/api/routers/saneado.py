from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.agua import SalaSaneado
from backend.app.schemas.agua import SalaSaneadoCreate

router = APIRouter(prefix="/api/saneado", tags=["Área de Saneado"])


@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/sala-saneado", status_code=status.HTTP_201_CREATED)
def create_saneado(data: SalaSaneadoCreate, db: Session = Depends(get_db)):
    nuevo_registro = SalaSaneado(
        linea=data.linea,
        post_mantenimiento=data.post_mantenimiento,
        tipo_limpieza=data.tipo_limpieza,
        responsable=data.responsable,
        cop_quimico=data.cop_quimico,
        cop_hora_inicio=data.cop_hora_inicio,
        cop_hora_fin=data.cop_hora_fin,
        cip_sanitizante_temp=data.cip_sanitizante_temp,
        cip_sanitizante_inicio=data.cip_sanitizante_inicio,
        cip_sanitizante_fin=data.cip_sanitizante_fin,
        cip_desinfectante_temp=data.cip_desinfectante_temp,
        cip_desinfectante_inicio=data.cip_desinfectante_inicio,
        cip_desinfectante_fin=data.cip_desinfectante_fin,
        cip_enjuague_sanitizante_inicio=data.cip_enjuague_sanitizante_inicio,
        cip_enjuague_sanitizante_fin=data.cip_enjuague_sanitizante_fin,
        cip_enjuague_desinfectante_inicio=data.cip_enjuague_desinfectante_inicio,
        cip_enjuague_desinfectante_fin=data.cip_enjuague_desinfectante_fin,
    )
    db.add(nuevo_registro)
    db.commit()
    db.refresh(nuevo_registro)
    return {"message": "Control de área de saneado guardado exitosamente", "id": nuevo_registro.id}
