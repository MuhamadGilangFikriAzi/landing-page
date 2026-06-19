const API = window.location.origin + '/api/admin';
let TOKEN = localStorage.getItem('admin_token') || null;

function apiHeaders() {
  const h = { 'Content-Type': 'application/json' };
  if (TOKEN) h['Authorization'] = 'Bearer ' + TOKEN;
  return h;
}

async function apiPost(path, body) {
  const r = await fetch(API + path, { method: 'POST', headers: apiHeaders(), body: JSON.stringify(body) });
  return r.json();
}
async function apiGet(path) {
  const r = await fetch(API + path, { method: 'GET', headers: apiHeaders() });
  return r.json();
}
async function apiPut(path, body) {
  const r = await fetch(API + path, { method: 'PUT', headers: apiHeaders(), body: JSON.stringify(body) });
  return r.json();
}

let state = { currentView: 'dashboard', licenses: [], orders: [], currentLicense: null, modalAction: null, currentOrderTab: 'all' };

document.addEventListener('DOMContentLoaded', () => {
  if (TOKEN) { showApp('Admin'); } else { showLogin(); }
});

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}
function showApp(email) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('sidebar-user-name').textContent = email;
  document.getElementById('sidebar-user-role').textContent = 'Administrator';
  loadData();
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login-submit');
  btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
  document.getElementById('login-error').style.display = 'none';
  try {
    const res = await apiPost('/login', { email, password });
    if (res.success) {
      TOKEN = res.token;
      localStorage.setItem('admin_token', TOKEN);
      showApp(res.user.email);
    } else {
      document.getElementById('login-error-msg').textContent = res.message || 'Login gagal';
      document.getElementById('login-error').style.display = 'flex';
    }
  } catch(e) {
    document.getElementById('login-error-msg').textContent = 'Server error';
    document.getElementById('login-error').style.display = 'flex';
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk sebagai Admin';
}

async function handleLogout() {
  TOKEN = null;
  localStorage.removeItem('admin_token');
  showLogin();
  showToast('Berhasil keluar.', 'info');
}

async function loadData() {
  try {
    const res = await apiGet('/licenses');
    if (res.licenses) {
      state.licenses = res.licenses.map(l => ({
        id: l.id,
        license_key: l.license_key,
        product: l.app === 'suruhkelola' ? 'SuruhKelola' : 'SuruhLaundry',
        package: l.package.charAt(0).toUpperCase() + l.package.slice(1),
        owner_name: l.customer_name,
        owner_email: l.customer_email,
        status: l.status,
        max_devices: l.max_devices,
        created_at: l.created_at,
        notes: '',
        devices: l.activated_devices.map((d, i) => ({ id: 'd' + i, name: d, platform: 'Android', last_seen: l.created_at }))
      }));
      renderAll();
    }
  } catch(e) {
    showToast('Gagal load data: ' + e.message, 'error');
  }
}

function renderAll() {
  loadDashboard();
  renderLisensiTable();
  updateDashboardDate();
}

// Navigasi
function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const t = document.getElementById('view-' + view);
  if (t) t.classList.add('active');
  const n = document.getElementById('nav-' + view);
  if (n) n.classList.add('active');
  state.currentView = view;
  closeSidebarMobile();
}
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function closeSidebarMobile() {
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
  }
}

function loadDashboard() {
  const lics = state.licenses;
  const aktif = lics.filter(l => l.status === 'active').length;
  document.getElementById('stat-lisensi-aktif').textContent = aktif;
  document.getElementById('stat-lisensi-trend').textContent = `dari ${lics.length} total lisensi`;
  document.getElementById('stat-pending').textContent = 0;
  document.getElementById('stat-pesanan-bulan').textContent = 0;
  document.getElementById('stat-pendapatan').textContent = formatRupiah(0);

  const sorted = [...lics].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5);
  document.getElementById('dashboard-lisensi-tbody').innerHTML = sorted.map(l => `
    <tr>
      <td class="td-mono">${l.license_key}</td>
      <td><div style="font-weight:600;font-size:.875rem">${esc(l.owner_name)}</div><div class="text-muted text-sm">${esc(l.owner_email)}</div></td>
      <td>${l.product}</td><td>${l.package}</td>
      <td>${statusBadge(l.status)}</td>
      <td class="text-muted text-sm">${formatDate(l.created_at)}</td>
    </tr>`).join('');
}

