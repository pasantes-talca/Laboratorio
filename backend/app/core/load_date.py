from datetime import date

from fastapi import HTTPException

from backend.app.core.time import local_now

# Earliest day the lab accepts backdated records for.
MIN_LOAD_DATE = date(2026, 1, 1)


def _blank(hora) -> bool:
    return hora is None or (isinstance(hora, str) and not hora.strip())


def resolve_load_date(fecha: date | None, hora=None, *, today: date | None = None) -> date:
    """Return the date a record must be stored with.

    ``None`` means "today". An explicit date must fall in the window
    [MIN_LOAD_DATE, today]. A past date also requires an explicit
    ``hora`` so the current clock time is never attributed to another day.
    """
    today = today or local_now().date()
    if fecha is None or fecha == today:
        return today
    if fecha > today:
        raise HTTPException(status_code=422, detail="La fecha de carga no puede ser futura")
    if fecha < MIN_LOAD_DATE:
        raise HTTPException(
            status_code=422,
            detail=f"La fecha de carga no puede ser anterior al {MIN_LOAD_DATE:%d/%m/%Y}",
        )
    if _blank(hora):
        raise HTTPException(
            status_code=422,
            detail="Indique la hora del control al cargar datos de una fecha anterior",
        )
    return fecha
