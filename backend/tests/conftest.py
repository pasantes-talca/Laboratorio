"""Shared fixtures for the Laboratorio backend test suite.

CRITICAL SAFETY: every test runs against the throwaway database
``calidad_test`` — never against the production ``calidad`` database.

The environment override MUST happen BEFORE importing ``database`` or
``main``, because both read ``DB_NAME`` at import time (load_dotenv does
not overwrite pre-set env vars).
"""

import os

from dotenv import load_dotenv

# 1) Load .env so DB_HOST/DB_USER/etc. are available, then force the test DB.
load_dotenv()
os.environ["DB_NAME"] = "calidad_test"

import pytest  # noqa: E402
import psycopg2  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
TEST_DB_NAME = "calidad_test"


def _truncate_all():
    """TRUNCATE every table in schema laboratorio (test DB only)."""
    import database

    with database.engine.begin() as conn:
        for table in reversed(database.Base.metadata.sorted_tables):
            conn.execute(
                text(f'TRUNCATE TABLE laboratorio.{table.name} RESTART IDENTITY CASCADE')
            )


@pytest.fixture(scope="session")
def client():
    """Module/session-scoped TestClient bound to the calidad_test database."""
    # Idempotently create the throwaway database.
    admin = psycopg2.connect(
        dbname="postgres",
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        connect_timeout=15,
    )
    admin.autocommit = True
    try:
        with admin.cursor() as cur:
            cur.execute(f'CREATE DATABASE "{TEST_DB_NAME}"')
    except psycopg2.errors.DuplicateDatabase:
        pass  # already exists from a previous run — fine
    finally:
        admin.close()

    # MetaData(schema="laboratorio") requires the schema to exist before
    # Base.metadata.create_all() runs during app lifespan startup.
    import database

    with database.engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS laboratorio"))
        conn.commit()

    # Importing main registers routes; entering TestClient context runs the
    # lifespan -> init_db() -> create_all against calidad_test.
    from main import app

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(autouse=True)
def _clean_tables(client):
    """Truncate all tables before AND after each test for full isolation."""
    _truncate_all()
    yield
    _truncate_all()


@pytest.fixture
def db_engine():
    """Direct engine access for asserting stored values with no GET endpoint."""
    import database

    return database.engine


@pytest.fixture
def payloads():
    """Valid payload templates for each endpoint. Tests may mutate copies."""

    def control_bebida(**overrides):
        base = {
            "hora": "08:30",
            "turno": "Mañana",
            "linea": "linea1",
            "carac_organolep": "okey",
            "nivel_llenado": "okey",
            "contenido": 2250.0,
            "presion": 2.8,
            "temperatura": 6.5,
            "vol_gas": 3.9,
            "brix": 11.8,
            "control_videojet": "okey",
            "responsable": "Moya Luis",
            "marca": "Cola",
            "tipo_concentrado": "KG",
            "tamano": "2L",
            "lote_tapa": "LT-100",
            "tanque": "7",
        }
        base.update(overrides)
        return base

    def control_jarabe(**overrides):
        base = {
            "hora": "09:15",
            "turno": "Tarde",
            "linea": "linea1",
            "sabor": "Naranja",
            "concentrado": "KG",
            "tanque": " 8 ",
            "bx_patron": 60.5,
            "ta": 0.9,
            "responsable": "Gustavo Funes",
            "observacion": "Sin novedad",
            "numero_carga_trilay": "TR-77",
        }
        base.update(overrides)
        return base

    def jarabe_simple(**overrides):
        base = {
            "fecha": "2026-08-25",
            "hora": "07:45",
            "tanque": "9",
            "volcado_numero": 1,
            "cantidad_bolsas": 12,
            "azucar_tipo": "Blanca",
            "azucar_marca": "Ledesma",
            "azucar_ntu": "5",
            "aux_standard": 0.4,
            "aux_hyflo": 0.2,
            "pasteurizado_desde": "08:00",
            "pasteurizado_hasta": "09:00",
            "pasteurizado_temp": 85.5,
            "responsables": ["Carlos Videla", "Pedro Guerra"],
        }
        base.update(overrides)
        return base

    def jarabe_terminado(**overrides):
        base = {
            "fecha": "2026-08-25",
            "sabor": "Cola",
            "concentrado": "IFF",
            "tanque": "10",
            "unidades": 30,
            "volcado_numero": "2",
            "tiempo_filtrado": "01:30",
            "be_jarabe_simple": 59.8,
            "vol_jarabe_simple": 5000.0,
            "lts_jarabe_terminado": 4950.0,
            "responsables": ["Emanuel Juarez"],
        }
        base.update(overrides)
        return base

    def saneo_tanque(**overrides):
        base = {
            "fecha": "2026-08-25",
            "hora_inicio": "06:00",
            "hora_fin": "06:45",
            "tanque": "11",
            "producto": "Agua + Cloro",
            "responsables": ["Sebastian Astor"],
            "numero_saneo": 3,
        }
        base.update(overrides)
        return base

    def parte_jarabe(**overrides):
        base = {
            "fecha": "2026-08-25",
            "turno": "Noche",
            "tanque": "12",
            "numero_carga_trilay": "TR-99",
            "sabor": "Pomelo",
            "responsables": ["Carlos Abrego"],
            "azucar": 800.0,
            "sucralosa": 1.2,
            "reforzado_citrico": 0.5,
            "acesulfame_k": 0.8,
            "benzoato_sodio": 3.0,
            "sorbato_potasio": 2.5,
            "citrato_sodio": 1.0,
            "acido_citrico": 4.0,
            "acido_fosforico": 2.0,
            "acido_ascorbico": 0.3,
            "cafeina": 1.5,
            "colorante_caramelo": 0.9,
        }
        base.update(overrides)
        return base

    def control_torque(**overrides):
        base = {
            "numero_cabezal": 1,
            "turno": "mañana",
            "noche": None,
            "linea": "linea1",
            "valor": 12.5,
            "sabor": "Lima",
            "marca": "Lima",
            "color": "Verde",
            "responsable": "Alonso Dario",
        }
        base.update(overrides)
        return base

    def pausa(**overrides):
        base = {
            "motivo": "Falta de tapas",
            "responsable": "Amaya Carlos",
            "observacion": "Espera de insumos",
            "turno": "tarde",
            "linea": "linea2",
        }
        base.update(overrides)
        return base

    from types import SimpleNamespace

    return SimpleNamespace(
        control_bebida=control_bebida,
        control_jarabe=control_jarabe,
        jarabe_simple=jarabe_simple,
        jarabe_terminado=jarabe_terminado,
        saneo_tanque=saneo_tanque,
        parte_jarabe=parte_jarabe,
        control_torque=control_torque,
        pausa=pausa,
    )
