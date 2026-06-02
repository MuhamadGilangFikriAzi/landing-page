-- ════════════════════════════════════════════════════════════
-- SuruhNgoding — Migrasi 002: Tambah fitur masa berlaku lisensi
-- Jalankan di Supabase SQL Editor setelah migration 001
-- ════════════════════════════════════════════════════════════

-- Tambah kolom tipe lisensi: 'lifetime' (selamanya) atau 'trial'
ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS license_type TEXT NOT NULL DEFAULT 'lifetime'
  CHECK (license_type IN ('lifetime', 'trial'));

-- Tambah kolom batas berlaku: NULL = selamanya, diisi = punya expiry
ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS valid_until TIMESTAMPTZ NULL;

-- Index untuk mempercepat query cek expired
CREATE INDEX IF NOT EXISTS idx_licenses_valid_until ON licenses (valid_until)
  WHERE valid_until IS NOT NULL;
