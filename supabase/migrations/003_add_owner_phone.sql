-- ════════════════════════════════════════════════════════════
-- SuruhNgoding — Migrasi 003: Tambah kolom no. telepon pemilik
-- Jalankan di Supabase SQL Editor setelah migration 002
-- ════════════════════════════════════════════════════════════

ALTER TABLE licenses
  ADD COLUMN IF NOT EXISTS owner_phone TEXT NOT NULL DEFAULT '';
