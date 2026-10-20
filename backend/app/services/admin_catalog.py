"""Explicit form registry shared by listing, validation and editor metadata."""

import json
import math
from datetime import date, datetime, time

from pydantic import ValidationError
from sqlalchemy import Boolean, Date, DateTime, Float, Integer, Time

from backend.app.models import (
    AnalisisCloro,
    ControlBebida,
    ControlFisicoQuimico,
    ControlJarabe,
    ControlPausa,
    ControlTorque,
    FiltroArena,
    JarabeSimple,
    JarabeTerminado,
    OsmosisInversa,
    ParteJarabe,
    SalaSaneado,
    SaneoTanque,
)
from backend.app.schemas.agua import (
    AnalisisCloroCreate,
    ControlFisicoQuimicoCreate,
    FiltroArenaCreate,
    OsmosisInversaCreate,
    SalaSaneadoCreate,
)
from backend.app.schemas.calidad import RegistroCalidadCreate
from backend.app.schemas.jarabe import (
    ControlJarabeCreate,
    JarabeSimpleCreate,
    JarabeTerminadoCreate,
    ParteJarabeCreate,
    SaneoTanqueCreate,
)
from backend.app.schemas.ops import ControlPausaCreate, ControlTorqueCreate

FORMS = {
    "calidad-bebida": (
        "calidad",
        "Bebida terminada",
        ControlBebida,
        RegistroCalidadCreate,
    ),
    "calidad-jarabe": (
        "calidad",
        "Control de jarabe",
        ControlJarabe,
        ControlJarabeCreate,
    ),
    "calidad-torque": (
        "calidad",
        "Control de torque",
        ControlTorque,
        ControlTorqueCreate,
    ),
    "calidad-pausas": ("calidad", "Pausas de línea", ControlPausa, ControlPausaCreate),
    "jarabe-simple": ("jarabe", "Jarabe simple", JarabeSimple, JarabeSimpleCreate),
    "jarabe-terminado": (
        "jarabe",
        "Jarabe terminado",
        JarabeTerminado,
        JarabeTerminadoCreate,
    ),
    "jarabe-saneo": ("jarabe", "Saneo de tanques", SaneoTanque, SaneoTanqueCreate),
    "jarabe-parte": ("jarabe", "Parte de jarabe", ParteJarabe, ParteJarabeCreate),
    "agua-fisico-quimico": (
        "agua",
        "Control físico químico",
        ControlFisicoQuimico,
        ControlFisicoQuimicoCreate,
    ),
    "agua-cloro": ("agua", "Análisis de cloro", AnalisisCloro, AnalisisCloroCreate),
    "agua-osmosis": ("agua", "Ósmosis inversa", OsmosisInversa, OsmosisInversaCreate),
    "agua-filtro-arena": ("agua", "Filtro de arena", FiltroArena, FiltroArenaCreate),
    "saneado-control": (
        "saneado",
        "Control de saneado",
        SalaSaneado,
        SalaSaneadoCreate,
    ),
}
MODULES = {
    "calidad": "Control de Calidad",
    "jarabe": "Sala de Jarabe",
    "agua": "Control de Agua",
    "saneado": "Saneado",
}
LABELS = {
    "id": "ID",
    "fecha": "Fecha del control",
    "fecha_registro": "Fecha de registro",
    "hora": "Hora",
    "linea": "Línea",
    "cloro_riser_linea": "Línea del rinser",
    "acondicionamiento_rinser": "Presión del rinser",
    "cloro_riser_resultado": "Cloro rinser (ppm)",
    "tanque_agua_osmosis": "Tanque de agua de ósmosis (ppm)",
    "marca": "Producto",
    "sabor": "Sabor / marca",
    "concentrado": "Concentrado",
    "tamano": "Tamaño",
    "turno": "Turno",
    "tanque": "Tanque",
    "responsable": "Responsable del control",
    "responsables": "Responsables del control",
    "carac_organolep": "Características organolépticas",
    "nivel_llenado": "Nivel de llenado",
    "contenido": "Contenido",
    "presion": "Presión",
    "temperatura": "Temperatura (°C)",
    "vol_gas": "Volumen de gas",
    "grados_brix": "Brix",
    "grados_brix_patron": "Brix patrón",
    "control_video_jet": "Control Videojet",
    "lote_tapa": "Lote de tapa",
    "t_a": "Acidez titulable",
    "numero_cabezal": "Número de cabezal",
    "valor": "Torque (Lbs.In)",
    "color": "Color de tapa",
    "marca_tapa": "Marca de tapa",
    "observacion": "Observaciones",
    "motivo": "Motivo de la pausa",
    "numero_carga_trilay": "Número de carga Trilay",
    "volcado_numero": "Número de volcado",
    "cantidad_bolsas": "Cantidad de bolsas",
    "azucar_tipo": "Tipo de azúcar",
    "azucar_marca": "Marcas de azúcar",
    "azucar_ntu": "Turbidez (NTU)",
    "aux_standard": "Auxiliar Standard (kg)",
    "aux_hyflo": "Auxiliar Hyflo (kg)",
    "pasteurizado_desde": "Pasteurizado desde",
    "pasteurizado_hasta": "Pasteurizado hasta",
    "pasteurizado_temp": "Temperatura de pasteurizado (°C)",
    "unidades": "Unidades / cargas",
    "tiempo_filtrado": "Tiempo de filtrado",
    "be_jarabe_simple": "Brix del jarabe simple",
    "vol_jarabe_simple": "Volumen de jarabe simple (L)",
    "lts_jarabe_terminado": "Jarabe terminado (L)",
    "hora_inicio": "Hora de inicio",
    "hora_fin": "Hora de finalización",
    "producto": "Producto de saneo",
    "numero_saneo": "Número de saneo",
    "tipo_agua": "Tipo de agua",
    "k": "K",
    "h": "H",
    "ph": "pH",
    "q_perm": "Caudal permeado",
    "q_mezcla": "Caudal de mezcla",
    "q_rechazo": "Caudal de rechazo",
    "p_select": "Punto de presión",
    "p_valor": "Valor de presión",
    "presion_interno": "Presión interna",
    "presion_externo": "Presión externa",
    "fecha_contralavado": "Fecha de contralavado",
    "contralavado_tanque_a": "Hora de contralavado A",
    "contralavado_tanque_b": "Hora de contralavado B",
    "filtro_carbon_a": "Filtro de carbón A",
    "filtro_carbon_b": "Filtro de carbón B",
    "filtro_carbon_c": "Filtro de carbón C",
    "tipo_limpieza": "Tipo de limpieza",
    "post_mantenimiento": "Después de mantenimiento",
    "cop_quimico": "Químico COP",
    "cop_hora_inicio": "Inicio COP",
    "cop_hora_fin": "Fin COP",
}
ALIASES = {
    "calidad-bebida": {
        "brix": "grados_brix",
        "tipo_concentrado": "concentrado",
        "control_videojet": "control_video_jet",
    },
    "calidad-jarabe": {"bx_patron": "grados_brix_patron", "ta": "t_a"},
}
OPTIONS = {
    "filtro_carbon_a": ["Cumple", "No Cumple"],
    "filtro_carbon_b": ["Cumple", "No Cumple"],
    "filtro_carbon_c": ["Cumple", "No Cumple"],
    "carac_organolep": ["OK", "NOK"],
    "nivel_llenado": ["OK", "NOK"],
    "control_video_jet": ["OK", "NOK"],
    "cloro_riser_linea": ["Linea 1", "Linea 2"],
    "tipo_limpieza": ["COP", "CIP"],
}


