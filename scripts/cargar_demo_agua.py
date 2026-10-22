"""Carga ejemplos para los gráficos; identifica cada fila en autor_registro.

Uso desde la raíz: python scripts/cargar_demo_agua.py
No duplica la carga si ya existen registros del mismo lote de demostración.
"""
import sys
from collections import Counter
from datetime import datetime, time, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from backend.app.core.database import SessionLocal
from backend.app.core.time import local_now
from backend.app.models.auditoria import AutorRegistro
from backend.app.models.agua import AnalisisCloro, ControlFisicoQuimico, FiltroArena, OsmosisInversa

MARKER = 'DEMO_AGUA_GRAFICOS'


def main():
    today = local_now()
    with SessionLocal() as db:
        existing = db.scalars(select(AutorRegistro).where(AutorRegistro.creado_por == MARKER)).all()
        if existing:
            print('El lote de demostración ya existe:', dict(Counter(row.formulario for row in existing)))
            return
        db.info['actor'] = MARKER
        records = []
        variations = [0, 3, -2, 5, 1, -3, 2]
        for index, delta in enumerate(variations):
            day = today.date() - timedelta(days=6 - index)
            # These models store naive UTC timestamps, matching the form endpoints.
            instant = datetime.combine(day, time(8), tzinfo=today.tzinfo).astimezone(timezone.utc).replace(tzinfo=None)
            operator = f'DEMO - Operador {"A" if index % 2 == 0 else "B"}'
            for water, conductivity, hardness, ph in (
                ('Agua de Pozo', 620, 220, 7.4),
                ('Agua Permeada', 28, 8, 6.8),
                ('Agua Tratada', 180, 65, 7.1),
            ):
                records.append(ControlFisicoQuimico(
                    fecha_registro=instant, fecha=day, hora=time(8), tipo_agua=water,
                    k=round(conductivity + delta * 1.7, 2), dureza=round(hardness + delta * .3, 2),
                    cloruros=round(conductivity * .04 + delta * .1, 2),
                    sulfatos=round(conductivity * .03 + delta * .08, 2),
                    alcalinidad=round(hardness * .5 + delta * .2, 2),
                    cloro_libre=round(.35 + index * .025, 3) if water == 'Agua Tratada' else 0,
                    ph=round(ph + delta * .025, 3), responsable=operator,
                ))
            for line in (1, 2):
                records.append(AnalisisCloro(
                    fecha_registro=instant + timedelta(hours=line), hora=time(8 + line),
                    tanque_agua_osmosis=round(.03 + index * .005, 3),
                    filtro_carbon_a='Cumple', filtro_carbon_b='No Cumple' if index == 3 else 'Cumple',
                    filtro_carbon_c='Cumple', contralavado_tanque_a=time(7) if index == 4 else None,
                    cloro_riser_linea=f'Linea {line}', cloro_riser_resultado=round(.8 + line * .15 + delta * .035, 3),
                    acondicionamiento_rinser=round(2 + line * .2 + delta * .03, 2), responsable=operator,
                ))
            for point in (1, 2):
                records.append(OsmosisInversa(
                    fecha_registro=instant + timedelta(hours=point), hora=time(8 + point),
                    k=round(25 + delta * 1.2 + point, 2), h=round(.5 + index * .015, 3),
                    q_perm=round(1200 + delta * 12, 2), q_mezcla=round(250 + delta * 5, 2),
                    q_rechazo=round(380 + delta * 7, 2), p_select=f'P{point}',
                    p_valor=round(7 + point + delta * .1, 2),
                ))
            records.append(FiltroArena(
                fecha_registro=instant, hora=time(8), presion_interno=round(2 + index * .06, 2),
                presion_externo=round(1.4 + index * .035, 3), fecha_contralavado=day if index in (0, 4) else None,
            ))
        db.add_all(records)
        db.commit()
        saved = db.scalars(select(AutorRegistro).where(AutorRegistro.creado_por == MARKER)).all()
        print('Registros de demostración cargados:', dict(Counter(row.formulario for row in saved)))
        print('Período:', today.date() - timedelta(days=6), 'a', today.date())
        print('Identificador para retirar estos ejemplos posteriormente:', MARKER)


if __name__ == '__main__':
    main()
