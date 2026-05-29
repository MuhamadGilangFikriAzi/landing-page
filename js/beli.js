/* ─────────────────────────────────────────────────────────
   beli.js — Halaman Pembelian Lisensi
   SuruhNgoding — beli.html
   ───────────────────────────────────────────────────────── */

'use strict';

/* ── PRODUK & PAKET DATA ──────────────────────────────── */
const PRODUCTS = {
  suruhkelola: {
    label: 'SuruhKelola',
    paket: {
      starter: { label: 'Starter', harga: 299000, device: 1 },
      bisnis:  { label: 'Bisnis',  harga: 699000, device: 3 },
      pro:     { label: 'Pro',     harga: 1499000, device: 10 },
    }
  },
  suruhlaundry: {
    label: 'SuruhLaundry',
    paket: {
      starter: { label: 'Starter', harga: 249000, device: 1 },
      bisnis:  { label: 'Bisnis',  harga: 549000, device: 3 },
      pro:     { label: 'Pro',     harga: 1199000, device: 10 },
    }
  }
};

/* ── BANK ACCOUNTS ─────────────────────────────────────── */
const BANK_ACCOUNTS = [
  { bank: 'BCA',     nomor: '1234567890', atas: 'SuruhNgoding' },
  { bank: 'BRI',     nomor: '0987654321', atas: 'SuruhNgoding' },
  { bank: 'Mandiri', nomor: '1122334455', atas: 'SuruhNgoding' },
];

/* ── STATE ─────────────────────────────────────────────── */
let state = {
  step: 1,
  produk: '',
  paket: '',
  nama: '',
  email: '',
  wa: '',
  orderNumber: '',
  baseAmount: 0,
  uniqueCode: 0,
  totalAmount: 0,
  timerInterval: null,
  orderTimestamp: null,
};

/* ── INIT ──────────────────────────────────────────────── */
function initForm() {
  const params = new URLSearchParams(window.location.search);
  const produk = params.get('produk') || '';
  const paket  = params.get('paket')  || '';

  const selProduk = document.getElementById('selectProduk');
  if (selProduk && produk && PRODUCTS[produk]) {
    selProduk.value = produk;
    updatePaketOptions();
    const selPaket = document.getElementById('selectPaket');
    if (selPaket && paket && PRODUCTS[produk].paket[paket]) {
      selPaket.value = paket;
      updateOrderSummary();
    }
  }
}

