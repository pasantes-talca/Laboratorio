"""Public, read-only water monitoring with server-side aggregation and pagination."""
import calendar
from datetime import date, timezone
from zoneinfo import ZoneInfo

from fastapi import HTTPException
from sqlalchemy import String, cast, func, select

from backend.app.core.config import APP_TIMEZONE
from backend.app.models.agua import AnalisisCloro, ControlFisicoQuimico, FiltroArena, OsmosisInversa

# Units are only included where the input form specifies them.
FORMS = {
    'fisico-quimico': (ControlFisicoQuimico, 'tipo_agua', [
        ('k', 'Conductividad', ''), ('ph', 'pH', ''), ('dureza', 'Dureza', ''),
        ('cloruros', 'Cloruros', ''), ('sulfatos', 'Sulfatos', ''),
        ('alcalinidad', 'Alcalinidad', ''), ('cloro_libre', 'Cloro libre', ''),
    ]),
    'analisis-cloro': (AnalisisCloro, 'cloro_riser_linea', [
        ('cloro_riser_resultado', 'Cloro rinser', 'ppm'),
        ('tanque_agua_osmosis', 'Cloro en tanque de ósmosis', 'ppm'),
        ('acondicionamiento_rinser', 'Presión del rinser', ''),
    ]),
    'osmosis-inversa': (OsmosisInversa, 'p_select', [
        ('k', 'Conductividad', ''), ('h', 'H', ''), ('q_perm', 'Caudal permeado', ''),
        ('q_mezcla', 'Caudal mezcla', ''), ('q_rechazo', 'Caudal rechazo', ''),
        ('p_valor', 'Presión', ''),
    ]),
    'filtro-arena': (FiltroArena, None, [
        ('presion_interno', 'Presión interna', ''), ('presion_externo', 'Presión externa', ''),
    ]),
}


def day_column(db, model):
    if model is ControlFisicoQuimico:
        return cast(model.fecha, String)
    if db.bind.dialect.name == 'postgresql':
        local = func.timezone(APP_TIMEZONE, func.timezone('UTC', model.fecha_registro))
        return func.to_char(local, 'YYYY-MM-DD')
    # SQLite is used by the isolated tests; the plant uses Argentina time (UTC-3).
    return func.date(model.fecha_registro, '-3 hours')


def dashboard(db, tipo, mes=None, fecha=None, grupo='', limit=25, offset=0):
    if tipo not in FORMS:
        raise HTTPException(422, 'Formulario no válido')
    first = last = None
    if mes:
        try:
            first = date.fromisoformat(mes + '-01')
            last = first.replace(day=calendar.monthrange(first.year, first.month)[1])
        except ValueError as exc:
            raise HTTPException(422, 'Mes no válido') from exc

    def period(day):
        conditions = []
        if first:
            conditions.append(day.between(first.isoformat(), last.isoformat()))
        if fecha:
            conditions.append(day == fecha.isoformat())
        return conditions

    counts, dates = {}, set()
    for key, (source, _, _) in FORMS.items():
        day = day_column(db, source)
        counts[key] = db.scalar(select(func.count()).select_from(source).where(*period(day)))
        dates.update(value for value in db.scalars(select(day).distinct()) if value)

    model, group_field, metrics = FORMS[tipo]
    day = day_column(db, model)
    group_column = getattr(model, group_field) if group_field else None
    conditions = period(day)
    if grupo and group_column is not None:
        conditions.append(group_column == grupo)
    total = db.scalar(select(func.count()).select_from(model).where(*conditions))
    fields = [day.label('fecha')]
    if group_column is not None:
        fields.append(group_column.label('grupo'))
    fields += [func.avg(getattr(model, key)).label(key) for key, _, _ in metrics]
    fields.append(func.count().label('cantidad'))
    grouping = [day] + ([group_column] if group_column is not None else [])
    series = [dict(row) for row in db.execute(select(*fields).where(*conditions).group_by(*grouping).order_by(day)).mappings()]
    rows = db.scalars(select(model).where(*conditions).order_by(day.desc(), model.hora.desc().nullslast(), model.id.desc()).offset(offset).limit(limit)).all()
    history = []
    for row in rows:
        values = {column.name: getattr(row, column.name) for column in model.__table__.columns}
        if model is ControlFisicoQuimico:
            values['fecha_control'] = row.fecha.isoformat()
        else:
            values['fecha_control'] = row.fecha_registro.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(APP_TIMEZONE)).date().isoformat()
        history.append(values)
    groups = sorted(value for value in db.scalars(select(group_column).distinct()) if value) if group_column is not None else []
    return {
        'conteos': counts,
        'opciones': {'meses': sorted({value[:7] for value in dates}, reverse=True), 'fechas': sorted(dates, reverse=True), 'grupos': groups},
        'metricas': [{'campo': key, 'titulo': title, 'unidad': unit} for key, title, unit in metrics],
        'series': series,
        'historial': {'registros': history, 'total': total, 'limit': limit, 'offset': offset},
    }
