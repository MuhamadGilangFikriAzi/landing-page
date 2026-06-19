const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const { getDb, initDb } = require('./db');

const app = express();
const PORT = 8090;

// ─── Init Database ───
initDb();
const db = getDb();

// ─── Middleware ───
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  store: new SQLiteStore({ dir: path.join(__dirname, 'data'), db: 'sessions.db' }),
  secret: crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' }
}));

// ─── Security Headers ───
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ─── Render helper with layout ───
const fs = require('fs');
const ejs = require('ejs');
const viewsDir = path.join(__dirname, 'views');
function renderWithLayout(res, view, data = {}, status = 200) {
  const viewContent = fs.readFileSync(path.join(viewsDir, view), 'utf-8');
  const layoutContent = fs.readFileSync(path.join(viewsDir, 'layout.ejs'), 'utf-8');
  const merged = { ...(res.locals || {}), ...data };
  const renderedView = ejs.render(viewContent, { ...merged }, { views: [viewsDir, path.join(viewsDir, 'admin')] });
  const html = ejs.render(layoutContent, { ...merged, body: renderedView }, { views: [viewsDir] });
  res.status(status).send(html);
}

// ─── Locals ───
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { id: req.session.userId, name: req.session.userName, role: req.session.role } : null;
  res.locals.path = req.path;
  res.locals.success_msg = req.session.success_msg;
  res.locals.error_msg = req.session.error_msg;
  delete req.session.success_msg;
  delete req.session.error_msg;
  next();
});

// ─── Rate Limiter ───
const rateMap = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const win = 60000;
  if (!rateMap.has(ip)) rateMap.set(ip, []);
  const hits = rateMap.get(ip).filter(t => now - t < win);
  hits.push(now);
  rateMap.set(ip, hits);
  if (hits.length > 100) return res.status(429).json({ error: 'Too many requests' });
  next();
}
app.use('/api/', rateLimit);

// ─── Auth Routes ─────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.userId) return req.session.role === 'admin' ? res.redirect('/admin') : res.redirect('/dashboard');
  renderWithLayout(res, 'login.ejs', { title: 'Masuk - SuruhNgoding' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { req.session.error_msg = 'Email dan password wajib diisi'; return res.redirect('/login'); }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) { req.session.error_msg = 'Email atau password salah'; return res.redirect('/login'); }
  req.session.userId = user.id;
  req.session.userName = user.name;
  req.session.userEmail = user.email;
  req.session.role = user.role;
  const redirectTo = req.session.redirectAfterLogin || (user.role === 'admin' ? '/admin' : '/dashboard');
  delete req.session.redirectAfterLogin;
  res.redirect(redirectTo);
});

app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  renderWithLayout(res, 'register.ejs', { title: 'Daftar - SuruhNgoding' });
});

app.post('/register', async (req, res) => {
  const { name, email, password, confirm_password } = req.body;
  if (!name || !email || !password || password !== confirm_password) { req.session.error_msg = 'Lengkapi data atau password tidak cocok'; return res.redirect('/register'); }
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) { req.session.error_msg = 'Email sudah terdaftar'; return res.redirect('/register'); }
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hash, 'customer');
  req.session.success_msg = 'Pendaftaran berhasil. Silakan login.';
  res.redirect('/login');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ─── Public Routes ──────────────────────────
app.get('/', (req, res) => { renderWithLayout(res, 'index.ejs', { title: 'SuruhNgoding - Solusi Digital untuk Bisnis Anda' }); });

app.get('/beli', (req, res) => {
  if (!req.session.userId) {
    req.session.redirectAfterLogin = '/beli' + (req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '');
    return res.redirect('/login');
  }
  const validApps = ['suruhkelola', 'suruhlaundry'];
  const validPkgs = ['starter', 'bisnis', 'pro'];
  renderWithLayout(res, 'beli.ejs', {
    title: 'Beli Lisensi - SuruhNgoding',
    selectedApp: validApps.includes(req.query.app) ? req.query.app : '',
    selectedPkg: validPkgs.includes(req.query.pkg) ? req.query.pkg : ''
  });
});

