"""add training department enum value

Revision ID: a1b2c3d4e5f6
Revises: 7ef8ecab3d2b
Create Date: 2026-04-29

"""
from alembic import op

revision = 'a1b2c3d4e5f6'
down_revision = '7ef8ecab3d2b'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE department ADD VALUE IF NOT EXISTS 'training'")


def downgrade() -> None:
    pass
