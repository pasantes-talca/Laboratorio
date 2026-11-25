from datetime import date, timedelta

from fastapi import HTTPException

from backend.app.core.time import local_now

MAX_BACKDATE_DAYS = 7


def _blank(hora) -> bool:
    return hora is None or (isinstance(hora, str) and not hora.strip())


def resolve_load_date(fecha: date | None, hora=None, *, today: date | None = None) -> date:
    """Return the date a record must be stored with.

    ``None`` means "today". An explicit date must fall in the window
    [today - MAX_BACKDATE_DAYS, today]. A past date also requires an explicit
    ``hora`` so the current clock time is never attributed to another day.
    """
    today = today or local_now().date()
    if fecha is None or fecha == today:
        return today
    if fecha > today:
        raise HTTPException(status_code=422, detail="La fecha de carga no puede ser futura")
    if fecha < today - timedelta(days=MAX_BACKDATE_DAYS):
        raise HTTPException(
            status_code=422,
            detail=f"La fecha de carga no puede ser anterior a {MAX_BACKDATE_DAYS} días",
        )
    if _blank(hora):
        raise HTTPException(
            status_code=422,
            detail="Indique la hora del control al cargar datos de una fecha anterior",
        )
    return fecha