app.post('/beli', (req, res) => {
  if (!req.session.userId) {
    req.session.redirectAfterLogin = '/beli';
    req.session.error_msg = 'Silakan login terlebih dahulu';
    return res.redirect('/login');
  }
  
  const { app: appName, pkg, customer_name } = req.body;
  if (!appName || !pkg || !customer_name) { req.session.error_msg = 'Lengkapi semua data'; return res.redirect('/beli'); }
  
  const prices = { suruhkelola: { starter: 299000, bisnis: 699000, pro: 1499000 }, suruhlaundry: { starter: 249000, bisnis: 549000, pro: 1199000 } };
  const amount = prices[appName]?.[pkg];
  if (!amount) { req.session.error_msg = 'Paket tidak valid'; return res.redirect('/beli'); }

  // Buat order number
  const date = new Date();
  const ds = date.toISOString().slice(0,10).replace(/-/g,'');
  const rnd = String(~~(Math.random()*900)+100);
  const orderNo = `INV-${ds}-${rnd}`;

  // Simpan order dengan status pending — BELUM generate license
  const productName = appName === 'suruhkelola' ? 'SuruhKelola' : 'SuruhLaundry';
  db.prepare('INSERT INTO orders (order_number, user_id, customer_name, customer_email, product, package, amount, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(orderNo, req.session.userId, customer_name, req.session.userEmail, productName, pkg, amount, 'pending');

  req.session.success_msg = `Pesanan #${orderNo} berhasil dibuat! Silakan hubungi admin untuk konfirmasi pembayaran.`;
  res.redirect('/orders');
});

app.get('/cek-lisensi', (req, res) => {
  const key = req.query.key || '';
  let license = null;
  if (key) license = db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(key.toUpperCase());
  renderWithLayout(res, 'cek-lisensi.ejs', { title: 'Cek Lisensi - SuruhNgoding', queryKey: key, license });
});

// ─── Public API ─────────────────────────────
app.post('/api/verify-license', (req, res) => {
  const { license_key, device_id, app: appName } = req.body;
  if (!license_key) return res.status(400).json({ valid: false, message: 'License key required' });
  if (!device_id) return res.status(400).json({ valid: false, message: 'Device ID required' });

  const lic = db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(license_key);
  if (!lic) return res.json({ valid: false, message: 'License not found' });
  if (lic.status !== 'active') return res.json({ valid: false, message: `License is ${lic.status}` });
  if (appName && lic.app !== appName) return res.json({ valid: false, message: `License is for ${lic.app}` });

  let devices = JSON.parse(lic.activated_devices || '[]');
  if (!devices.includes(device_id)) {
    if (devices.length >= lic.max_devices) {
      return res.json({ valid: false, message: `Max devices (${lic.max_devices}) reached`, license: { app: lic.app, package: lic.package, max_devices: lic.max_devices, activated_count: devices.length } });
    }
    devices.push(device_id);
    db.prepare('UPDATE licenses SET activated_devices = ? WHERE license_key = ?').run(JSON.stringify(devices), license_key);
  }
  res.json({ valid: true, message: 'License activated', license: { app: lic.app, package: lic.package, max_devices: lic.max_devices, activated_count: devices.length, customer_name: lic.customer_name } });
});

app.post('/api/deactivate-device', (req, res) => {
  const { license_key, device_id } = req.body;
  const lic = db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(license_key);
  if (!lic) return res.status(404).json({ success: false, message: 'Not found' });
  let devices = JSON.parse(lic.activated_devices || '[]');
  devices = devices.filter(d => d !== device_id);
  db.prepare('UPDATE licenses SET activated_devices = ? WHERE license_key = ?').run(JSON.stringify(devices), license_key);
  res.json({ success: true, activated_devices: devices.length, remaining_slots: lic.max_devices - devices.length });
});

app.get('/api/license/:key', (req, res) => {
  const lic = db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(req.params.key);
  if (!lic) return res.status(404).json({ valid: false, message: 'Not found' });
  res.json({ valid: lic.status === 'active', status: lic.status, app: lic.app, package: lic.package, max_devices: lic.max_devices, activated_devices: JSON.parse(lic.activated_devices || '[]').length, customer_name: lic.customer_name, created_at: lic.created_at });
});

app.get('/api/health', (req, res) => { res.json({ status: 'ok', timestamp: new Date().toISOString() }); });

// ─── Admin Auth (API Bearer Token) ──────────
const ADMIN_TOKEN = crypto.randomBytes(32).toString('hex');

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, 'admin');
  if (user && bcrypt.compareSync(password, user.password)) {
    return res.json({ success: true, token: ADMIN_TOKEN, user: { email: user.email, role: user.role } });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

function requireAdminAPI(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/admin/licenses', requireAdminAPI, (req, res) => {
  res.json({ licenses: db.prepare('SELECT * FROM licenses ORDER BY id').all() });
});

