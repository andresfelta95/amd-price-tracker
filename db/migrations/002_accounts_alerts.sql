-- 002: user accounts, per-user alerts with delivery tracking, snapshot source.
-- Idempotent: safe to re-run.

BEGIN;

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

-- Only the SHA-256 of the session cookie is stored
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

-- Single-use tokens for email verification, password reset and Telegram linking
CREATE TABLE IF NOT EXISTS auth_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose    TEXT NOT NULL CHECK (purpose IN ('verify_email', 'reset_password', 'telegram_link')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMPTZ;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS last_notified_price NUMERIC(10,2);
ALTER TABLE alerts ALTER COLUMN email DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts (user_id);

CREATE TABLE IF NOT EXISTS alert_notifications (
  id       BIGSERIAL PRIMARY KEY,
  alert_id INT NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  channel  TEXT NOT NULL CHECK (channel IN ('email', 'telegram')),
  price    NUMERIC(10,2) NOT NULL,
  sent_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error    TEXT
);

-- 'dom' = parsed from page markup/JSON, 'vision' = read from a screenshot by Claude
ALTER TABLE price_snapshots ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'dom';
-- Product/search page the price came from (linked from alert notifications)
ALTER TABLE price_snapshots ADD COLUMN IF NOT EXISTS url TEXT;

COMMIT;
