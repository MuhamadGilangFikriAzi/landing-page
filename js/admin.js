/* ═══════════════════════════════════════════════════════════
   SURUHNGODING — ADMIN PANEL JS
   admin.js — semua logika, data mock, dan Supabase integration
   ═══════════════════════════════════════════════════════════ */

/* ─── KONFIGURASI SUPABASE ────────────────────────────────── */
const SUPABASE_URL      = '';  // isi dengan URL Supabase kamu
const SUPABASE_ANON_KEY = '';  // isi dengan anon key kamu

/* ─── MODE DETEKSI ────────────────────────────────────────── */
const IS_SUPABASE_CONFIGURED = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';

let supabaseClient = null;
if (IS_SUPABASE_CONFIGURED && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/* ═══════════════════════════════════════════════════════════
   DATA MOCK
   ═══════════════════════════════════════════════════════════ */

const MOCK_LICENSES = [
  {
    id: 'lic-001',
    license_key: 'SK-A1B2-C3D4-E5F6-G7H8',
    product: 'SuruhKelola',
    package: 'Bisnis',
    owner_name: 'Budi Santoso',
    owner_email: 'budi@tokobudi.com',
    status: 'active',
    max_devices: 3,
    created_at: '2025-10-15T08:30:00Z',
    notes: 'Pembelian reguler via WhatsApp',
    devices: [
      { id: 'd1', name: 'Laptop Kantor', platform: 'Windows 11', last_seen: '2026-05-28T14:22:00Z' },
      { id: 'd2', name: 'PC Kasir',      platform: 'Windows 10', last_seen: '2026-05-29T09:10:00Z' },
    ]
  },
  {
    id: 'lic-002',
    license_key: 'SK-X9Y8-Z7W6-V5U4-T3S2',
    product: 'SuruhKelola',
    package: 'Pro',
    owner_name: 'Dewi Rahayu',
    owner_email: 'dewi@restoranmaju.id',
    status: 'active',
    max_devices: 99,
    created_at: '2025-11-02T10:00:00Z',
    notes: '',
    devices: [
      { id: 'd3', name: 'iPhone 14 Pro',  platform: 'iOS 17',     last_seen: '2026-05-29T07:05:00Z' },
      { id: 'd4', name: 'iPad Air',        platform: 'iPadOS 17',  last_seen: '2026-05-27T18:30:00Z' },
      { id: 'd5', name: 'MacBook Air M2',  platform: 'macOS 14',   last_seen: '2026-05-29T06:45:00Z' },
    ]
  },
  {
    id: 'lic-003',
    license_key: 'SLNDRY-K3L4-M5N6-O7P8-Q9R0',
    product: 'SuruhLaundry',
    package: 'Starter',
    owner_name: 'Ahmad Fauzi',
    owner_email: 'ahmad.laundry@gmail.com',
    status: 'active',
    max_devices: 1,
    created_at: '2025-12-20T14:15:00Z',
    notes: 'Langganan laundry kiloan',
    devices: [
      { id: 'd6', name: 'Tablet Kasir', platform: 'Android 13', last_seen: '2026-05-28T20:00:00Z' },
    ]
  },
  {
    id: 'lic-004',
    license_key: 'SLNDRY-A1S2-D3F4-G5H6-J7K8',
    product: 'SuruhLaundry',
    package: 'Bisnis',
    owner_name: 'Siti Nurhaliza',
    owner_email: 'siti@laundrybersih.com',
    status: 'inactive',
    max_devices: 3,
    created_at: '2025-09-05T09:00:00Z',
    notes: 'Dinonaktifkan atas permintaan pelanggan',
    devices: []
  },
  {
    id: 'lic-005',
    license_key: 'SK-P1Q2-R3S4-T5U6-V7W8',
    product: 'SuruhKelola',
    package: 'Starter',
    owner_name: 'Rizki Pratama',
    owner_email: 'rizki@warungrizki.com',
    status: 'active',
    max_devices: 1,
    created_at: '2026-01-10T11:45:00Z',
    notes: '',
    devices: [
      { id: 'd7', name: 'HP Xiaomi Redmi', platform: 'Android 12', last_seen: '2026-05-29T08:55:00Z' },
    ]
  },
];

const MOCK_ORDERS = [
  {
    id: 'ord-001',
    order_number: 'SN-20251015-001',
    buyer_name: 'Budi Santoso',
    buyer_email: 'budi@tokobudi.com',
    product: 'SuruhKelola',
    package: 'Bisnis',
    amount: 499000,
    status: 'confirmed',
    created_at: '2025-10-14T16:20:00Z',
    rejection_reason: null,
  },
  {
    id: 'ord-002',
    order_number: 'SN-20260528-002',
    buyer_name: 'Hendra Wijaya',
    buyer_email: 'hendra@gmail.com',
    product: 'SuruhLaundry',
    package: 'Starter',
    amount: 199000,
    status: 'uploaded',
    created_at: '2026-05-28T10:30:00Z',
    rejection_reason: null,
  },
  {
    id: 'ord-003',
    order_number: 'SN-20260529-003',
    buyer_name: 'Maya Sari',
    buyer_email: 'maya.sari@outlook.com',
    product: 'SuruhKelola',
    package: 'Pro',
    amount: 899000,
    status: 'pending',
    created_at: '2026-05-29T07:15:00Z',
    rejection_reason: null,
  },
  {
    id: 'ord-004',
    order_number: 'SN-20260527-004',
    buyer_name: 'Rudi Hermawan',
    buyer_email: 'rudi.h@tokoonline.id',
    product: 'SuruhLaundry',
    package: 'Bisnis',
    amount: 399000,
    status: 'rejected',
    created_at: '2026-05-27T14:50:00Z',
    rejection_reason: 'Bukti transfer tidak terbaca / tidak valid.',
  },
  {
    id: 'ord-005',
    order_number: 'SN-20260526-005',
    buyer_name: 'Fitri Handayani',
    buyer_email: 'fitri@cafehandayani.com',
    product: 'SuruhKelola',
    package: 'Starter',
    amount: 249000,
    status: 'confirmed',
    created_at: '2026-05-26T09:00:00Z',
    rejection_reason: null,
  },
];

/* ─── Harga Paket (harus sama dengan shared.js PRODUCTS) ── */
const PACKAGE_PRICE = {
  'SuruhKelola':  { Starter: 299000, Bisnis: 699000,  Pro: 1499000 },
  'SuruhLaundry': { Starter: 249000, Bisnis: 549000,  Pro: 1199000 },
};

const PACKAGE_MAX_DEVICES = { Starter: 1, Bisnis: 3, Pro: 99 };

/* ═══════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════ */
let state = {
  currentView: 'dashboard',
  licenses: [...MOCK_LICENSES],
  orders: [...MOCK_ORDERS],
  currentLicense: null,       // lisensi yang sedang di-cek
  modalAction: null,          // fungsi yang akan dijalankan saat modal dikonfirmasi
  currentOrderTab: 'all',
  isDemoMode: !IS_SUPABASE_CONFIGURED,
};

/* ═══════════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  checkAuthState();
  updateDashboardDate();
});

/* ─── Auth State Check ─────────────────────────────────── */
async function checkAuthState() {
  if (IS_SUPABASE_CONFIGURED && supabaseClient) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      showApp(session.user.email);
    } else {
      showLogin();
    }
  } else {
    // Mode demo: cek localStorage
    const demoAuth = localStorage.getItem('admin_demo_auth');
    if (demoAuth) {
      try {
        const parsed = JSON.parse(demoAuth);
        if (parsed.email) {
          showApp(parsed.email, true);
          return;
        }
      } catch(_) {}
    }
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
}