def label_for(key):
    if key.startswith("cip_"):
        return (
            key.replace("cip_", "CIP · ")
            .replace("_", " ")
            .replace("temp", "temperatura (°C)")
        )
    return LABELS.get(key, key.replace("_", " ").capitalize())


def array_field(column):
    return column.name in {"responsables", "azucar_marca", "azucar_ntu"} or (
        column.name == "volcado_numero" and not isinstance(column.type, Integer)
    )


def locked_fields(form_id):
    locked = {"id", "fecha_registro"}
    if form_id in {"calidad-bebida", "calidad-jarabe", "calidad-torque"}:
        locked |= {"linea", "marca", "sabor", "concentrado", "tamano", "turno"}
    return locked


def field_type(column):
    if array_field(column):
        return "list"
    for sql_type, kind in [
        (Boolean, "boolean"),
        (DateTime, "datetime"),
        (Date, "date"),
        (Time, "time"),
        (Integer, "integer"),
        (Float, "number"),
    ]:
        if isinstance(column.type, sql_type):
            return kind
    return "text"


def catalogue():
    result = []
    for form_id, (module, name, model, _schema) in FORMS.items():
        fields = [
            {
                "key": column.name,
            "label": "Conductividad" if form_id == "agua-osmosis" and column.name == "k" else label_for(column.name),
                "type": field_type(column),
                "required": not column.nullable,
                "readonly": column.name in locked_fields(form_id),
                "max_length": getattr(column.type, "length", None),
                "options": OPTIONS.get(column.name),
            }
            for column in model.__table__.columns
        ]
        preferred = [
            "fecha",
            "fecha_registro",
            "hora",
            "linea",
            "sabor",
            "marca",
            "tanque",
            "tipo_agua",
            "numero_cabezal",
            "cloro_riser_resultado",
            "valor",
            "responsable",
            "responsables",
        ]
        columns = [key for key in preferred if key in model.__table__.columns][:5]
        result.append(
            {
                "id": form_id,
                "module": module,
                "module_label": MODULES[module],
                "label": name,
                "fields": fields,
                "columns": columns,
            }
        )
    return result


