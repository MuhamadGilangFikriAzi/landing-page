const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'data', 'suruhngoding.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const d = getDb();

  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      app TEXT NOT NULL,
      package TEXT NOT NULL,
      max_devices INTEGER NOT NULL,
      activated_devices TEXT DEFAULT '[]',
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      product TEXT NOT NULL,
      package TEXT NOT NULL,
      amount INTEGER NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      license_key TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expired DATETIME NOT NULL
    );
  `);

  // Seed admin
  const adminExists = d.prepare('SELECT id FROM users WHERE email = ?').get('admin@sistem.xyz');
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    d.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Admin SuruhNgoding', 'admin@sistem.xyz', hash, 'admin');
    console.log('  Seeded admin user (admin@sistem.xyz / admin123)');
  }

  // Seed sample customer
  const custExists = d.prepare('SELECT id FROM users WHERE email = ?').get('customer@demo.com');
  if (!custExists) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('customer123', 10);
    d.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run('Demo Customer', 'customer@demo.com', hash, 'customer');
    console.log('  Seeded demo customer (customer@demo.com / customer123)');
  }

  // Seed sample licenses from JSON if exists
  const licCount = d.prepare('SELECT COUNT(*) as c FROM licenses').get().c;
  if (licCount === 0) {
    const fs = require('fs');
    const oldJson = path.join(__dirname, '..', 'secure-data', 'licenses.json');
    if (fs.existsSync(oldJson)) {
      const oldData = JSON.parse(fs.readFileSync(oldJson, 'utf-8'));
      const insert = d.prepare('INSERT INTO licenses (license_key, app, package, max_devices, activated_devices, customer_name, customer_email, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
      const tx = d.transaction((lics) => {
        for (const l of lics) {
          insert.run(l.license_key, l.app, l.package, l.max_devices, JSON.stringify(l.activated_devices), l.customer_name, l.customer_email, l.status, l.created_at);
        }
      });
      tx(oldData);
      console.log(`  Migrated ${oldData.length} licenses from JSON`);
    } else {
      const insert = d.prepare('INSERT INTO licenses (license_key, app, package, max_devices, activated_devices, customer_name, customer_email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      insert.run('SK-A1B2-C3D4-E5F6-G7H8', 'suruhkelola', 'starter', 1, '[]', 'Budi Santoso', 'budi@example.com', 'active');
      insert.run('SK-X9Y8-Z7W6-V5U4-T3S2', 'suruhkelola', 'bisnis', 3, '["device-abc-001"]', 'Sari Dewi', 'sari@example.com', 'active');
      insert.run('SL-K3L4-M5N6-O7P8-Q9R0', 'suruhlaundry', 'starter', 1, '[]', 'Ahmad Rizal', 'ahmad@example.com', 'active');
      insert.run('SL-A1S2-D3F4-G5H6-J7K8', 'suruhlaundry', 'bisnis', 3, '["device-laundry-01","device-laundry-02"]', 'Dina Fitria', 'dina@example.com', 'active');
      console.log('  Seeded default licenses');
    }
  }
}

module.exports = { getDb, initDb };
