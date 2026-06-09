/* ─────────────────────────────────────────────────────────
   cek-lisensi.js — Cek Status Lisensi Customer
   Membutuhkan js/shared.js dimuat terlebih dahulu.
   ───────────────────────────────────────────────────────── */

'use strict';

/* ── SUPABASE CONFIG (kosong = demo mode) ───────────────── */
const SUPABASE_URL       = '';
const SUPABASE_ANON_KEY  = '';
const DEMO_MODE = !SUPABASE_URL || !SUPABASE_ANON_KEY;

/* escapeHtml, showToast, copyToClipboard, formatDate tersedia dari shared.js */

/* ── MOCK DATA ──────────────────────────────────────────── */
const MOCK_LICENSES = [
  {
    id: 'lic-001',
    key: 'SK-A1B2-C3D4-E5F6-G7H8',
    keyMasked: 'SK-A1B2-****-****-G7H8',
    product: 'SuruhKelola',
    paket: 'Bisnis',
    maxDevice: 3,
    status: 'active',
    owner: 'Budi Santoso',
    email: 'budi@example.com',
    purchaseDate: '2026-01-15',
    validUntil: 'Selamanya',
    devices: [
      { name: 'Redmi Note 12', platform: 'android', lastSeen: '2 jam lalu' },
      { name: 'ASUS Laptop', platform: 'windows', lastSeen: '1 hari lalu' },
    ],
    activationSteps: 'suruhkelola',
  },
  {
    id: 'lic-002',
    key: 'SLNDRY-K3L4-M5N6-O7P8-Q9R0',
    keyMasked: 'SLNDRY-****-****-****-Q9R0',
    product: 'SuruhLaundry',
    paket: 'Starter',
    maxDevice: 1,
    status: 'active',
    owner: 'Siti Rahayu',
    email: 'siti@example.com',
    purchaseDate: '2026-02-03',
    validUntil: 'Selamanya',
    devices: [
      { name: 'Samsung Galaxy A34', platform: 'android', lastSeen: '5 menit lalu' },
    ],
    activationSteps: 'suruhlaundry',
  },
  {
    id: 'lic-003',
    key: 'SK-Z9Y8-X7W6-V5U4-T3S2',
    keyMasked: 'SK-Z9Y8-****-****-T3S2',
    product: 'SuruhKelola',
    paket: 'Starter',
    maxDevice: 1,
    status: 'inactive',
    owner: 'Anton Wijaya',
    email: 'anton@example.com',
    purchaseDate: '2025-11-20',
    validUntil: 'Selamanya',
    devices: [],
    activationSteps: 'suruhkelola',
  },
];

const MOCK_ORDERS = [
  {
    orderNumber: 'SN-20260101-001',
    produk: 'SuruhKelola',
    paket: 'Bisnis',
    nama: 'Budi Santoso',
    email: 'budi@example.com',
    status: 'confirmed',     // pending_bukti | pending_konfirmasi | confirmed | rejected
    createdAt: '2026-01-01 10:00',
    updatedAt: '2026-01-01 11:30',
    amount: 699123,
  },
  {
    orderNumber: 'SN-20260205-042',
    produk: 'SuruhLaundry',
    paket: 'Starter',
    nama: 'Siti Rahayu',
    email: 'siti@example.com',
    status: 'pending_konfirmasi',
    createdAt: '2026-02-05 14:22',
    updatedAt: '2026-02-05 14:25',
    amount: 249456,
  },
  {
    orderNumber: 'SN-20260310-007',
    produk: 'SuruhKelola',
    paket: 'Pro',
    nama: 'Dian Permata',
    email: 'dian@example.com',
    status: 'pending_bukti',
    createdAt: '2026-03-10 09:15',
    updatedAt: '2026-03-10 09:15',
    amount: 1499789,
  },
];

/* ── ACTIVATION STEPS COPY ──────────────────────────────── */
const ACTIVATION_STEPS = {
  suruhkelola: [
    'Download aplikasi SuruhKelola dari Play Store / Windows Store',
    'Buka aplikasi dan pilih menu <strong>Aktivasi Lisensi</strong>',
    'Masukkan license key yang telah dikirim ke email kamu',
    'Klik <strong>Aktifkan</strong> — aplikasi siap digunakan!',
    'Untuk pertanyaan, hubungi support via WhatsApp',
  ],
  suruhlaundry: [
    'Download aplikasi SuruhLaundry dari Play Store / Windows Store',
    'Buka aplikasi dan pilih menu <strong>Aktivasi Lisensi</strong>',
    'Masukkan license key yang telah dikirim ke email kamu',
    'Klik <strong>Aktifkan</strong> — aplikasi siap digunakan!',
    'Untuk pertanyaan, hubungi support via WhatsApp',
  ],
};