app.post('/api/admin/licenses', requireAdminAPI, (req, res) => {
  const { app: appName, pkg, customer_name, customer_email } = req.body;
  if (!appName || !pkg || !customer_name || !customer_email) return res.status(400).json({ success: false, message: 'Missing fields' });
  const prefix = appName === 'suruhkelola' ? 'SK' : 'SL';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => { let s=''; for(let j=0;j<4;j++) s+=chars[~~(Math.random()*chars.length)]; return s; };
  const key = `${prefix}-${seg()}-${seg()}-${seg()}-${seg()}`;
  const maxDev = pkg === 'starter' ? 1 : pkg === 'bisnis' ? 3 : pkg === 'pro' ? 10 : 1;
  db.prepare('INSERT INTO licenses (license_key, app, package, max_devices, customer_name, customer_email, status) VALUES (?, ?, ?, ?, ?, ?, ?)').run(key, appName, pkg, maxDev, customer_name, customer_email, 'active');
  const lic = db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(key);
  res.status(201).json({ success: true, license: lic });
});

app.put('/api/admin/licenses/:key', requireAdminAPI, (req, res) => {
  const lic = db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(req.params.key);
  if (!lic) return res.status(404).json({ success: false, message: 'Not found' });
  const { status, customer_name, customer_email, package: pkg } = req.body;
  if (status) db.prepare('UPDATE licenses SET status = ? WHERE license_key = ?').run(status, req.params.key);
  if (customer_name) db.prepare('UPDATE licenses SET customer_name = ? WHERE license_key = ?').run(customer_name, req.params.key);
  if (customer_email) db.prepare('UPDATE licenses SET customer_email = ? WHERE license_key = ?').run(customer_email, req.params.key);
  if (pkg) db.prepare('UPDATE licenses SET package = ?, max_devices = ? WHERE license_key = ?').run(pkg, pkg === 'starter' ? 1 : pkg === 'bisnis' ? 3 : 10, req.params.key);
  res.json({ success: true, license: db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(req.params.key) });
});

// ─── Admin Routes ───────────────────────────
function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin') return res.redirect('/login');
  next();
}

app.get('/admin', requireAdmin, (req, res) => {
  const totalLicenses = db.prepare('SELECT COUNT(*) as c FROM licenses').get().c;
  const activeLicenses = db.prepare('SELECT COUNT(*) as c FROM licenses WHERE status = ?').get('active').c;
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const totalRevenue = db.prepare('SELECT COALESCE(SUM(amount),0) as s FROM orders WHERE payment_status = ?').get('paid').s;

  const recentLicenses = db.prepare('SELECT * FROM licenses ORDER BY id DESC LIMIT 5').all();
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all();

  renderWithLayout(res, 'admin/index.ejs', { title: 'Admin - SuruhNgoding', totalLicenses, activeLicenses, totalOrders, totalUsers, totalRevenue, recentLicenses, recentOrders });
});