function showApp(email, isDemo = false) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  // Update user info di sidebar
  document.getElementById('sidebar-user-name').textContent = email;
  document.getElementById('sidebar-user-role').textContent = isDemo ? 'Demo Admin' : 'Administrator';

  if (isDemo || !IS_SUPABASE_CONFIGURED) {
    document.getElementById('demo-banner').style.display = 'flex';
  }

  loadDashboard();
  renderLisensiTable();
  renderPesananTable();
  updatePesananTabCounts();
}

/* ═══════════════════════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════════════════════ */
async function handleLogin(event) {
  event.preventDefault();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('btn-login-submit');
  const errBox   = document.getElementById('login-error');

  btn.disabled   = true;
  btn.innerHTML  = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
  errBox.style.display = 'none';

  if (IS_SUPABASE_CONFIGURED && supabaseClient) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      showLoginError('Email atau password salah.');
    } else {
      showApp(data.user.email, false);
    }
  } else {
    // Mode demo
    await simulateDelay(600);
    if (email === 'admin@demo.com' && password === 'admin123') {
      localStorage.setItem('admin_demo_auth', JSON.stringify({ email }));
      showApp(email, true);
    } else {
      showLoginError('Kredensial salah. Gunakan admin@demo.com / admin123 untuk mode demo.');
    }
  }

  btn.disabled  = false;
  btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Masuk sebagai Admin';
}