def serialize(record):
    result = {}
    for column in record.__table__.columns:
        value = getattr(record, column.name)
        if isinstance(value, (date, time, datetime)):
            value = value.isoformat()
        if value is not None and array_field(column):
            try:
                value = json.loads(value)
            except (TypeError, ValueError):
                pass
            if not isinstance(value, list):
                value = [value]
        result[column.name] = value
    return result


def convert(column, value):
    if value is None or value == "":
        if not column.nullable:
            raise ValueError("El campo es obligatorio")
        return None
    if array_field(column):
        if not isinstance(value, list) or any(
            isinstance(item, (dict, list, bool)) for item in value
        ):
            raise ValueError("Ingrese una lista de valores")
        if len(value) > 100 or any(
            item is None or len(str(item)) > 200 for item in value
        ):
            raise ValueError("La lista contiene demasiados datos")
        items = [str(item).strip() for item in value if str(item).strip()]
        if not items and not column.nullable:
            raise ValueError("Ingrese al menos un valor")
        if column.name in {"volcado_numero", "azucar_ntu"}:
            for item in items:
                if not math.isfinite(float(item)) or float(item) < 0:
                    raise ValueError("Ingrese valores numéricos no negativos")
        return json.dumps(items, ensure_ascii=False)
    if isinstance(column.type, Boolean):
        if not isinstance(value, bool):
            raise TypeError("Seleccione Sí o No")
        return value
    if isinstance(column.type, (Integer, Float)):
        if isinstance(value, bool):
            raise TypeError("Ingrese un número")
        number = float(value)
        if not math.isfinite(number):
            raise ValueError("Ingrese un número finito")
        if isinstance(column.type, Integer) and not number.is_integer():
            raise ValueError("Ingrese un número entero")
        if isinstance(column.type, Integer) and not -(2**31) <= number < 2**31:
            raise ValueError("El número entero es demasiado grande")
        return int(number) if isinstance(column.type, Integer) else number
    if isinstance(column.type, Date):
        return date.fromisoformat(str(value))
    if isinstance(column.type, Time):
        return time.fromisoformat(str(value))
    if not isinstance(value, str):
        raise TypeError("Ingrese texto")
    if len(value) > (getattr(column.type, "length", None) or 10000):
        raise ValueError("El texto es demasiado largo")
    value = value.strip()
    if not value and not column.nullable:
        raise ValueError("El campo es obligatorio")
    return value


def validate_update(form_id, record, changes):
    _module, _name, model, schema = FORMS[form_id]
    allowed = set(model.__table__.columns.keys()) - locked_fields(form_id)
    if not changes or set(changes) - allowed:
        raise ValueError("Se incluyeron campos que no se pueden editar")
    values = serialize(record)
    converted = {}
    for key, value in changes.items():
        try:
            converted[key] = convert(model.__table__.columns[key], value)
        except (ValueError, TypeError, OverflowError) as exc:
            raise ValueError(f"{label_for(key)}: {exc}") from exc
    values.update(converted)
    payload = {}
    for key in schema.model_fields:
        source = ALIASES.get(form_id, {}).get(key, key)
        if source not in values:
            continue
        value = values[source]
        if isinstance(value, (date, time)):
            value = value.isoformat()
        if key == "linea" and form_id.startswith("calidad-"):
            value = f"linea{value}" if value else None
        if key == "responsables":
            if isinstance(value, str):
                value = json.loads(value)
        elif (
            source in model.__table__.columns
            and array_field(model.__table__.columns[source])
            and isinstance(value, list)
        ):
            value = json.dumps(value, ensure_ascii=False)
        if key in {"hora_inicio", "hora_fin", "azucar_tipo"} and value is None:
            value = ""
        payload[key] = value
    try:
        schema.model_validate(payload)
    except ValidationError as exc:
        error = exc.errors()[0]
        key = str(error["loc"][0]) if error["loc"] else "Registro"
        raise ValueError(
            f"{label_for(ALIASES.get(form_id, {}).get(key, key))}: {error['msg']}"
        ) from exc
    for key, value in converted.items():
        if key in OPTIONS and value not in OPTIONS[key]:
            raise ValueError(f"{label_for(key)}: seleccione una opción válida")
    if form_id == "calidad-torque" and values["numero_cabezal"] > (
        12 if record.linea == 1 else 14
    ):
        raise ValueError("El cabezal no corresponde a esta línea")
    for key, value in converted.items():
        if (
            isinstance(value, (int, float))
            and not isinstance(value, bool)
            and value < 0
            and key not in {"temperatura", "pasteurizado_temp"}
        ):
            raise ValueError(f"{label_for(key)}: el valor no puede ser negativo")
    return converted


if __name__ == "__main__":
    # Only schema metadata, never database records; used by the isolated UI example.
    print(
        "export const PREVIEW_CATALOG = "
        + json.dumps(catalogue(), ensure_ascii=True, indent=2)
        + ";"
    )