app.get('/admin/licenses', requireAdmin, (req, res) => {
  const licenses = db.prepare('SELECT * FROM licenses ORDER BY id DESC').all();
  renderWithLayout(res, 'admin/licenses.ejs', { title: 'Lisensi - Admin SuruhNgoding', licenses });
});

app.get('/admin/orders', requireAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  renderWithLayout(res, 'admin/orders.ejs', { title: 'Pesanan - Admin SuruhNgoding', orders });
});

// ─── Admin Confirm Order ───
app.post('/admin/orders/:id/confirm', requireAdmin, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) { req.session.error_msg = 'Pesanan tidak ditemukan'; return res.redirect('/admin/orders'); }
  if (order.payment_status !== 'pending') { req.session.error_msg = 'Pesanan sudah dikonfirmasi'; return res.redirect('/admin/orders'); }

  const appMap = { SuruhKelola: 'SK', SuruhLaundry: 'SL' };
  const prefix = appMap[order.product] || 'XX';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => { let s=''; for(let j=0;j<4;j++) s+=chars[~~(Math.random()*chars.length)]; return s; };
  const licenseKey = prefix + '-' + seg() + '-' + seg() + '-' + seg() + '-' + seg();

  const maxDev = order.package === 'starter' ? 1 : order.package === 'bisnis' ? 3 : 10;
  const appName = order.product === 'SuruhKelola' ? 'suruhkelola' : 'suruhlaundry';

  const tx = db.transaction(() => {
    db.prepare('UPDATE orders SET payment_status = ?, license_key = ?, paid_at = ? WHERE id = ?')
      .run('paid', licenseKey, new Date().toISOString(), order.id);
    db.prepare('INSERT INTO licenses (license_key, user_id, app, package, max_devices, customer_name, customer_email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(licenseKey, order.user_id, appName, order.package, maxDev, order.customer_name, order.customer_email, 'active');
  });
  tx();

  req.session.success_msg = 'Pesanan #' + order.order_number + ' dikonfirmasi! Lisensi: ' + licenseKey;
  res.redirect('/admin/orders');
});

app.get('/admin/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all();
  renderWithLayout(res, 'admin/users.ejs', { title: 'Pengguna - Admin SuruhNgoding', users });
});

// ─── Customer Routes ────────────────────────
function requireCustomer(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

app.get('/dashboard', requireCustomer, (req, res) => {
  const licenses = db.prepare('SELECT * FROM licenses WHERE user_id = ? ORDER BY id DESC').all(req.session.userId);
  renderWithLayout(res, 'dashboard.ejs', { title: 'Dashboard - SuruhNgoding', licenses });
});

app.get('/orders', requireCustomer, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC').all(req.session.userId);
  renderWithLayout(res, 'orders.ejs', { title: 'Pesanan Saya - SuruhNgoding', orders });
});

app.get('/orders/:id', requireCustomer, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!order) return res.redirect('/orders');
  renderWithLayout(res, 'order-detail.ejs', { title: 'Detail Pesanan - SuruhNgoding', order });
});

// ─── 404 ───
app.use((req, res) => { renderWithLayout(res, '404.ejs', { title: '404 - Halaman Tidak Ditemukan' }, 404); });


// ─── Start ──────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SuruhNgoding Platform running on http://0.0.0.0:${PORT}`);
  console.log(`   Landing: http://localhost:${PORT}/`);
  console.log(`   Login:   http://localhost:${PORT}/login`);
  console.log(`   Register: http://localhost:${PORT}/register`);
  console.log(`   Admin:   http://localhost:${PORT}/admin (admin@sistem.xyz / admin123)`);
  console.log(`   Admin API Token: ${ADMIN_TOKEN.substring(0,16)}...`);
  console.log(`   Database: sqlite://data/suruhngoding.db`);
});