function showLoginError(msg) {
  const errBox = document.getElementById('login-error');
  document.getElementById('login-error-msg').textContent = msg;
  errBox.style.display = 'flex';
  errBox.style.gap = '0.5rem';
  errBox.style.alignItems = 'center';
}

/* ─── Logout ───────────────────────────────────────────── */
async function handleLogout() {
  if (IS_SUPABASE_CONFIGURED && supabaseClient) {
    await supabaseClient.auth.signOut();
  } else {
    localStorage.removeItem('admin_demo_auth');
  }
  showLogin();
  showToast('Berhasil keluar.', 'info');
}

/* ═══════════════════════════════════════════════════════════
   NAVIGASI
   ═══════════════════════════════════════════════════════════ */
function navigate(view) {
  // Sembunyikan semua view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  // Nonaktifkan semua nav item
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Tampilkan view target
  const target = document.getElementById('view-' + view);
  if (target) target.classList.add('active');

  // Aktifkan nav item
  const navItem = document.getElementById('nav-' + view);
  if (navItem) navItem.classList.add('active');

  state.currentView = view;

  // Tutup sidebar di mobile
  closeSidebarMobile();
}

function toggleSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
}

function closeSidebarMobile() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  }
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function loadDashboard() {
  const licenses = state.licenses;
  const orders   = state.orders;

  // Stats
  const lisensiAktif   = licenses.filter(l => l.status === 'active').length;
  const pending        = orders.filter(o => o.status === 'pending' || o.status === 'uploaded').length;
  const thisMonthStr   = '2026-05';
  const pesananBulan   = orders.filter(o => o.created_at.startsWith(thisMonthStr) && o.status === 'confirmed').length;
  const pendapatan     = orders
    .filter(o => o.created_at.startsWith(thisMonthStr) && o.status === 'confirmed')
    .reduce((sum, o) => sum + o.amount, 0);

  document.getElementById('stat-lisensi-aktif').textContent = lisensiAktif;
  document.getElementById('stat-lisensi-trend').textContent = `dari ${licenses.length} total lisensi`;
  document.getElementById('stat-pending').textContent       = pending;
  document.getElementById('stat-pesanan-bulan').textContent = pesananBulan;
  document.getElementById('stat-pendapatan').textContent    = formatRupiah(pendapatan);

  // Tabel Pesanan Terbaru (5 teratas)
  const tbody5Orders = document.getElementById('dashboard-pesanan-tbody');
  const recentOrders = [...orders].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5);
  tbody5Orders.innerHTML = recentOrders.map(o => `
    <tr>
      <td class="td-mono">${o.order_number}</td>
      <td>
        <div style="font-weight:600;font-size:0.875rem;">${escapeHtml(o.buyer_name)}</div>
        <div class="text-muted text-sm">${escapeHtml(o.buyer_email)}</div>
      </td>
      <td><span class="badge ${productBadgeClass(o.product)}">${o.product}</span></td>
      <td style="font-weight:600;">${formatRupiah(o.amount)}</td>
      <td>${statusBadge(o.status)}</td>
      <td class="text-muted text-sm">${formatDate(o.created_at)}</td>
    </tr>
  `).join('');

  // Tabel Lisensi Terbaru (5 teratas)
  const tbody5Licenses = document.getElementById('dashboard-lisensi-tbody');
  const recentLicenses = [...licenses].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,5);
  tbody5Licenses.innerHTML = recentLicenses.map(l => `
    <tr>
      <td class="td-mono">${l.license_key}</td>
      <td>
        <div style="font-weight:600;font-size:0.875rem;">${escapeHtml(l.owner_name)}</div>
        <div class="text-muted text-sm">${escapeHtml(l.owner_email)}</div>
      </td>
      <td>${l.product}</td>
      <td>${l.package}</td>
      <td>${statusBadge(l.status)}</td>
      <td class="text-muted text-sm">${formatDate(l.created_at)}</td>
    </tr>
  `).join('');
}