/* ── UPDATE PAKET OPTIONS ──────────────────────────────── */
function updatePaketOptions() {
  const produkKey = document.getElementById('selectProduk').value;
  const selPaket  = document.getElementById('selectPaket');
  selPaket.innerHTML = '<option value="">-- Pilih Paket --</option>';

  if (!produkKey || !PRODUCTS[produkKey]) {
    updateOrderSummary();
    return;
  }

  const pakets = PRODUCTS[produkKey].paket;
  Object.entries(pakets).forEach(([key, p]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${p.label} — ${formatRp(p.harga)} (${p.device} device)`;
    selPaket.appendChild(opt);
  });

  updateOrderSummary();
}

/* ── UPDATE ORDER SUMMARY ──────────────────────────────── */
function updateOrderSummary() {
  const produkKey = document.getElementById('selectProduk').value;
  const paketKey  = document.getElementById('selectPaket').value;
  const container = document.getElementById('summaryContent');

  if (!produkKey || !paketKey || !PRODUCTS[produkKey] || !PRODUCTS[produkKey].paket[paketKey]) {
    container.innerHTML = '<div class="order-empty">Pilih produk dan paket untuk melihat ringkasan</div>';
    return;
  }

  const produk = PRODUCTS[produkKey];
  const paket  = produk.paket[paketKey];

  container.innerHTML = `
    <div class="order-summary-row">
      <span>Produk</span>
      <span style="font-weight:600;color:var(--near-black)">${produk.label}</span>
    </div>
    <div class="order-summary-row">
      <span>Paket</span>
      <span style="font-weight:600;color:var(--near-black)">${paket.label}</span>
    </div>
    <div class="order-summary-row">
      <span>Maks. Device</span>
      <span style="font-weight:600;color:var(--near-black)">${paket.device} device</span>
    </div>
    <div class="order-summary-row total">
      <span>Total Bayar</span>
      <span class="price">${formatRp(paket.harga)}</span>
    </div>
  `;
}

/* ── STEP 1 → STEP 2 ───────────────────────────────────── */
function goToStep2() {
  const nama     = document.getElementById('inputNama').value.trim();
  const email    = document.getElementById('inputEmail').value.trim();
  const wa       = document.getElementById('inputWa').value.trim();
  const produkKey = document.getElementById('selectProduk').value;
  const paketKey  = document.getElementById('selectPaket').value;

  if (!validateStep1(nama, email, produkKey, paketKey)) return;

  const produk = PRODUCTS[produkKey];
  const paket  = produk.paket[paketKey];

  // Generate order number: SN-YYYYMMDD-XXX
  const now = new Date();
  const ymd = now.getFullYear().toString() +
              String(now.getMonth() + 1).padStart(2, '0') +
              String(now.getDate()).padStart(2, '0');
  const rand3 = String(Math.floor(Math.random() * 900) + 100);
  const orderNumber = `SN-${ymd}-${rand3}`;

  // Unique code: 3-digit random, never starts with 0
  const uniqueCode = Math.floor(Math.random() * 900) + 100;
  const totalAmount = paket.harga + uniqueCode;

  // Persist to state
  state = {
    ...state,
    step: 2,
    produk: produkKey,
    paket: paketKey,
    nama, email, wa,
    orderNumber,
    baseAmount: paket.harga,
    uniqueCode,
    totalAmount,
    orderTimestamp: Date.now(),
  };

  // Save to localStorage
  localStorage.setItem('sn_order', JSON.stringify({
    orderNumber,
    timestamp: state.orderTimestamp,
    email,
    nama,
    produk: produkKey,
    paket: paketKey,
  }));

  // Populate Step 2
  document.getElementById('displayOrderNum').textContent = orderNumber;
  document.getElementById('displayNominal').textContent = formatRp(totalAmount);
  document.getElementById('displayNominalNote').textContent =
    `Harga (${formatRp(paket.harga)}) + kode unik (${uniqueCode})`;

  showStep(2);
  startTimer();
}

/* ── STEP 2 → STEP 3 ───────────────────────────────────── */
function goToStep3() {
  state.step = 3;
  document.getElementById('uploadNama').value      = state.nama;
  document.getElementById('uploadEmail').value     = state.email;
  document.getElementById('uploadOrderNum').value  = state.orderNumber;
  showStep(3);
}

/* ── UPLOAD HANDLING ───────────────────────────────────── */
function handleDrop(e) {
  e.preventDefault();
  const dropzone = document.getElementById('dropzone');
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowed.includes(file.type)) {
    showToast('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Ukuran file maksimal 5 MB.');
    return;
  }

  state.uploadedFile = file;
  const preview = document.getElementById('dropzonePreview');

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `
        <img src="${e.target.result}" alt="Preview bukti transfer">
        <div class="file-name"><i class="fas fa-check-circle" style="color:#10b981;"></i> ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)</div>
      `;
    };
    reader.readAsDataURL(file);
  } else {
    preview.innerHTML = `
      <div style="padding:1rem;background:var(--gray-100);border-radius:var(--radius-md);display:inline-flex;align-items:center;gap:0.5rem;">
        <i class="fas fa-file-pdf" style="font-size:2rem;color:#ef4444;"></i>
        <span style="font-size:0.82rem;color:var(--near-black);">${file.name}</span>
      </div>
      <div class="file-name"><i class="fas fa-check-circle" style="color:#10b981;"></i> File PDF terpilih (${(file.size/1024/1024).toFixed(2)} MB)</div>
    `;
  }
}

function handleUpload() {
  if (!state.uploadedFile) {
    showToast('Pilih file bukti transfer terlebih dahulu, atau gunakan tombol Demo di bawah.');
    return;
  }
  skipToStep4();
}

function skipToStep4() {
  state.step = 4;
  document.getElementById('successOrderNum').textContent  = state.orderNumber;
  document.getElementById('successEmail').textContent     = state.email;
  showStep(4);
}

/* ── SHOW STEP ─────────────────────────────────────────── */
function showStep(n) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`step${i}`);
    if (el) el.classList.toggle('active', i === n);
  }
  updateStepIndicator(n);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── STEP INDICATOR ────────────────────────────────────── */
function updateStepIndicator(current) {
  for (let i = 1; i <= 4; i++) {
    const dot   = document.getElementById(`sdot${i}`);
    const circ  = document.getElementById(`scirc${i}`);
    if (!dot || !circ) continue;

    dot.classList.remove('active', 'done');
    circ.innerHTML = i;

    if (i < current) {
      dot.classList.add('done');
      circ.innerHTML = '<i class="fas fa-check" style="font-size:0.75rem;"></i>';
    } else if (i === current) {
      dot.classList.add('active');
    }
  }
  // Lines
  for (let i = 1; i <= 3; i++) {
    const line = document.getElementById(`sline${i}`);
    if (line) line.classList.toggle('done', i < current);
  }
}

/* ── TIMER COUNTDOWN (24h) ─────────────────────────────── */
function startTimer() {
  const saved = localStorage.getItem('sn_order');
  let startTime = Date.now();
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.timestamp) startTime = parsed.timestamp;
    } catch(e) {}
  }

  const DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms

  function tick() {
    const elapsed   = Date.now() - startTime;
    const remaining = Math.max(0, DURATION - elapsed);

    const hh = Math.floor(remaining / 3600000);
    const mm = Math.floor((remaining % 3600000) / 60000);
    const ss = Math.floor((remaining % 60000) / 1000);

    const display = document.getElementById('timerDisplay');
    if (display) {
      display.textContent = `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
      if (remaining <= 0) {
        display.textContent = '00:00:00';
        display.style.color = '#ef4444';
      }
    }
    if (remaining > 0) {
      state.timerInterval = setTimeout(tick, 1000);
    }
  }
  tick();
}

