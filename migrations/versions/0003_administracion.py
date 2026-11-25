"""Add record authorship and administrative change history."""

from alembic import op

from backend.app.models.auditoria import AutorRegistro, CambioRegistro

revision = "0003_administracion"
down_revision = "0002_acondicionamiento_rinser"
branch_labels = None
depends_on = None


def upgrade():
    for table in (AutorRegistro.__table__, CambioRegistro.__table__):
        table.create(bind=op.get_bind(), checkfirst=True)


def downgrade():
    # Keep authorship and correction evidence when rolling application code back.
    pass
