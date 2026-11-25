"""Store the people selectable as responsables per module in the database."""

import json
from pathlib import Path

import sqlalchemy as sa
from alembic import op

revision = "0006_responsables"
down_revision = "0005_torque_lote_tapa"
branch_labels = None
depends_on = None

# Frozen snapshot of the lists shipped in code when this revision was written.
# Migrations must not import models or services: those evolve, a revision must not.
DEFAULT_RESPONSABLES = {
    "calidad": [
        "Moya Luis",
        "Diaz Mauro",
        "Alonso Dario",
        "Amaya Carlos",
        "Arra Julieta",
        "Barrionuevo Gonzalo",
    ],
    "agua": [
        "Moya Luis",
        "Diaz Mauro",
        "Alonso Dario",
        "Amaya Carlos",
        "Arra Julieta",
        "Barrionuevo Gonzalo",
    ],
    "jarabe": [
        "Gustavo Funes",
        "Carlos Videla",
        "Emanuel Juarez",
        "Sebastian Astor",
        "Carlos Abrego",
        "Pedro Guerra",
    ],
}

MAESTROS_PATH = (
    Path(__file__).resolve().parents[2] / "backend" / "static" / "data" / "maestros.json"
)


def _schema(bind):
    return "laboratorio" if bind.dialect.name == "postgresql" else None


def _initial_responsables():
    """Lists customized in maestros.json win over the frozen defaults."""
    try:
        maestros = json.loads(MAESTROS_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        maestros = {}
    calidad = maestros.get("responsables_calidad") or maestros.get("responsables")
    return {
        "calidad": calidad or DEFAULT_RESPONSABLES["calidad"],
        "agua": maestros.get("responsables_agua") or DEFAULT_RESPONSABLES["agua"],
        "jarabe": maestros.get("responsables_jarabe") or DEFAULT_RESPONSABLES["jarabe"],
    }


def upgrade():
    bind = op.get_bind()
    schema = _schema(bind)
    # The 0001 baseline builds tables from the live models, so on a fresh database
    # this table may already exist (empty) by the time this revision runs.
    if not sa.inspect(bind).has_table("responsables", schema=schema):
        op.create_table(
            "responsables",
            sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
            sa.Column("modulo", sa.String(20), nullable=False),
            sa.Column("nombre", sa.String(100), nullable=False),
            sa.UniqueConstraint("modulo", "nombre", name="uq_responsables_modulo_nombre"),
            schema=schema,
        )
        op.create_index(
            "ix_laboratorio_responsables_modulo", "responsables", ["modulo"], schema=schema
        )

    table = sa.table(
        "responsables",
        sa.column("id", sa.Integer),
        sa.column("modulo", sa.String),
        sa.column("nombre", sa.String),
        schema=schema,
    )
    if bind.execute(sa.select(table.c.id).limit(1)).first() is not None:
        # Seed only into an empty table so reruns never restore people deleted by an administrator.
        return

    rows = [
        {"modulo": modulo, "nombre": nombre}
        for modulo, nombres in _initial_responsables().items()
        for nombre in dict.fromkeys(n.strip() for n in nombres if n and n.strip())
    ]
    op.bulk_insert(table, rows)


def downgrade():
    # Keep the curated lists when rolling application code back.
    pass
