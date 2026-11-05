from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect, text


def test_baseline_creates_missing_tables_and_preserves_existing_records():
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    engine = create_engine("sqlite://")
    with engine.begin() as raw_connection:
        connection = raw_connection.execution_options(schema_translate_map={"laboratorio": None})
        connection.execute(text("CREATE TABLE existing_data (id INTEGER PRIMARY KEY, value TEXT)"))
        connection.execute(text("INSERT INTO existing_data VALUES (1, 'preserved')"))
        config.attributes["connection"] = connection
        command.upgrade(config, "head")
        command.upgrade(config, "head")
        tables = inspect(connection).get_table_names()
        assert "control_jarabe" in tables
        assert "control_produccion" in tables
        assert connection.execute(text("SELECT value FROM existing_data")).scalar_one() == "preserved"
        assert "autor_registro" in tables
        assert "cambio_registro" in tables
        assert connection.execute(text("SELECT version_num FROM alembic_version")).scalar_one() == "0005_torque_lote_tapa"


def test_rinser_upgrade_preserves_legacy_chlorine_results():
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    engine = create_engine("sqlite://")
    with engine.begin() as raw_connection:
        connection = raw_connection.execution_options(schema_translate_map={"laboratorio": None})
        connection.execute(text("CREATE TABLE analisis_cloro_agua (id INTEGER PRIMARY KEY, cloro_riser_resultado FLOAT)"))
        connection.execute(text("INSERT INTO analisis_cloro_agua VALUES (1, 1.2)"))
        config.attributes["connection"] = connection
        command.stamp(config, "0001_baseline")
        command.upgrade(config, "head")
        row = connection.execute(text("SELECT cloro_riser_resultado, acondicionamiento_rinser FROM analisis_cloro_agua")).one()
        assert row == (1.2, None)


def test_cleaning_upgrade_preserves_legacy_rows():
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    engine = create_engine("sqlite://")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE saneo_tanques (id INTEGER PRIMARY KEY, producto TEXT)"))
        connection.execute(text("INSERT INTO saneo_tanques VALUES (1, 'Existente')"))
        config.attributes["connection"] = connection
        command.stamp(config, "0003_administracion")
        command.upgrade(config, "head")
        command.upgrade(config, "head")
        assert connection.execute(text("SELECT producto, numero_saneo FROM saneo_tanques")).one() == ("Existente", None)


def test_torque_cap_lot_upgrade_keeps_legacy_rows_and_is_reversible():
    # Built without alembic.ini so the test does not depend on a local config file.
    config = Config()
    config.set_main_option("script_location", str(Path(__file__).resolve().parents[1] / "migrations"))
    engine = create_engine("sqlite://")
    with engine.begin() as connection:
        connection.execute(text("CREATE TABLE control_torque (id INTEGER PRIMARY KEY, valor FLOAT)"))
        connection.execute(text("INSERT INTO control_torque VALUES (1, 15.5)"))
        config.attributes["connection"] = connection
        command.stamp(config, "0004_numero_saneo")
        command.upgrade(config, "head")
        command.upgrade(config, "head")
        assert connection.execute(text("SELECT valor, lote_tapa FROM control_torque")).one() == (15.5, None)
        command.downgrade(config, "0004_numero_saneo")
        columns = [column["name"] for column in inspect(connection).get_columns("control_torque")]
        assert "lote_tapa" not in columns
        assert connection.execute(text("SELECT valor FROM control_torque")).scalar_one() == 15.5
