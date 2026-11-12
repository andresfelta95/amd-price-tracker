-- 003: AM4/AM5 platforms, motherboards, exact-match rules.
-- Apply: docker exec -i postgres psql -U admin -d amd_tracker < db/migrations/003_platforms_motherboards.sql
-- Idempotent: safe to re-run.
BEGIN;

-- Motherboards become a third category
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IN ('cpu', 'gpu', 'motherboard'));

-- Socket as a real column (CPUs + boards; NULL for GPUs) so pages can filter on it
ALTER TABLE products ADD COLUMN IF NOT EXISTS socket TEXT;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_socket_check;
ALTER TABLE products ADD CONSTRAINT products_socket_check CHECK (socket IS NULL OR socket IN ('AM4', 'AM5'));
UPDATE products SET socket = specs->>'Socket'
 WHERE socket IS NULL AND specs->>'Socket' IN ('AM4', 'AM5');

-- Board chipset (A620, B650, B650E, B840, B850, X870, X870E, B550, ...)
ALTER TABLE products ADD COLUMN IF NOT EXISTS chipset TEXT;

-- Exact-match rule sent to the scraper: {"require": ["MSI","B850","TOMAHAWK"], "forbid": ["ICE"]}.
-- NULL keeps the scraper's original CPU/GPU name matching.
ALTER TABLE products ADD COLUMN IF NOT EXISTS match_tokens JSONB;

-- Hide a product from listings without losing its price history
ALTER TABLE products ADD COLUMN IF NOT EXISTS discontinued BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_products_category_socket ON products (category, socket);

COMMIT;