function updateDashboardDate() {
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('dashboard-date').textContent = now.toLocaleDateString('id-ID', opts);
}

/* ═══════════════════════════════════════════════════════════
   CEK LISENSI
   ═══════════════════════════════════════════════════════════ */
async function cekLisensi() {
  const input     = document.getElementById('cek-input').value.trim().toUpperCase();
  const resultCard = document.getElementById('license-result-card');
  const notFound   = document.getElementById('license-not-found');

  resultCard.classList.remove('visible');
  notFound.classList.remove('visible');

  if (!input) {
    showToast('Masukkan license key terlebih dahulu.', 'error');
    return;
  }

  let license = null;
  if (IS_SUPABASE_CONFIGURED && supabaseClient) {
    const { data } = await supabaseClient
      .from('licenses')
      .select('*, devices(*)')
      .eq('license_key', input)
      .single();
    license = data;
  } else {
    license = state.licenses.find(l => l.license_key.toUpperCase() === input) || null;
  }

  if (!license) {
    notFound.classList.add('visible');
    return;
  }

  state.currentLicense = license;
  renderLicenseResult(license);
  resultCard.classList.add('visible');
}

function renderLicenseResult(license) {
  document.getElementById('result-key').textContent    = license.license_key;
  document.getElementById('result-status-badge').innerHTML = statusBadge(license.status, 'large');
  document.getElementById('result-nama').textContent   = license.owner_name;
  document.getElementById('result-email').textContent  = license.owner_email;
  document.getElementById('result-produk').textContent = license.product;
  document.getElementById('result-paket').textContent  = license.package;
  document.getElementById('result-maks-device').textContent =
    license.max_devices >= 99 ? 'Unlimited' : license.max_devices;
  document.getElementById('result-device-count').textContent =
    `${license.devices.length} device`;
  document.getElementById('result-tanggal').textContent = formatDate(license.created_at);
  document.getElementById('result-catatan').textContent = license.notes || '—';

  // Toggle button
  const toggleBtn = document.getElementById('btn-toggle-lisensi');
  if (license.status === 'active') {
    toggleBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Nonaktifkan Lisensi';
    toggleBtn.className = 'btn-action warning';
  } else {
    toggleBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Aktifkan Lisensi';
    toggleBtn.className = 'btn-action accent';
  }

  // Daftar device
  const deviceList = document.getElementById('result-devices');
  if (license.devices.length === 0) {
    deviceList.innerHTML = `<div class="empty-state" style="padding:1.5rem;"><i class="fa-solid fa-laptop"></i><p>Belum ada device terdaftar.</p></div>`;
  } else {
    deviceList.innerHTML = license.devices.map(d => `
      <div class="device-item">
        <div class="device-info">
          <div class="device-icon">${platformIcon(d.platform)}</div>
          <div>
            <div class="device-name">${escapeHtml(d.name)}</div>
            <div class="device-meta">${escapeHtml(d.platform)} &bull; Terakhir aktif: ${formatDateTime(d.last_seen)}</div>
          </div>
        </div>
        <button class="btn-action danger" onclick="hapusDevice('${license.id}', '${d.id}', '${escapeHtml(d.name)}')">
          <i class="fa-solid fa-trash-can"></i> Hapus
        </button>
      </div>
    `).join('');
  }
}