/* ── STATUS LABELS ──────────────────────────────────────── */
const ORDER_STATUS_INFO = {
  pending_bukti: {
    label: 'Menunggu Bukti Transfer',
    step: 1,
    desc: 'Kami menunggu bukti transfer dari kamu. Silakan upload bukti transfer melalui halaman pembelian.',
    color: '#f59e0b',
  },
  pending_konfirmasi: {
    label: 'Menunggu Konfirmasi',
    step: 2,
    desc: 'Bukti transfer sudah diterima. Tim kami sedang memverifikasi pembayaran — biasanya 1–2 jam.',
    color: '#3b82f6',
  },
  confirmed: {
    label: 'Terkonfirmasi & License Terkirim',
    step: 3,
    desc: 'Pembayaran terkonfirmasi! License key sudah dikirimkan ke email kamu. Cek folder inbox atau spam.',
    color: '#10b981',
  },
  rejected: {
    label: 'Ditolak',
    step: 4,
    desc: 'Pembayaran tidak dapat dikonfirmasi. Silakan hubungi tim kami via WhatsApp untuk bantuan.',
    color: '#ef4444',
  },
};

/* ── CURRENT TAB ────────────────────────────────────────── */
let _currentTab = 'key';
let _keyVisible = false;

/* ── SWITCH TAB ─────────────────────────────────────────── */
function switchTab(tab) {
  _currentTab = tab;
  ['key', 'email', 'order'].forEach(t => {
    const btn   = document.getElementById(`tab-btn-${t}`);
    const panel = document.getElementById(`tab-panel-${t}`);
    if (btn)   btn.classList.toggle('active',   t === tab);
    if (panel) panel.classList.toggle('active', t === tab);
  });
  hideResult();
}

/* ── CEK BY LICENSE KEY ─────────────────────────────────── */
function cekByLicenseKey() {
  const val = document.getElementById('inputLicenseKey').value.trim();
  if (!val) { showToast('Masukkan license key terlebih dahulu'); return; }

  showLoading();

  setTimeout(() => {
    if (DEMO_MODE) {
      const found = MOCK_LICENSES.find(l => l.key.toUpperCase() === val.toUpperCase());
      found ? renderLisensiResult(found) : renderNotFound('license_key', val);
    }
    // Supabase hook: await supabase.from('licenses').select('*').eq('key', val)
  }, 500);
}

/* ── CEK BY EMAIL ───────────────────────────────────────── */
function cekByEmail() {
  const val = document.getElementById('inputEmailSearch').value.trim();
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!val || !emailRx.test(val)) { showToast('Masukkan email yang valid'); return; }

  showLoading();

  setTimeout(() => {
    if (DEMO_MODE) {
      const found = MOCK_LICENSES.filter(l => l.email.toLowerCase() === val.toLowerCase());
      found.length > 0 ? renderLisensiList(found) : renderNotFound('email', val);
    }
  }, 500);
}

/* ── CEK PESANAN ────────────────────────────────────────── */
function cekPesanan() {
  const val = document.getElementById('inputOrderNum').value.trim();
  if (!val) { showToast('Masukkan nomor pesanan terlebih dahulu'); return; }

  showLoading();

  setTimeout(() => {
    if (DEMO_MODE) {
      const found = MOCK_ORDERS.find(o => o.orderNumber.toUpperCase() === val.toUpperCase());
      found ? renderPesananResult(found) : renderNotFound('order', val);
    }

    // Also check localStorage for user's own order
    const saved = localStorage.getItem('sn_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.orderNumber && parsed.orderNumber.toUpperCase() === val.toUpperCase()) {
          // Already handled or render a basic status
        }
      } catch(e) {}
    }
  }, 500);
}

/* ── RENDER LISENSI LIST (multiple results for email search) */
function renderLisensiList(licenses) {
  if (licenses.length === 1) {
    renderLisensiResult(licenses[0]);
    return;
  }
  const html = `
    <div class="cl-card">
      <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--accent);margin-bottom:1rem;">
        <i class="fas fa-list"></i> ${licenses.length} Lisensi Ditemukan
      </div>
      ${licenses.map(l => `
        <div style="border:1px solid var(--gray-200);border-radius:var(--radius-md);padding:1rem;margin-bottom:0.75rem;cursor:pointer;transition:all 0.2s;"
          onclick="renderLisensiResult(MOCK_LICENSES.find(x=>x.id==='${l.id}'))"
          onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--gray-200)'">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
            <div>
              <div style="font-weight:700;font-size:0.9rem;color:var(--near-black);">${l.product} — ${l.paket}</div>
              <div style="font-family:monospace;font-size:0.78rem;color:var(--gray-600);margin-top:0.2rem;">${l.keyMasked}</div>
            </div>
            <span class="badge ${l.status === 'active' ? 'badge-active' : 'badge-inactive'}">
              <i class="fas ${l.status === 'active' ? 'fa-check-circle' : 'fa-times-circle'}"></i>
              ${l.status === 'active' ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  showResult(html);
}

