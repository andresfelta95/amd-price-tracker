-- AMD Price Tracker — PostgreSQL Schema

CREATE TABLE IF NOT EXISTS products (
  id            TEXT PRIMARY KEY,           -- slug, e.g. "ryzen-9-9950x"
  name          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('cpu', 'gpu')),
  image         TEXT NOT NULL DEFAULT '/cpu-placeholder.svg',
  specs         JSONB NOT NULL DEFAULT '{}',
  msrp          NUMERIC(10,2) NOT NULL,
  release_date  DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retailers (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,   -- e.g. "Amazon.ca"
  url   TEXT NOT NULL           -- base URL
);

-- Every price check for a base product at a retailer
CREATE TABLE IF NOT EXISTS price_snapshots (
  id          BIGSERIAL PRIMARY KEY,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  retailer_id INT  NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  price       NUMERIC(10,2) NOT NULL,
  in_stock    BOOLEAN NOT NULL DEFAULT TRUE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_product_time ON price_snapshots (product_id, recorded_at DESC);

-- GPU brand variants (ASUS TUF, Gigabyte Gaming OC, etc.)
CREATE TABLE IF NOT EXISTS gpu_variants (
  id          SERIAL PRIMARY KEY,
  product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand       TEXT NOT NULL,         -- e.g. "ASUS"
  variant     TEXT NOT NULL,         -- e.g. "TUF Gaming OC"
  full_name   TEXT NOT NULL,         -- e.g. "ASUS TUF Gaming Radeon RX 9070 XT OC"
  retailer_id INT REFERENCES retailers(id),
  url         TEXT,
  UNIQUE (product_id, brand, variant)
);

-- Price history for each GPU variant
CREATE TABLE IF NOT EXISTS gpu_variant_snapshots (
  id          BIGSERIAL PRIMARY KEY,
  variant_id  INT NOT NULL REFERENCES gpu_variants(id) ON DELETE CASCADE,
  price       NUMERIC(10,2) NOT NULL,
  in_stock    BOOLEAN NOT NULL DEFAULT TRUE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variant_snapshots_time ON gpu_variant_snapshots (variant_id, recorded_at DESC);

-- Price alerts
CREATE TABLE IF NOT EXISTS alerts (
  id          SERIAL PRIMARY KEY,
  product_id  TEXT REFERENCES products(id) ON DELETE CASCADE,
  variant_id  INT  REFERENCES gpu_variants(id) ON DELETE CASCADE,
  target_price NUMERIC(10,2) NOT NULL,
  email       TEXT NOT NULL,
  triggered   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL)
);