function toggleLisensiStatus() {
  const license = state.currentLicense;
  if (!license) return;
  const isActive  = license.status === 'active';
  const newStatus = isActive ? 'inactive' : 'active';
  const label     = isActive ? 'menonaktifkan' : 'mengaktifkan';

  openModal(
    `${isActive ? 'Nonaktifkan' : 'Aktifkan'} Lisensi`,
    `Apakah kamu yakin ingin ${label} lisensi <strong>${escapeHtml(license.license_key)}</strong> milik <strong>${escapeHtml(license.owner_name)}</strong>?`,
    async () => {
      if (IS_SUPABASE_CONFIGURED && supabaseClient) {
        await supabaseClient.from('licenses').update({ status: newStatus }).eq('id', license.id);
      }
      // Update mock state
      const idx = state.licenses.findIndex(l => l.id === license.id);
      if (idx !== -1) state.licenses[idx].status = newStatus;
      state.currentLicense.status = newStatus;
      renderLicenseResult(state.currentLicense);
      renderLisensiTable();
      loadDashboard();
      showToast(`Lisensi berhasil ${isActive ? 'dinonaktifkan' : 'diaktifkan'}.`, 'success');
    }
  );
}

function hapusDevice(licenseId, deviceId, deviceName) {
  openModal(
    'Hapus Device',
    `Hapus device <strong>${escapeHtml(deviceName)}</strong> dari lisensi ini? Device harus didaftarkan ulang jika ingin digunakan lagi.`,
    async () => {
      if (IS_SUPABASE_CONFIGURED && supabaseClient) {
        await supabaseClient.from('devices').delete().eq('id', deviceId);
      }
      // Update mock state
      const lic = state.licenses.find(l => l.id === licenseId);
      if (lic) lic.devices = lic.devices.filter(d => d.id !== deviceId);
      if (state.currentLicense && state.currentLicense.id === licenseId) {
        state.currentLicense.devices = state.currentLicense.devices.filter(d => d.id !== deviceId);
        renderLicenseResult(state.currentLicense);
      }
      showToast(`Device "${deviceName}" berhasil dihapus.`, 'success');
    },
    'danger'
  );
}

/* ═══════════════════════════════════════════════════════════
   DAFTAR LISENSI
   ═══════════════════════════════════════════════════════════ */
