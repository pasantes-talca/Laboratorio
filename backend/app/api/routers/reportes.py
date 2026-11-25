import csv
from io import StringIO

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.calidad import ControlBebida
from backend.app.models.jarabe import ControlJarabe
from backend.app.models.ops import ControlTorque

router = APIRouter(prefix="/api/reportes", tags=["Reportes"])


@router.get("/calidad.csv")
def export_calidad_csv(
    limit: int = Query(5000, ge=1, le=20000),
    db: Session = Depends(get_db),
):
    """Exporta los controles principales en un CSV UTF-8 compatible con Excel."""
    output = StringIO()
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow(
        ["tipo", "id", "fecha", "hora", "linea", "producto", "responsable", "brix", "ta", "gas", "torque"]
    )

    for row in db.query(ControlBebida).order_by(ControlBebida.id.desc()).limit(limit):
        writer.writerow([
            "bebida", row.id, row.fecha, row.hora, row.linea, row.marca, row.responsable,
            row.grados_brix, "", row.vol_gas, "",
        ])
    for row in db.query(ControlJarabe).order_by(ControlJarabe.id.desc()).limit(limit):
        writer.writerow([
            "jarabe", row.id, row.fecha, row.hora, "", row.sabor, row.responsable,
            row.grados_brix_patron, row.t_a, "", "",
        ])
    for row in db.query(ControlTorque).order_by(ControlTorque.id.desc()).limit(limit):
        writer.writerow([
            "torque", row.id, row.fecha, row.hora, row.linea, row.sabor, row.responsable,
            "", "", "", row.valor,
        ])

    output.seek(0)
    headers = {"Content-Disposition": 'attachment; filename="controles-calidad.csv"'}
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv; charset=utf-8", headers=headers)
