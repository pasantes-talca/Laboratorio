"""Align legacy tank cleaning tables with the existing form model."""

from alembic import op
from sqlalchemy import Column, Integer, inspect

revision = "0004_numero_saneo"
down_revision = "0003_administracion"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    schema = "laboratorio" if bind.dialect.name == "postgresql" else None
    inspector = inspect(bind)
    if inspector.has_table("saneo_tanques", schema=schema):
        columns = inspector.get_columns("saneo_tanques", schema=schema)
        if not any(column["name"] == "numero_saneo" for column in columns):
            op.add_column(
                "saneo_tanques",
                Column("numero_saneo", Integer, nullable=True),
                schema=schema,
            )


def downgrade():
    # Retain identifiers assigned to cleaning records.
    pass
