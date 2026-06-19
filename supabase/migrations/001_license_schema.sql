-- ════════════════════════════════════════════════════════════
-- SuruhNgoding — Database Schema
-- Jalankan di Supabase SQL Editor (Dashboard → SQL Editor)
-- ════════════════════════════════════════════════════════════

-- ── TABEL LICENSES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS licenses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT        UNIQUE NOT NULL,
  product     TEXT        NOT NULL CHECK (product IN ('SuruhKelola', 'SuruhLaundry')),
  package     TEXT        NOT NULL CHECK (package IN ('Starter', 'Bisnis', 'Pro')),
  owner_name  TEXT        NOT NULL DEFAULT '',
  owner_email TEXT        NOT NULL DEFAULT '',
  status      TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  max_devices INTEGER     NOT NULL DEFAULT 1,
  notes       TEXT        DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TABEL DEVICES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id   UUID        NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  device_id    TEXT        NOT NULL,  -- UUID unik dari perangkat
  device_name  TEXT        NOT NULL DEFAULT '',
  platform     TEXT        NOT NULL DEFAULT '',
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (license_id, device_id)     -- satu device_id hanya bisa terdaftar sekali per lisensi
);

-- ── TABEL ORDERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT        UNIQUE NOT NULL,
  buyer_name        TEXT        NOT NULL,
  buyer_email       TEXT        NOT NULL,
  product           TEXT        NOT NULL,
  package           TEXT        NOT NULL,
  amount            INTEGER     NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'uploaded', 'confirmed', 'rejected')),
  payment_proof_url TEXT,
  rejection_reason  TEXT,
  license_id        UUID        REFERENCES licenses(id),  -- diisi setelah konfirmasi
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── AUTO UPDATE updated_at ──────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ── ROW LEVEL SECURITY ──────────────────────────────────────
-- Edge Functions pakai service_role key → bypass RLS otomatis
-- Admin dashboard pakai anon key + Supabase Auth → hanya user login yang bisa akses

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders   ENABLE ROW LEVEL SECURITY;

-- Admin (authenticated user) bisa baca & kelola semua data
CREATE POLICY "admin_all_licenses" ON licenses
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_devices" ON devices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_orders" ON orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── INDEX ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_licenses_key     ON licenses (license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_email   ON licenses (owner_email);
CREATE INDEX IF NOT EXISTS idx_devices_license  ON devices  (license_id);
CREATE INDEX IF NOT EXISTS idx_orders_number    ON orders   (order_number);
CREATE INDEX IF NOT EXISTS idx_orders_email     ON orders   (buyer_email);
