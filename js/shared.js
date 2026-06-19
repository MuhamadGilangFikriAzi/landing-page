/* ═══════════════════════════════════════════════════════════
   shared.js — Fungsi dan data yang dipakai bersama di semua halaman
   Diload SEBELUM script halaman (beli.js, cek-lisensi.js, dll.)
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ── PRODUK & HARGA (sumber kebenaran tunggal) ───────────── */
const PRODUCTS = {
  suruhkelola: {
    label: 'SuruhKelola',
    paket: {
      starter:    { label: 'Starter',    harga: 299000,  device: 1  },
      bisnis:     { label: 'Bisnis',     harga: 599000,  device: 3  },
      pro:        { label: 'Pro',        harga: 999000,  device: 10 },
      enterprise: { label: 'Enterprise', harga: 2500000, device: 9999 },
    }
  },
  suruhlaundry: {
    label: 'SuruhLaundry',
    paket: {
      starter:    { label: 'Starter',    harga: 299000,  device: 1  },
      bisnis:     { label: 'Bisnis',     harga: 599000,  device: 3  },
      pro:        { label: 'Pro',        harga: 999000,  device: 10 },
      enterprise: { label: 'Enterprise', harga: 2500000, device: 9999 },
    }
  }
};

/* ── REKENING BANK ──────────────────────────────────────── */
const BANK_ACCOUNTS = [
  { bank: 'BCA',     nomor: '1234567890', atas: 'SuruhNgoding' },
  { bank: 'BRI',     nomor: '0987654321', atas: 'SuruhNgoding' },
  { bank: 'Mandiri', nomor: '1122334455', atas: 'SuruhNgoding' },
];

/* ── TOAST ──────────────────────────────────────────────── */
/* Menampilkan notifikasi singkat di elemen #toast */
let _sharedToastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_sharedToastTimer);
  _sharedToastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ── COPY TO CLIPBOARD ──────────────────────────────────── */
function copyToClipboard(text, btn) {
  if (!text || text === '—') return;
  navigator.clipboard.writeText(text)
    .then(() => {
      showToast('Disalin!');
      if (btn) _flashCopyBtn(btn);
    })
    .catch(() => {
      // Fallback untuk browser yang tidak support clipboard API
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;top:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Disalin!');
      if (btn) _flashCopyBtn(btn);
    });
}

function _flashCopyBtn(btn) {
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> Disalin';
  btn.style.color = '#10b981';
  btn.style.borderColor = '#10b981';
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.color = '';
    btn.style.borderColor = '';
  }, 2000);
}

/* ── ESCAPE HTML ────────────────────────────────────────── */
function escapeHtml(str) {
  if (typeof str !== 'string') return str || '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ── FORMAT TANGGAL ─────────────────────────────────────── */
/* Menghasilkan format "15 Januari 2026" */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

/* ── FORMAT RUPIAH ──────────────────────────────────────── */
function formatRupiah(amount) {
  return 'Rp ' + (amount || 0).toLocaleString('id-ID');
}
