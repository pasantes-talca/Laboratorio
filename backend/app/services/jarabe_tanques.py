"""Tank status inferred conservatively from recorded operational events."""
from collections import Counter, defaultdict
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func, or_, select

from backend.app.core.config import APP_TIMEZONE
from backend.app.core.time import local_now
from backend.app.models.auditoria import AutorRegistro
from backend.app.models.jarabe import JarabeSimple, JarabeTerminado, ParteJarabe, SaneoTanque
from backend.app.services.maestros import load_maestros

SOURCES = [('simple', JarabeSimple, 'jarabe-simple'), ('terminado', JarabeTerminado, 'jarabe-terminado'),
           ('saneo', SaneoTanque, 'jarabe-saneo'), ('parte', ParteJarabe, 'jarabe-parte')]


def recorded_time(value):
    if value is None:
        return None
    zone = ZoneInfo(APP_TIMEZONE)
    return (value.replace(tzinfo=zone) if value.tzinfo is None else value.astimezone(zone)).replace(tzinfo=None)


def event(record, kind, author, now):
    registered = recorded_time(author.creado_en) if author else None
    clock = getattr(record, 'hora', getattr(record, 'hora_inicio', None))
    capture_clock = False
    if clock is None and registered and registered.date() == record.fecha:
        clock = registered.time()
        capture_clock = True
    start = datetime.combine(record.fecha, clock or time.min)
    end = start if clock else datetime.combine(record.fecha, time.max)
    completed = kind == 'saneo' and record.hora_fin is not None
    finish_date = None
    if completed:
        end = datetime.combine(record.fecha, record.hora_fin)
        if record.hora_inicio and record.hora_fin < record.hora_inicio:
            end += timedelta(days=1)
        finish_date = end.date()
        if end <= now:
            start = end
        else:
            completed = False
            end = start
    if start > now:
        return None
    return {'tipo': kind, 'id': record.id, 'desde': start, 'hasta': min(end, now),
            'fecha': record.fecha, 'fecha_fin': finish_date, 'hora': clock, 'hora_fin': getattr(record, 'hora_fin', None),
            'completo': completed, 'sabor': getattr(record, 'sabor', None),
            'producto': getattr(record, 'producto', None), 'cargado_en': registered, 'hora_de_carga': capture_clock}


def describe(events):
    operational = [item for item in events if item['tipo'] != 'parte']
    if not operational:
        return ('revisar', 'Solo hay partes de jarabe; falta registrar la preparación o el saneo.') if events else ('sin_datos', 'No hay preparación ni saneo registrados.')
    latest = max(operational, key=lambda item: item['desde'])
    candidates = [item for item in operational if item['hasta'] >= latest['desde']]
    if len({item['tipo'] for item in candidates}) > 1:
        return 'revisar', 'Hay movimientos del mismo día sin una hora que permita confirmar el orden.'
    if latest['tipo'] == 'simple':
        return 'preparando', 'Se registró jarabe simple; aún no hay un jarabe terminado posterior.'
    if latest['tipo'] == 'terminado':
        return 'terminado', 'Jarabe terminado registrado. Saneo posterior pendiente.'
    if not latest['completo']:
        return 'saneando', 'Saneo iniciado; finalización pendiente o aún no alcanzada.'
    if any(item['tipo'] == 'parte' and item['hasta'] >= latest['desde'] for item in events):
        return 'revisar', 'Hay un parte de jarabe posterior o sin hora confirmada respecto del último saneo.'
    return 'apto', 'Saneo finalizado y sin preparaciones posteriores registradas.'


def tank_states(db, catalog=None, now=None):
    now = recorded_time(now or local_now())
    grouped = defaultdict(list)
    for kind, model, form in SOURCES:
        conditions = [model.fecha <= now.date()]
        clock = getattr(model, 'hora', getattr(model, 'hora_inicio', None))
        if clock is not None:
            conditions.append(or_(model.fecha < now.date(), clock.is_(None), clock <= now.time()))
        ranked = select(model.id, func.dense_rank().over(partition_by=model.tanque, order_by=model.fecha.desc()).label('position')).where(*conditions).subquery()
        rows = db.execute(select(model, AutorRegistro).outerjoin(AutorRegistro, (AutorRegistro.formulario == form) & (AutorRegistro.registro_id == model.id)).where(model.id.in_(select(ranked.c.id).where(ranked.c.position == 1)))).all()
        for record, author in rows:
            item = event(record, kind, author, now)
            if item:
                grouped[record.tanque.strip()].append(item)
    names = set(str(value).strip() for value in (catalog if catalog is not None else load_maestros().get('tanques', []))) | set(grouped)
    unassigned = {'', 'N/A', 'TALCA'}
    tanks = []
    for name in sorted(names - unassigned, key=lambda value: (not value.isdigit(), int(value) if value.isdigit() else value)):
        events = grouped[name]
        status, reason = describe(events)
        last_by_type = {kind: max((item for item in events if item['tipo'] == kind), key=lambda item: (item['desde'], item['id'])) for kind in {item['tipo'] for item in events}}
        tanks.append({'tanque': name, 'estado': status, 'motivo': reason,
                      'movimientos': last_by_type, 'apto': status == 'apto'})
    return {'tanques': tanks, 'resumen': dict(Counter(item['estado'] for item in tanks)),
            'actualizado_en': now, 'sin_tanque_asignado': any(grouped[name] for name in unassigned)}