function renderLisensiTable() {
  const search    = (document.getElementById('lisensi-search')?.value || '').toLowerCase();
  const prodFilter = document.getElementById('filter-produk')?.value || '';
  const statFilter = document.getElementById('filter-status-lisensi')?.value || '';

  let filtered = state.licenses.filter(l => {
    const matchSearch = !search ||
      l.license_key.toLowerCase().includes(search) ||
      l.owner_name.toLowerCase().includes(search) ||
      l.owner_email.toLowerCase().includes(search);
    const matchProd   = !prodFilter || l.product === prodFilter;
    const matchStat   = !statFilter || l.status === statFilter;
    return matchSearch && matchProd && matchStat;
  });

  const tbody = document.getElementById('lisensi-tbody');
  const empty = document.getElementById('lisensi-empty');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = filtered.map(l => `
    <tr>
      <td class="td-mono">${l.license_key}</td>
      <td>
        <div style="font-weight:600;font-size:0.875rem;">${escapeHtml(l.owner_name)}</div>
        <div class="text-muted text-sm">${escapeHtml(l.owner_email)}</div>
      </td>
      <td>${l.product}</td>
      <td>${l.package}</td>
      <td>
        <span style="font-weight:600;">${l.devices.length}</span>
        <span class="text-muted"> / ${l.max_devices >= 99 ? '∞' : l.max_devices}</span>
      </td>
      <td>${statusBadge(l.status)}</td>
      <td class="text-muted text-sm">${formatDate(l.created_at)}</td>
      <td>
        <div class="actions-cell">
          <button class="btn-action ghost" onclick="cekLisensiFromTable('${l.license_key}')">
            <i class="fa-solid fa-magnifying-glass"></i> Detail
          </button>
          <button class="btn-action ${l.status === 'active' ? 'warning' : 'accent'}"
            onclick="toggleLisensiById('${l.id}')">
            <i class="fa-solid fa-${l.status === 'active' ? 'ban' : 'circle-check'}"></i>
            ${l.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filterLisensi() {
  renderLisensiTable();
}

function cekLisensiFromTable(licenseKey) {
  navigate('cek-lisensi');
  document.getElementById('cek-input').value = licenseKey;
  setTimeout(() => cekLisensi(), 100);
}

function toggleLisensiById(licenseId) {
  const license = state.licenses.find(l => l.id === licenseId);
  if (!license) return;
  const isActive  = license.status === 'active';
  const newStatus = isActive ? 'inactive' : 'active';

  openModal(
    `${isActive ? 'Nonaktifkan' : 'Aktifkan'} Lisensi`,
    `Apakah kamu yakin ingin ${isActive ? 'menonaktifkan' : 'mengaktifkan'} lisensi milik <strong>${escapeHtml(license.owner_name)}</strong>?`,
    async () => {
      if (IS_SUPABASE_CONFIGURED && supabaseClient) {
        await supabaseClient.from('licenses').update({ status: newStatus }).eq('id', licenseId);
      }
      license.status = newStatus;
      renderLisensiTable();
      loadDashboard();
      showToast(`Lisensi berhasil ${isActive ? 'dinonaktifkan' : 'diaktifkan'}.`, 'success');
    }
  );
}

/* ═══════════════════════════════════════════════════════════
   PESANAN
   ═══════════════════════════════════════════════════════════ */
function renderPesananTable(tab) {
  tab = tab || state.currentOrderTab || 'all';
  const orders = state.orders;
  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab);

  const tbody = document.getElementById('pesanan-tbody');
  const empty = document.getElementById('pesanan-empty');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const sorted = [...filtered].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  tbody.innerHTML = sorted.map(o => `
    <tr>
      <td class="td-mono">${o.order_number}</td>
      <td>
        <div style="font-weight:600;font-size:0.875rem;">${escapeHtml(o.buyer_name)}</div>
        <div class="text-muted text-sm">${escapeHtml(o.buyer_email)}</div>
      </td>
      <td>${o.product}</td>
      <td>${o.package}</td>
      <td style="font-weight:600;">${formatRupiah(o.amount)}</td>
      <td>${statusBadge(o.status)}</td>
      <td class="text-muted text-sm">${formatDate(o.created_at)}</td>
      <td>
        <div class="actions-cell">
          ${o.status === 'uploaded' ? `
            <button class="btn-action accent" onclick="konfirmasiPesanan('${o.id}')">
              <i class="fa-solid fa-check"></i> Konfirmasi
            </button>
            <button class="btn-action danger" onclick="tolakPesanan('${o.id}', '${escapeHtml(o.order_number)}')">
              <i class="fa-solid fa-xmark"></i> Tolak
            </button>
          ` : ''}
          ${o.status === 'rejected' ? `<span class="text-muted text-sm" title="${escapeHtml(o.rejection_reason || '')}"><i class="fa-solid fa-circle-info"></i> Lihat Alasan</span>` : ''}
          ${o.status === 'confirmed' ? `<span class="badge badge-confirmed">Selesai</span>` : ''}
          ${o.status === 'pending' ? `<span class="text-muted text-sm">Menunggu buyer</span>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function filterPesanan(tab, el) {
  state.currentOrderTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderPesananTable(tab);
}

function updatePesananTabCounts() {
  const orders = state.orders;
  const countMap = { all: orders.length, pending: 0, uploaded: 0, confirmed: 0, rejected: 0 };
  orders.forEach(o => { if (countMap[o.status] !== undefined) countMap[o.status]++; });
  Object.keys(countMap).forEach(k => {
    const el = document.getElementById('tab-count-' + k);
    if (el) el.textContent = countMap[k];
  });
}

function konfirmasiPesanan(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;
  openModal(
    'Konfirmasi Pesanan',
    `Konfirmasi pembayaran untuk pesanan <strong>${order.order_number}</strong> dari <strong>${escapeHtml(order.buyer_name)}</strong> sebesar <strong>${formatRupiah(order.amount)}</strong>?`,
    async () => {
      if (IS_SUPABASE_CONFIGURED && supabaseClient) {
        await supabaseClient.from('orders').update({ status: 'confirmed' }).eq('id', orderId);
      }
      order.status = 'confirmed';
      renderPesananTable(state.currentOrderTab);
      updatePesananTabCounts();
      loadDashboard();
      showToast(`Pesanan ${order.order_number} berhasil dikonfirmasi.`, 'success');
    }
  );
}

function tolakPesanan(orderId, orderNumber) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  openModal(
    'Tolak Pesanan',
    `Masukkan alasan penolakan untuk pesanan <strong>${escapeHtml(orderNumber)}</strong>:`,
    async () => {
      const reasonInput = document.getElementById('modal-reject-reason');
      const reason = reasonInput ? reasonInput.value.trim() : 'Ditolak oleh admin.';
      if (!reason) {
        showToast('Masukkan alasan penolakan.', 'error');
        return false; // Jangan tutup modal
      }
      if (IS_SUPABASE_CONFIGURED && supabaseClient) {
        await supabaseClient.from('orders').update({ status: 'rejected', rejection_reason: reason }).eq('id', orderId);
      }
      order.status = 'rejected';
      order.rejection_reason = reason;
      renderPesananTable(state.currentOrderTab);
      updatePesananTabCounts();
      loadDashboard();
      showToast(`Pesanan ${orderNumber} berhasil ditolak.`, 'info');
    },
    'danger',
    `<div class="form-group" style="margin-top:0.75rem;">
       <label style="font-size:0.8rem;font-weight:600;color:#374151;display:block;margin-bottom:0.4rem;">Alasan Penolakan</label>
       <input type="text" id="modal-reject-reason" class="form-control"
         placeholder="Contoh: Bukti transfer tidak valid atau tidak terbaca" style="font-size:0.875rem;">
     </div>`
  );
}

/* ═══════════════════════════════════════════════════════════
   BUAT LISENSI
   ═══════════════════════════════════════════════════════════ */
function updatePaketOptions() {
  // Paket saat ini sudah universal, tapi bisa dikustomisasi per produk di sini
  // Untuk saat ini tidak ada perubahan opsi, tapi fungsi ini dipanggil saat produk berubah
}

function generateLicense(event) {
  event.preventDefault();
  const produk  = document.getElementById('cl-produk').value;
  const paket   = document.getElementById('cl-paket').value;
  const nama    = document.getElementById('cl-nama').value.trim();
  const email   = document.getElementById('cl-email').value.trim();
  const catatan = document.getElementById('cl-catatan').value.trim();

  if (!produk || !paket || !nama || !email) {
    showToast('Lengkapi semua field yang wajib diisi.', 'error');
    return;
  }

  const newKey = generateMockLicenseKey(produk);
  const maxDev = PACKAGE_MAX_DEVICES[paket] || 1;

  const newLicense = {
    id: 'lic-' + Date.now(),
    license_key: newKey,
    product: produk,
    package: paket,
    owner_name: nama,
    owner_email: email,
    status: 'active',
    max_devices: maxDev,
    created_at: new Date().toISOString(),
    notes: catatan,
    devices: [],
  };

  if (IS_SUPABASE_CONFIGURED && supabaseClient) {
    // Fire-and-forget insert ke Supabase
    supabaseClient.from('licenses').insert([{
      license_key: newKey,
      product: produk,
      package: paket,
      owner_name: nama,
      owner_email: email,
      status: 'active',
      max_devices: maxDev,
      notes: catatan,
    }]).then(({ error }) => {
      if (error) showToast('Gagal menyimpan ke database: ' + error.message, 'error');
    });
  }

  // Tambah ke state lokal
  state.licenses.unshift(newLicense);
  renderLisensiTable();
  loadDashboard();

  // Tampilkan generated key
  document.getElementById('generated-key-text').textContent = newKey;
  const keyBox = document.getElementById('generated-key-box');
  keyBox.style.display = 'flex';
  keyBox.classList.add('visible');

  showToast(`Lisensi berhasil dibuat untuk ${nama}.`, 'success');
}

function copyGeneratedKey() {
  const key = document.getElementById('generated-key-text').textContent;
  navigator.clipboard.writeText(key).then(() => {
    const btn = document.getElementById('btn-copy-key');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!';
    setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-copy"></i> Salin'; }, 2000);
    showToast('License key disalin ke clipboard.', 'success');
  }).catch(() => {
    showToast('Gagal menyalin. Salin manual dari layar.', 'error');
  });
}

/* ─── Generate License Key ───────────────────────────── */
function generateMockLicenseKey(productSlug) {
  const chars   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment = (len = 4) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

  if (productSlug === 'SuruhLaundry') {
    return `SLNDRY-${segment()}-${segment()}-${segment()}-${segment()}`;
  }
  // Default: SuruhKelola
  return `SK-${segment()}-${segment()}-${segment()}-${segment()}`;
}

/* ═══════════════════════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════════════════════ */
function openModal(title, subHTML, onConfirm, type = 'primary', extraFields = '') {
  document.getElementById('modal-title').textContent    = title;
  document.getElementById('modal-sub').innerHTML        = subHTML;
  document.getElementById('modal-extra-fields').innerHTML = extraFields;

  const confirmBtn = document.getElementById('modal-confirm-btn');
  confirmBtn.className = `btn-action ${type}`;
  confirmBtn.textContent = type === 'danger' ? 'Ya, Lanjutkan' : 'Konfirmasi';

  state.modalAction = onConfirm;
  document.getElementById('confirm-modal').classList.add('open');
}

async function executeModalAction() {
  if (typeof state.modalAction === 'function') {
    const result = await state.modalAction();
    if (result === false) return; // Tetap buka modal jika action return false
  }
  closeModal();
}

function closeModal() {
  document.getElementById('confirm-modal').classList.remove('open');
  state.modalAction = null;
}

// Tutup modal kalau klik overlay
document.getElementById('confirm-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

/* ═══════════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ═══════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

function statusBadge(status, size = '') {
  const map = {
    active:    { cls: 'badge-active',    label: 'Aktif' },
    inactive:  { cls: 'badge-inactive',  label: 'Nonaktif' },
    pending:   { cls: 'badge-pending',   label: 'Menunggu Bukti' },
    uploaded:  { cls: 'badge-uploaded',  label: 'Perlu Konfirmasi' },
    confirmed: { cls: 'badge-confirmed', label: 'Terkonfirmasi' },
    rejected:  { cls: 'badge-rejected',  label: 'Ditolak' },
  };
  const entry = map[status] || { cls: 'badge-pending', label: status };
  const style = size === 'large' ? 'font-size:0.8rem;padding:0.35rem 0.875rem;' : '';
  return `<span class="badge ${entry.cls}" style="${style}">${entry.label}</span>`;
}

function productBadgeClass(product) {
  return product === 'SuruhKelola' ? 'badge-confirmed' : 'badge-uploaded';
}

function platformIcon(platform) {
  const p = (platform || '').toLowerCase();
  if (p.includes('windows'))    return '<i class="fa-brands fa-windows"></i>';
  if (p.includes('macos') || p.includes('mac'))    return '<i class="fa-brands fa-apple"></i>';
  if (p.includes('ios') || p.includes('ipad'))     return '<i class="fa-brands fa-apple"></i>';
  if (p.includes('android'))    return '<i class="fa-brands fa-android"></i>';
  return '<i class="fa-solid fa-display"></i>';
}

function formatRupiah(amount) {
  return 'Rp ' + (amount || 0).toLocaleString('id-ID');
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str || '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
