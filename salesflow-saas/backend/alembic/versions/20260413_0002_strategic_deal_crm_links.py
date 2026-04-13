"""Add lead_id and sales_deal_id to strategic_deals.

Revision ID: 20260413_0002
Revises: 20260403_0001
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260413_0002"
down_revision: Union[str, None] = "20260403_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name if bind else ""
    uid = sa.Uuid(as_uuid=True)
    if dialect == "sqlite":
        with op.batch_alter_table("strategic_deals") as batch:
            batch.add_column(sa.Column("lead_id", uid, nullable=True))
            batch.add_column(sa.Column("sales_deal_id", uid, nullable=True))
    else:
        op.add_column("strategic_deals", sa.Column("lead_id", uid, nullable=True))
        op.add_column("strategic_deals", sa.Column("sales_deal_id", uid, nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name if bind else ""
    if dialect == "sqlite":
        with op.batch_alter_table("strategic_deals") as batch:
            batch.drop_column("sales_deal_id")
            batch.drop_column("lead_id")
    else:
        op.drop_column("strategic_deals", "sales_deal_id")
        op.drop_column("strategic_deals", "lead_id")
