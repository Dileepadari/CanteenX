-- Migration: add stock_count column to menu_items
-- Run this against your database (Postgres) to add the new column that persists stock counts for menu items.

ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0;

-- Optional: backfill existing rows if you want to set a sensible default other than 0
-- UPDATE menu_items SET stock_count = 50 WHERE stock_count IS NULL;
