"""Create the laboratorio schema and all known tables safely.

Revision ID: 0001_baseline
Revises: None
"""

from alembic import op
from sqlalchemy import text

from backend.app.models import Base

revision = "0001_baseline"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        bind.execute(text("CREATE SCHEMA IF NOT EXISTS laboratorio"))
    Base.metadata.create_all(bind=bind, checkfirst=True)


def downgrade() -> None:
    # Baseline migrations intentionally never drop production laboratory data.
    pass
