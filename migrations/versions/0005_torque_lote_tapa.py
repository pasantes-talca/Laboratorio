"""Record the cap lot in torque controls instead of finished-beverage controls."""

from alembic import op
from sqlalchemy import Column, String, inspect

revision = "0005_torque_lote_tapa"
down_revision = "0004_numero_saneo"
branch_labels = None
depends_on = None


def _schema(bind):
    return "laboratorio" if bind.dialect.name == "postgresql" else None


def upgrade():
    bind = op.get_bind()
    schema = _schema(bind)
    inspector = inspect(bind)
    if inspector.has_table("control_torque", schema=schema):
        columns = inspector.get_columns("control_torque", schema=schema)
        if not any(column["name"] == "lote_tapa" for column in columns):
            # Nullable: torque rows recorded before this change have no cap lot.
            op.add_column(
                "control_torque",
                Column("lote_tapa", String(50), nullable=True),
                schema=schema,
            )


def downgrade():
    bind = op.get_bind()
    schema = _schema(bind)
    inspector = inspect(bind)
    if inspector.has_table("control_torque", schema=schema):
        columns = inspector.get_columns("control_torque", schema=schema)
        if any(column["name"] == "lote_tapa" for column in columns):
            with op.batch_alter_table("control_torque", schema=schema) as batch:
                batch.drop_column("lote_tapa")
