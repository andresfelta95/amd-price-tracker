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
  source      TEXT NOT NULL DEFAULT 'dom',  -- 'dom' | 'vision' (read from a screenshot)
  url         TEXT,                         -- page the price came from
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

-- User accounts (see db/migrations/002_accounts_alerts.sql)
CREATE TABLE IF NOT EXISTS users (
  id                SERIAL PRIMARY KEY,
  email             TEXT NOT NULL UNIQUE,      -- always stored lowercased
  password_hash     TEXT NOT NULL,             -- scrypt$<salt hex>$<hash hex>
  email_verified_at TIMESTAMPTZ,
  telegram_chat_id  BIGINT,
  notify_email      BOOLEAN NOT NULL DEFAULT TRUE,
  notify_telegram   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,                 -- SHA-256 of the cookie value
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

CREATE TABLE IF NOT EXISTS auth_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose    TEXT NOT NULL CHECK (purpose IN ('verify_email', 'reset_password', 'telegram_link')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Price alerts (one per user per product; variant alerts are not checked)
CREATE TABLE IF NOT EXISTS alerts (
  id          SERIAL PRIMARY KEY,
  product_id  TEXT REFERENCES products(id) ON DELETE CASCADE,
  variant_id  INT  REFERENCES gpu_variants(id) ON DELETE CASCADE,
  user_id     INT  REFERENCES users(id) ON DELETE CASCADE,
  target_price NUMERIC(10,2) NOT NULL,
  email       TEXT,                            -- legacy, pre-accounts alerts only
  triggered   BOOLEAN NOT NULL DEFAULT FALSE,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_notified_at    TIMESTAMPTZ,
  last_notified_price NUMERIC(10,2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts (user_id);

-- Delivery log: one row per notification attempt
CREATE TABLE IF NOT EXISTS alert_notifications (
  id       BIGSERIAL PRIMARY KEY,
  alert_id INT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  channel  TEXT NOT NULL CHECK (channel IN ('email', 'telegram')),
  price    NUMERIC(10,2) NOT NULL,
  sent_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error    TEXT
);