/* ── RENDER LISENSI RESULT ──────────────────────────────── */
function renderLisensiResult(license) {
  if (!license) { renderNotFound('generic', ''); return; }
  _keyVisible = false;

  const isActive = license.status === 'active';
  const platformIcons = { android: 'fa-android', windows: 'fa-windows', web: 'fa-globe' };
  const platformLabels = { android: 'Android', windows: 'Windows', web: 'Web' };
  const platformColors = { android: 'android', windows: 'windows', web: 'web' };

  const devicesHtml = license.devices.length > 0
    ? license.devices.map(d => `
        <div class="device-item">
          <div class="device-icon ${platformColors[d.platform] || 'web'}">
            <i class="fab ${platformIcons[d.platform] || 'fa-globe'}"></i>
          </div>
          <div class="device-info">
            <div class="device-name">${d.name}</div>
            <div class="device-meta">
              <span class="badge badge-platform">${platformLabels[d.platform] || d.platform}</span>
              &nbsp;Terakhir aktif: ${d.lastSeen}
            </div>
          </div>
        </div>
      `).join('')
    : '<div style="font-size:0.85rem;color:var(--gray-600);padding:0.75rem 0;">Belum ada device yang terdaftar.</div>';

  const activationSteps = ACTIVATION_STEPS[license.activationSteps] || ACTIVATION_STEPS.suruhkelola;
  const activationHtml = activationSteps.map((s,i) => `<li>${s}</li>`).join('');

  const html = `
    <div class="cl-card">
      <div class="license-header">
        <div class="license-product">
          <i class="fas ${license.product === 'SuruhKelola' ? 'fa-cash-register' : 'fa-shirt'}"
            style="color:${license.product === 'SuruhKelola' ? 'var(--accent)' : '#8b5cf6'};margin-right:0.4rem;"></i>
          ${license.product}
        </div>
        <span class="badge ${isActive ? 'badge-active' : 'badge-inactive'}">
          <i class="fas ${isActive ? 'fa-check-circle' : 'fa-times-circle'}"></i>
          ${isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>

      <!-- License Key -->
      <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-600);margin-bottom:0.5rem;">License Key</div>
      <div class="license-key-row">
        <span class="license-key-val" id="licKeyDisplay">${license.keyMasked}</span>
        <button class="btn-icon" onclick="toggleLicenseKey(this, '${license.key}', '${license.keyMasked}')" id="btnShowKey">
          <i class="fas fa-eye"></i> Tampilkan
        </button>
        <button class="btn-icon" onclick="copyToClipboard('${license.key}')">
          <i class="fas fa-copy"></i> Salin
        </button>
      </div>

      <!-- Info Table -->
      <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--gray-600);margin-bottom:0.75rem;">Detail Lisensi</div>
      <table class="info-table">
        <tr><td>Pemilik</td><td>${license.owner}</td></tr>
        <tr><td>Email</td><td>${license.email}</td></tr>
        <tr><td>Paket</td><td>${license.paket}</td></tr>
        <tr><td>Maks. Device</td><td>${license.maxDevice} device</td></tr>
        <tr><td>Masa Aktif</td><td>${license.validUntil} <i class="fas fa-infinity" style="color:var(--accent);"></i></td></tr>
        <tr><td>Tanggal Beli</td><td>${formatDate(license.purchaseDate)}</td></tr>
      </table>

      <!-- Devices -->
      <div class="section-sub-title">
        <i class="fas fa-mobile-screen-button" style="color:var(--accent);"></i>
        Device Terdaftar (${license.devices.length}/${license.maxDevice})
      </div>
      <div class="device-list">${devicesHtml}</div>

      <!-- Activation Steps -->
      <button class="activation-toggle" id="activationBtn" onclick="toggleActivation()">
        <span><i class="fas fa-circle-question" style="color:var(--accent);margin-right:0.4rem;"></i> Cara Aktivasi Lisensi</span>
        <i class="fas fa-chevron-down toggle-icon"></i>
      </button>
      <div class="activation-body" id="activationBody">
        <p>Ikuti langkah berikut untuk mengaktifkan lisensi kamu:</p>
        <ol>${activationHtml}</ol>
      </div>

      <!-- WA Button -->
      <div style="margin-top:1.25rem;">
        <a href="https://wa.me/62881080608167?text=Halo%20SuruhNgoding%2C%20saya%20butuh%20bantuan%20soal%20lisensi%20${encodeURIComponent(license.key)}" target="_blank"
          class="btn-full btn-accent" style="text-decoration:none;">
          <i class="fab fa-whatsapp"></i> Butuh Bantuan? Chat WhatsApp
        </a>
      </div>
    </div>
  `;

  showResult(html);
}

