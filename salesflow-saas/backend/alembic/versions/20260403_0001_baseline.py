"""Baseline schema — use `alembic revision --autogenerate` against Postgres for real migrations.

Revision ID: 20260403_0001
Revises:
Create Date: 2026-04-03

"""

from typing import Sequence, Union

from alembic import op

revision: str = "20260403_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """No-op: dev SQLite often uses `init_db()`; production should autogenerate from models."""
    pass


def downgrade() -> None:
    pass
