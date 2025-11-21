"""add subtotal, tax to orders and snapshot fields to order_items

Revision ID: 0002_add_order_snapshot_and_totals
Revises: 0001_add_stock_count
Create Date: 2025-11-21 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_add_order_snapshot_and_totals'
down_revision = '0001_add_stock_count'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add subtotal and tax to orders
    try:
        op.add_column('orders', sa.Column('subtotal', sa.Float(), nullable=True, server_default=sa.text('0')))
    except Exception:
        pass
    try:
        op.add_column('orders', sa.Column('tax', sa.Float(), nullable=True, server_default=sa.text('0')))
    except Exception:
        pass

    # Add snapshot fields to order_items
    try:
        op.add_column('order_items', sa.Column('snapshot_name', sa.String(), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('order_items', sa.Column('snapshot_price', sa.Float(), nullable=True, server_default=sa.text('0')))
    except Exception:
        pass


def downgrade() -> None:
    # Remove snapshot fields from order_items
    try:
        op.drop_column('order_items', 'snapshot_price')
    except Exception:
        pass
    try:
        op.drop_column('order_items', 'snapshot_name')
    except Exception:
        pass

    # Remove subtotal and tax from orders
    try:
        op.drop_column('orders', 'tax')
    except Exception:
        pass
    try:
        op.drop_column('orders', 'subtotal')
    except Exception:
        pass