/* ── RENDER PESANAN RESULT ──────────────────────────────── */
function renderPesananResult(order) {
  if (!order) { renderNotFound('order', ''); return; }

  const statusInfo = ORDER_STATUS_INFO[order.status] || ORDER_STATUS_INFO.pending_bukti;
  const steps = ['Menunggu\nBukti', 'Menunggu\nKonfirmasi', 'Terkonfirmasi', 'Selesai'];

  const statusBadgeColor = {
    pending_bukti: '#f59e0b',
    pending_konfirmasi: '#3b82f6',
    confirmed: '#10b981',
    rejected: '#ef4444',
  }[order.status] || '#6b7280';

  const statusBg = {
    pending_bukti: 'rgba(245,158,11,0.1)',
    pending_konfirmasi: 'rgba(59,130,246,0.1)',
    confirmed: 'rgba(16,185,129,0.1)',
    rejected: 'rgba(239,68,68,0.1)',
  }[order.status] || 'var(--gray-100)';

  // Determine which steps are done / active
  const stepMap = { pending_bukti: 0, pending_konfirmasi: 1, confirmed: 2, rejected: 3 };
  const currentStep = stepMap[order.status] ?? 0;

  const stepLabels = ['Menunggu Bukti', 'Menunggu Konfirmasi', 'Terkonfirmasi', 'Selesai'];
  const stepsHtml = stepLabels.map((label, i) => {
    let cls = '';
    if (i < currentStep) cls = 'done';
    else if (i === currentStep && order.status !== 'rejected') cls = 'active';
    else if (order.status === 'rejected' && i === currentStep) cls = 'active';

    const icon = i < currentStep
      ? '<i class="fas fa-check" style="font-size:0.65rem;"></i>'
      : (i + 1).toString();

    return `
      <div class="prog-step ${cls}">
        <div class="prog-circle">${icon}</div>
        <div class="prog-label">${label}</div>
      </div>
    `;
  }).join('');

  const html = `
    <div class="cl-card">
      <div class="order-status-header">
        <div>
          <div class="order-status-label">Nomor Pesanan</div>
          <div class="order-status-num">${order.orderNumber}</div>
        </div>
        <span style="display:inline-flex;align-items:center;gap:0.4rem;padding:0.35rem 0.85rem;border-radius:100px;font-size:0.73rem;font-weight:700;background:${statusBg};color:${statusBadgeColor};">
          ${statusInfo.label}
        </span>
      </div>

      <table class="info-table" style="margin-bottom:1rem;">
        <tr><td>Produk</td><td>${order.produk} — ${order.paket}</td></tr>
        <tr><td>Nama</td><td>${order.nama}</td></tr>
        <tr><td>Email</td><td>${order.email}</td></tr>
        <tr><td>Nominal</td><td style="color:var(--accent);">Rp ${order.amount.toLocaleString('id-ID')}</td></tr>
        <tr><td>Dibuat</td><td>${order.createdAt}</td></tr>
        <tr><td>Diperbarui</td><td>${order.updatedAt}</td></tr>
      </table>

      <!-- Progress Bar -->
      <div class="status-progress">
        <div class="progress-steps">
          ${stepsHtml}
        </div>
      </div>

      <div class="status-detail">
        <i class="fas fa-circle-info"></i>
        <span>${statusInfo.desc}</span>
      </div>

      ${order.status === 'confirmed' ? `
        <div style="margin-top:1.25rem;background:#d1fae5;border:1px solid #6ee7b7;border-radius:var(--radius-md);padding:1rem;font-size:0.85rem;color:#065f46;display:flex;gap:0.5rem;align-items:flex-start;">
          <i class="fas fa-check-circle" style="color:#059669;flex-shrink:0;margin-top:0.1rem;"></i>
          <span>License key telah dikirim ke email <strong>${order.email}</strong>. Cek inbox atau folder spam.</span>
        </div>
      ` : ''}

      <div style="margin-top:1.25rem;">
        <a href="https://wa.me/62881080608167?text=Halo%20SuruhNgoding%2C%20saya%20mau%20cek%20status%20pesanan%20${encodeURIComponent(order.orderNumber)}" target="_blank"
          class="btn-full btn-accent" style="text-decoration:none;">
          <i class="fab fa-whatsapp"></i> Tanya Status via WhatsApp
        </a>
      </div>
    </div>
  `;

  showResult(html);
}