/* ── COPY NOMINAL ──────────────────────────────────────── */
function copyNominal() {
  copyToClipboard(String(state.totalAmount));
}

/* ── COPY TO CLIPBOARD ─────────────────────────────────── */
function copyToClipboard(text, btn) {
  if (!text || text === '—') return;
  navigator.clipboard.writeText(text)
    .then(() => {
      showToast('Disalin!');
      if (btn) {
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
    })
    .catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Disalin!');
    });
}

/* ── TOAST ─────────────────────────────────────────────── */
let _toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ── VALIDATION ────────────────────────────────────────── */
function validateStep1(nama, email, produkKey, paketKey) {
  let ok = true;

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const markField = (id, valid, msgId, msg) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(msgId);
    if (el) el.classList.toggle('error-border', !valid);
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = valid ? 'none' : 'block';
    }
    if (!valid) ok = false;
  };

  markField('inputNama', nama.length > 0, null, '');
  markField('inputEmail', emailRx.test(email), null, '');
  markField('selectProduk', !!produkKey, null, '');
  markField('selectPaket', !!paketKey, null, '');

  if (!nama) {
    highlightError('inputNama');
    showToast('Nama tidak boleh kosong');
    return false;
  }
  if (!emailRx.test(email)) {
    highlightError('inputEmail');
    showToast('Format email tidak valid');
    return false;
  }
  if (!produkKey) {
    highlightError('selectProduk');
    showToast('Pilih produk terlebih dahulu');
    return false;
  }
  if (!paketKey) {
    highlightError('selectPaket');
    showToast('Pilih paket terlebih dahulu');
    return false;
  }

  return ok;
}

function highlightError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#ef4444';
  el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)';
  el.focus();
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  }, 2500);
}

/* ── FORMAT RUPIAH ─────────────────────────────────────── */
function formatRp(num) {
  return 'Rp ' + num.toLocaleString('id-ID');
}

/* ── DOMContentLoaded ──────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  initForm();

  // Drag highlight on dropzone
  const dz = document.getElementById('dropzone');
  if (dz) {
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('dragover'); handleDrop(e); });
  }
});
