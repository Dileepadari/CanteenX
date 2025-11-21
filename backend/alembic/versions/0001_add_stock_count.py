"""add stock_count to menu_items

Revision ID: 0001_add_stock_count
Revises: 
Create Date: 2025-11-21 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_add_stock_count'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add stock_count column with default 0 if it does not exist
    try:
        op.add_column('menu_items', sa.Column('stock_count', sa.Integer(), nullable=False, server_default=sa.text('0')))
    except Exception:
        # If the column already exists or add fails, ignore to keep migrations idempotent
        pass


def downgrade() -> None:
    try:
        op.drop_column('menu_items', 'stock_count')
    except Exception:
        pass