/* ── RENDER NOT FOUND ───────────────────────────────────── */
function renderNotFound(type, query) {
  const messages = {
    license_key: `License key <strong>${escapeHtml(query)}</strong> tidak ditemukan.`,
    email: `Tidak ada lisensi terdaftar untuk email <strong>${escapeHtml(query)}</strong>.`,
    order: `Nomor pesanan <strong>${escapeHtml(query)}</strong> tidak ditemukan.`,
    generic: 'Data tidak ditemukan.',
  };

  const html = `
    <div class="cl-card">
      <div class="not-found-box">
        <span class="not-found-icon">🔍</span>
        <div class="not-found-title">Tidak Ditemukan</div>
        <p class="not-found-sub">
          ${messages[type] || messages.generic}<br><br>
          Periksa kembali data yang kamu masukkan. Pastikan tidak ada spasi atau karakter tambahan.
        </p>
        <a href="https://wa.me/62881080608167?text=Halo%20SuruhNgoding%2C%20saya%20butuh%20bantuan%20cek%20lisensi%20saya" target="_blank"
          class="btn-full btn-accent" style="max-width:280px;margin:1.5rem auto 0;text-decoration:none;">
          <i class="fab fa-whatsapp"></i> Minta Bantuan via WhatsApp
        </a>
      </div>
    </div>
  `;
  showResult(html);
}

/* ── TOGGLE LICENSE KEY VISIBILITY ─────────────────────── */
function toggleLicenseKey(btn, fullKey, maskedKey) {
  _keyVisible = !_keyVisible;
  const display = document.getElementById('licKeyDisplay');
  if (!display) return;

  if (_keyVisible) {
    display.textContent = fullKey;
    btn.innerHTML = '<i class="fas fa-eye-slash"></i> Sembunyikan';
  } else {
    display.textContent = maskedKey;
    btn.innerHTML = '<i class="fas fa-eye"></i> Tampilkan';
  }
}

/* ── TOGGLE ACTIVATION ACCORDION ───────────────────────── */
function toggleActivation() {
  const btn  = document.getElementById('activationBtn');
  const body = document.getElementById('activationBody');
  if (!btn || !body) return;
  btn.classList.toggle('open');
  body.classList.toggle('open');
}

/* ── SHOW / HIDE RESULT ─────────────────────────────────── */
function showResult(html) {
  const area = document.getElementById('resultArea');
  if (!area) return;
  area.innerHTML = html;
  area.classList.add('show');
  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideResult() {
  const area = document.getElementById('resultArea');
  if (area) {
    area.classList.remove('show');
    area.innerHTML = '';
  }
}

function showLoading() {
  const area = document.getElementById('resultArea');
  if (!area) return;
  area.innerHTML = `
    <div class="cl-card">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <span>Mencari data…</span>
      </div>
    </div>
  `;
  area.classList.add('show');
}

/* showToast, copyToClipboard, escapeHtml, formatDate dari shared.js */

/* ── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  // Pre-fill from URL params
  const params = new URLSearchParams(window.location.search);
  const key    = params.get('key');
  const email  = params.get('email');
  const order  = params.get('order');

  if (key) {
    switchTab('key');
    document.getElementById('inputLicenseKey').value = key;
    cekByLicenseKey();
  } else if (email) {
    switchTab('email');
    document.getElementById('inputEmailSearch').value = email;
    cekByEmail();
  } else if (order) {
    switchTab('order');
    document.getElementById('inputOrderNum').value = order;
    cekPesanan();
  }

  // Enter key support
  ['inputLicenseKey'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') cekByLicenseKey(); });
  });
  const emailEl = document.getElementById('inputEmailSearch');
  if (emailEl) emailEl.addEventListener('keydown', e => { if (e.key === 'Enter') cekByEmail(); });
  const orderEl = document.getElementById('inputOrderNum');
  if (orderEl) orderEl.addEventListener('keydown', e => { if (e.key === 'Enter') cekPesanan(); });
});
