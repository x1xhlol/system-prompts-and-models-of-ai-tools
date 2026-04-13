"""Add company_name, sector, city to leads.

Revision ID: 20260413_0003
Revises: 20260413_0002
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260413_0003"
down_revision: Union[str, None] = "20260413_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name if bind else ""
    if dialect == "sqlite":
        with op.batch_alter_table("leads") as batch:
            batch.add_column(sa.Column("company_name", sa.String(255), nullable=True))
            batch.add_column(sa.Column("sector", sa.String(100), nullable=True))
            batch.add_column(sa.Column("city", sa.String(100), nullable=True))
    else:
        op.add_column("leads", sa.Column("company_name", sa.String(255), nullable=True))
        op.add_column("leads", sa.Column("sector", sa.String(100), nullable=True))
        op.add_column("leads", sa.Column("city", sa.String(100), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name if bind else ""
    if dialect == "sqlite":
        with op.batch_alter_table("leads") as batch:
            batch.drop_column("city")
            batch.drop_column("sector")
            batch.drop_column("company_name")
    else:
        op.drop_column("leads", "city")
        op.drop_column("leads", "sector")
        op.drop_column("leads", "company_name")