function updateDashboardDate() {
  document.getElementById('dashboard-date').textContent = new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

// Cek Lisensi
async function cekLisensi() {
  const input = document.getElementById('cek-input').value.trim().toUpperCase();
  const card = document.getElementById('license-result-card');
  const nf = document.getElementById('license-not-found');
  card.classList.remove('visible'); nf.classList.remove('visible');
  if (!input) return showToast('Masukkan license key.', 'error');
  const lic = state.licenses.find(l => l.license_key === input);
  if (!lic) { nf.classList.add('visible'); return; }
  state.currentLicense = lic;
  renderLicenseResult(lic);
  card.classList.add('visible');
}
function renderLicenseResult(l) {
  document.getElementById('result-key').textContent = l.license_key;
  document.getElementById('result-status-badge').innerHTML = statusBadge(l.status, 'large');
  document.getElementById('result-nama').textContent = l.owner_name;
  document.getElementById('result-email').textContent = l.owner_email;
  document.getElementById('result-produk').textContent = l.product;
  document.getElementById('result-paket').textContent = l.package;
  document.getElementById('result-maks-device').textContent = l.max_devices >= 99 ? 'Unlimited' : l.max_devices;
  document.getElementById('result-device-count').textContent = l.devices.length + ' device';
  document.getElementById('result-tanggal').textContent = formatDate(l.created_at);
  document.getElementById('result-catatan').textContent = l.notes || '—';
  const tb = document.getElementById('btn-toggle-lisensi');
  if (l.status === 'active') {
    tb.innerHTML = '<i class="fa-solid fa-ban"></i> Nonaktifkan Lisensi'; tb.className = 'btn-action warning';
  } else {
    tb.innerHTML = '<i class="fa-solid fa-circle-check"></i> Aktifkan Lisensi'; tb.className = 'btn-action accent';
  }
}
function toggleLisensiStatus() {
  const l = state.currentLicense;
  if (!l) return;
  const ns = l.status === 'active' ? 'inactive' : 'active';
  openModal(l.status === 'active' ? 'Nonaktifkan Lisensi' : 'Aktifkan Lisensi',
    `Yakin ${l.status === 'active' ? 'menonaktifkan' : 'mengaktifkan'} lisensi ${l.license_key}?`,
    async () => {
      await apiPut('/licenses/' + l.license_key, { status: ns });
      l.status = ns; renderLicenseResult(l); renderLisensiTable(); loadDashboard();
      showToast(`Lisensi ${ns === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
    });
}

// Daftar Lisensi
function renderLisensiTable() {
  const s = (document.getElementById('lisensi-search')?.value || '').toLowerCase();
  const pf = document.getElementById('filter-produk')?.value || '';
  const sf = document.getElementById('filter-status-lisensi')?.value || '';
  let f = state.licenses.filter(l =>
    (!s || l.license_key.toLowerCase().includes(s) || l.owner_name.toLowerCase().includes(s) || l.owner_email.toLowerCase().includes(s)) &&
    (!pf || l.product === pf) && (!sf || l.status === sf));
  const empty = document.getElementById('lisensi-empty');
  if (!f.length) { document.getElementById('lisensi-tbody').innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  document.getElementById('lisensi-tbody').innerHTML = f.map(l => `
    <tr>
      <td class="td-mono">${l.license_key}</td>
      <td><div style="font-weight:600;font-size:.875rem">${esc(l.owner_name)}</div><div class="text-muted text-sm">${esc(l.owner_email)}</div></td>
      <td>${l.product}</td><td>${l.package}</td>
      <td><span style="font-weight:600">${l.devices.length}</span><span class="text-muted"> / ${l.max_devices >= 99 ? '∞' : l.max_devices}</span></td>
      <td>${statusBadge(l.status)}</td>
      <td class="text-muted text-sm">${formatDate(l.created_at)}</td>
      <td><div class="actions-cell">
        <button class="btn-action ghost" onclick="cekLisensiFromTable('${l.license_key}')"><i class="fa-solid fa-magnifying-glass"></i> Detail</button>
        <button class="btn-action ${l.status === 'active' ? 'warning' : 'accent'}" onclick="toggleLisensiById('${l.license_key}')">
          <i class="fa-solid fa-${l.status === 'active' ? 'ban' : 'circle-check'}"></i> ${l.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </div></td>
    </tr>`).join('');
}
function filterLisensi() { renderLisensiTable(); }
function cekLisensiFromTable(k) { navigate('cek-lisensi'); document.getElementById('cek-input').value = k; setTimeout(cekLisensi, 100); }
async function toggleLisensiById(k) {
  const l = state.licenses.find(x => x.license_key === k);
  if (!l) return;
  const ns = l.status === 'active' ? 'inactive' : 'active';
  openModal(l.status === 'active' ? 'Nonaktifkan Lisensi' : 'Aktifkan Lisensi', `Yakin?`,
    async () => {
      await apiPut('/licenses/' + k, { status: ns });
      l.status = ns; renderLisensiTable(); loadDashboard();
      showToast(`Lisensi ${ns === 'active' ? 'diaktifkan' : 'dinonaktifkan'}.`, 'success');
    });
}

// Buat Lisensi
function generateLicense(e) {
  e.preventDefault();
  const app = document.getElementById('cl-produk').value;
  const pkg = document.getElementById('cl-paket').value;
  const name = document.getElementById('cl-nama').value.trim();
  const email = document.getElementById('cl-email').value.trim();
  if (!app || !pkg || !name || !email) return showToast('Lengkapi semua field.', 'error');

  const appKey = app === 'SuruhKelola' ? 'suruhkelola' : 'suruhlaundry';
  const pkgKey = pkg.toLowerCase();

  apiPost('/licenses', { app: appKey, pkg: pkgKey, customer_name: name, customer_email: email }).then(res => {
    if (res.success) {
      document.getElementById('generated-key-text').textContent = res.license.license_key;
      document.getElementById('generated-key-box').style.display = 'flex';
      document.getElementById('generated-key-box').classList.add('visible');
      showToast('Lisensi berhasil dibuat!', 'success');
      loadData();
    } else {
      showToast(res.message || 'Gagal', 'error');
    }
  });
}
function copyGeneratedKey() {
  const k = document.getElementById('generated-key-text').textContent;
  navigator.clipboard.writeText(k).then(() => {
    const b = document.getElementById('btn-copy-key');
    b.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
    setTimeout(() => { b.innerHTML = '<i class="fa-solid fa-copy"></i> Salin'; }, 2000);
  });
}

function openModal(t, s, onConfirm, type = 'primary') {
  document.getElementById('modal-title').textContent = t;
  document.getElementById('modal-sub').innerHTML = s;
  const cb = document.getElementById('modal-confirm-btn');
  cb.className = 'btn-action ' + type;
  cb.textContent = type === 'danger' ? 'Ya, Lanjutkan' : 'Konfirmasi';
  state.modalAction = onConfirm;
  document.getElementById('confirm-modal').classList.add('open');
}
async function executeModalAction() {
  if (typeof state.modalAction === 'function') { const r = await state.modalAction(); if (r === false) return; }
  closeModal();
}
function closeModal() { document.getElementById('confirm-modal').classList.remove('open'); state.modalAction = null; }
document.getElementById('confirm-modal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });

function showToast(msg, type = 'info') {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${esc(msg)}</span>`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300); }, 3500);
}

function statusBadge(s, sz = '') {
  const m = { active: 'badge-active|Aktif', inactive: 'badge-inactive|Nonaktif', pending: 'badge-pending|Pending' };
  const [cls, lbl] = (m[s] || 'badge-pending|' + s).split('|');
  const st = sz === 'large' ? 'font-size:.8rem;padding:.35rem .875rem' : '';
  return `<span class="badge ${cls}" style="${st}">${lbl}</span>`;
}
function formatRupiah(a) { return 'Rp ' + (a || 0).toLocaleString('id-ID'); }
function formatDate(iso) { return iso ? new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) : '—'; }
function esc(s) { if (typeof s !== 'string') return s || ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
