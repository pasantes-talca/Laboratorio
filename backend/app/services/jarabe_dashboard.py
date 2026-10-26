"""Read-only overview of syrup preparation, cleaning and production reports."""
import calendar
import json
from datetime import date

from fastapi import HTTPException
from sqlalchemy import Float, String, case, cast, func, literal, select, union_all

from backend.app.models.jarabe import JarabeSimple, JarabeTerminado, ParteJarabe, SaneoTanque
from backend.app.models.auditoria import AutorRegistro
from backend.app.services.jarabe_tanques import tank_states, SOURCES

INGREDIENTS = {
    'azucar': 'Azúcar', 'sucralosa': 'Sucralosa', 'reforzado_citrico': 'Reforzado cítrico',
    'acesulfame_k': 'Acesulfame K', 'benzoato_sodio': 'Benzoato de sodio',
    'sorbato_potasio': 'Sorbato de potasio', 'citrato_sodio': 'Citrato de sodio',
    'acido_citrico': 'Ácido cítrico', 'acido_fosforico': 'Ácido fosfórico',
    'acido_ascorbico': 'Ácido ascórbico', 'cafeina': 'Cafeína', 'colorante_caramelo': 'Colorante caramelo',
}


def people(raw):
    if not raw:
        return []
    try:
        value = json.loads(raw)
    except (ValueError, TypeError):
        value = raw
    return [str(item) for item in value if item] if isinstance(value, list) else [str(value)]


def dashboard(db, mes=None, fecha=None, tanque='', sabor='', tipo='', limit=25, offset=0):
    sources = []
    for kind, model in [('simple', JarabeSimple), ('terminado', JarabeTerminado), ('saneo', SaneoTanque), ('parte', ParteJarabe)]:
        sources.append(select(
            literal(kind).label('tipo'), model.id, model.fecha, model.tanque, model.responsables,
            cast(getattr(model, 'hora', getattr(model, 'hora_inicio', literal(None))), String).label('hora'),
            getattr(model, 'sabor', literal(None, type_=String)).label('sabor'),
            cast(getattr(model, 'cantidad_bolsas', literal(None)), Float).label('bolsas'),
            getattr(model, 'lts_jarabe_terminado', literal(None, type_=Float)).label('litros'),
            *[cast(getattr(model, key, literal(None)), Float).label(key) for key in INGREDIENTS],
            *[cast(getattr(model, key, literal(None)), String).label(key) for key in (
                'volcado_numero', 'numero_carga_trilay', 'turno', 'producto', 'hora_fin',
            )],
        ))
    data = union_all(*sources).subquery('jarabe_activity')
    conditions = []
    if mes:
        try:
            first = date.fromisoformat(mes + '-01')
            last = first.replace(day=calendar.monthrange(first.year, first.month)[1])
        except ValueError as exc:
            raise HTTPException(422, 'Mes no válido') from exc
        conditions.append(data.c.fecha.between(first, last))
    for column, value in [(data.c.fecha, fecha), (data.c.tanque, tanque), (data.c.sabor, sabor), (data.c.tipo, tipo)]:
        if value:
            conditions.append(column == value)

    def query(*columns):
        return select(*columns).select_from(data).where(*conditions)

    counts = [func.count(case((data.c.tipo == kind, 1))).label(kind) for kind in ('simple', 'terminado', 'saneo', 'parte')]
    missing = func.count(case(((data.c.tipo == 'terminado') & data.c.litros.is_(None), 1))).label('sin_litros')
    summary = dict(db.execute(query(*counts, func.count().label('total'), func.sum(data.c.bolsas).label('bolsas'), func.sum(data.c.litros).label('litros'), missing)).mappings().one())
    daily = [dict(row) for row in db.execute(query(data.c.fecha, *counts, func.sum(data.c.bolsas).label('bolsas'), func.sum(data.c.litros).label('litros'), missing).group_by(data.c.fecha).order_by(data.c.fecha)).mappings()]
    flavors = [dict(row) for row in db.execute(query(data.c.sabor, func.count().label('cantidad'), func.sum(data.c.litros).label('litros'), missing).where(data.c.tipo.in_(['terminado', 'parte'])).group_by(data.c.sabor).order_by(func.sum(data.c.litros).desc().nullslast(), data.c.sabor)).mappings()]
    by_tank = [dict(row) for row in db.execute(query(data.c.tanque, func.count().label('cantidad')).group_by(data.c.tanque).order_by(data.c.tanque)).mappings()]
    ingredients = db.execute(query(*[func.sum(data.c[key]).label(key) for key in INGREDIENTS])).mappings().one()
    tanks = [dict(row) for row in db.execute(query(data.c.tanque, *[
        func.max(case((data.c.tipo == kind, data.c.fecha))).label(kind) for kind in ('simple', 'terminado', 'saneo', 'parte')
    ], func.count().label('cantidad')).group_by(data.c.tanque).order_by(data.c.tanque)).mappings()]
    history = [dict(row) for row in db.execute(query(data).order_by(data.c.fecha.desc(), data.c.hora.desc().nullslast(), data.c.id.desc(), data.c.tipo).offset(offset).limit(limit)).mappings()]
    for row in history:
        row['responsables'] = people(row['responsables'])
    form_ids = {kind: form for kind, _, form in SOURCES}
    if history:
        authors = db.scalars(select(AutorRegistro).where(AutorRegistro.formulario.in_(form_ids.values()), AutorRegistro.registro_id.in_({row['id'] for row in history}))).all()
        author_map = {(author.formulario, author.registro_id): author for author in authors}
        for row in history:
            author = author_map.get((form_ids[row['tipo']], row['id']))
            row['cargado_en'] = author.creado_en if author else None

    def options(column):
        return sorted(value for value in db.scalars(select(column).distinct()) if value)

    return {
        'opciones': {'meses': options(func.substr(cast(data.c.fecha, String), 1, 7)), 'fechas': options(data.c.fecha), 'tanques': options(data.c.tanque), 'sabores': options(data.c.sabor)},
        'resumen': summary, 'por_dia': daily, 'por_sabor': flavors, 'tanques': tanks,
        'estado_tanques': tank_states(db),
        'por_tanque': by_tank,
        'ingredientes': [{'campo': key, 'nombre': title, 'kg': ingredients[key]} for key, title in INGREDIENTS.items()],
        'historial': {'registros': history, 'total': summary['total'], 'limit': limit, 'offset': offset},
    }
