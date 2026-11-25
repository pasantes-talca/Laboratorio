"""Add rinser chlorine conditioning in ppm without changing existing records."""

from alembic import op
from sqlalchemy import Column, Float, inspect

revision = "0002_acondicionamiento_rinser"
down_revision = "0001_baseline"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    schema = "laboratorio" if bind.dialect.name == "postgresql" else None
    columns = inspect(bind).get_columns("analisis_cloro_agua", schema=schema)
    # The baseline also adopts existing tables and may already create this column
    # on a fresh database, so both upgrade paths must remain valid.
    if not any(column["name"] == "acondicionamiento_rinser" for column in columns):
        op.add_column(
            "analisis_cloro_agua",
            Column("acondicionamiento_rinser", Float, nullable=True),
            schema=schema,
        )


def downgrade() -> None:
    # Retain measurements when rolling back application code.
    pass
