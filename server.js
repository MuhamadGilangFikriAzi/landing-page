const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8090;
const DATA_FILE = path.join(__dirname, 'data', 'licenses.json');

// ─── Ensure data directory and seed data ───
function ensureData() {
    const dir = path.join(__dirname, 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
        const seed = [
            {
                id: 1,
                license_key: 'SK-A1B2-C3D4-E5F6-G7H8',
                app: 'suruhkelola',
                package: 'starter',
                max_devices: 1,
                activated_devices: [],
                customer_name: 'Budi Santoso',
                customer_email: 'budi@example.com',
                status: 'active',
                created_at: '2026-05-15T10:00:00Z',
                expires_at: null
            },
            {
                id: 2,
                license_key: 'SK-X9Y8-Z7W6-V5U4-T3S2',
                app: 'suruhkelola',
                package: 'bisnis',
                max_devices: 3,
                activated_devices: ['device-abc-001'],
                customer_name: 'Sari Dewi',
                customer_email: 'sari@example.com',
                status: 'active',
                created_at: '2026-05-20T14:30:00Z',
                expires_at: null
            },
            {
                id: 3,
                license_key: 'SL-K3L4-M5N6-O7P8-Q9R0',
                app: 'suruhlaundry',
                package: 'starter',
                max_devices: 1,
                activated_devices: [],
                customer_name: 'Ahmad Rizal',
                customer_email: 'ahmad@example.com',
                status: 'active',
                created_at: '2026-05-22T09:15:00Z',
                expires_at: null
            },
            {
                id: 4,
                license_key: 'SL-A1S2-D3F4-G5H6-J7K8',
                app: 'suruhlaundry',
                package: 'bisnis',
                max_devices: 3,
                activated_devices: ['device-laundry-01', 'device-laundry-02'],
                customer_name: 'Dina Fitria',
                customer_email: 'dina@example.com',
                status: 'active',
                created_at: '2026-05-25T16:45:00Z',
                expires_at: null
            }
        ];
        fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2));
        console.log('  Seeded default licenses');
    }
}

// ─── Read/write licenses ───
function getLicenses() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveLicenses(licenses) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(licenses, null, 2));
}

// ─── MIME types ───
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml',
};

// ─── Serve static files ───
function serveStatic(req, res) {
    // Strip query string from URL before resolving file path
    const urlPath = req.url.split('?')[0];
    let filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
                return;
            }
            res.writeHead(500);
            res.end('Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
}

// ─── Parse JSON body ───
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
    });
}

// ─── Generate license key ───
function generateLicenseKey(app) {
    const prefix = app === 'suruhkelola' ? 'SK' : 'SL';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let segments = [];
    for (let i = 0; i < 4; i++) {
        let seg = '';
        for (let j = 0; j < 4; j++) {
            seg += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(seg);
    }
    return `${prefix}-${segments.join('-')}`;
}

// ─── API Routes ────────────────────────────────────────────────
async function handleAPI(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const sendJSON = (data, status = 200) => {
        res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data, null, 2));
    };

    try {
        // ─── POST /api/verify-license ───
        // Request: { license_key: string, device_id: string, app: "suruhkelola"|"suruhlaundry" }
        // Response: { valid: bool, message: string, license?: { app, package, max_devices, activated_count } }
        if (req.method === 'POST' && pathParts[0] === 'api' && pathParts[1] === 'verify-license') {
            const body = await parseBody(req);
            const { license_key, device_id, app } = body;

            if (!license_key) {
                sendJSON({ valid: false, message: 'License key is required' }, 400);
                return;
            }
            if (!device_id) {
                sendJSON({ valid: false, message: 'Device ID is required' }, 400);
                return;
            }

            const licenses = getLicenses();
            const lic = licenses.find(l => l.license_key === license_key);

            if (!lic) {
                sendJSON({ valid: false, message: 'License key not found' });
                return;
            }

            if (lic.status !== 'active') {
                sendJSON({ valid: false, message: `License is ${lic.status}` });
                return;
            }

            if (app && lic.app !== app) {
                sendJSON({ valid: false, message: `License is for ${lic.app}, not ${app}` });
                return;
            }

            // Check if already activated on this device
            if (!lic.activated_devices.includes(device_id)) {
                if (lic.activated_devices.length >= lic.max_devices) {
                    sendJSON({
                        valid: false,
                        message: `Maximum devices reached (${lic.max_devices}/${lic.max_devices}). Deactivate another device first.`,
                        license: {
                            app: lic.app,
                            package: lic.package,
                            max_devices: lic.max_devices,
                            activated_count: lic.activated_devices.length
                        }
                    });
                    return;
                }
                // Register this device
                lic.activated_devices.push(device_id);
                saveLicenses(licenses);
            }

            sendJSON({
                valid: true,
                message: 'License activated successfully',
                license: {
                    app: lic.app,
                    package: lic.package,
                    max_devices: lic.max_devices,
                    activated_count: lic.activated_devices.length,
                    customer_name: lic.customer_name
                }
            });
            return;
        }

        // ─── POST /api/deactivate-device ───
        // Request: { license_key: string, device_id: string }
        if (req.method === 'POST' && pathParts[0] === 'api' && pathParts[1] === 'deactivate-device') {
            const body = await parseBody(req);
            const { license_key, device_id } = body;

            const licenses = getLicenses();
            const lic = licenses.find(l => l.license_key === license_key);

            if (!lic) {
                sendJSON({ success: false, message: 'License not found' }, 404);
                return;
            }

            lic.activated_devices = lic.activated_devices.filter(d => d !== device_id);
            saveLicenses(licenses);

            sendJSON({
                success: true,
                message: 'Device deactivated',
                activated_devices: lic.activated_devices.length,
                remaining_slots: lic.max_devices - lic.activated_devices.length
            });
            return;
        }

        // ─── GET /api/license/:key ───
        // Check license status (public)
        if (req.method === 'GET' && pathParts[0] === 'api' && pathParts[1] === 'license' && pathParts[2]) {
            const licenseKey = pathParts[2];
            const licenses = getLicenses();
            const lic = licenses.find(l => l.license_key === licenseKey);

            if (!lic) {
                sendJSON({ valid: false, message: 'License not found' }, 404);
                return;
            }

            sendJSON({
                valid: lic.status === 'active',
                status: lic.status,
                app: lic.app,
                package: lic.package,
                max_devices: lic.max_devices,
                activated_devices: lic.activated_devices.length,
                customer_name: lic.customer_name,
                created_at: lic.created_at,
                expires_at: lic.expires_at
            });
            return;
        }

        // ─── GET /api/licenses ───
        // List all licenses (admin)
        if (req.method === 'GET' && pathParts[0] === 'api' && pathParts[1] === 'licenses') {
            const licenses = getLicenses();
            sendJSON({ licenses });
            return;
        }

        // ─── POST /api/licenses (admin: create new license) ───
        if (req.method === 'POST' && pathParts[0] === 'api' && pathParts[1] === 'licenses') {
            const body = await parseBody(req);
            const { app, pkg, customer_name, customer_email } = body;

            if (!app || !pkg || !customer_name || !customer_email) {
                sendJSON({ success: false, message: 'Missing required fields: app, package, customer_name, customer_email' }, 400);
                return;
            }

            const maxDevices = pkg === 'starter' ? 1 : pkg === 'bisnis' ? 3 : pkg === 'pro' ? 10 : 1;

            const licenses = getLicenses();
            const newLic = {
                id: licenses.length + 1,
                license_key: generateLicenseKey(app),
                app,
                package: pkg,
                max_devices: maxDevices,
                activated_devices: [],
                customer_name,
                customer_email,
                status: 'active',
                created_at: new Date().toISOString(),
                expires_at: null
            };

            licenses.push(newLic);
            saveLicenses(licenses);

            sendJSON({ success: true, license: newLic }, 201);
            return;
        }

        // ─── PUT /api/licenses/:key (admin: update status) ───
        if (req.method === 'PUT' && pathParts[0] === 'api' && pathParts[1] === 'licenses' && pathParts[2]) {
            const body = await parseBody(req);
            const licenseKey = pathParts[2];
            const licenses = getLicenses();
            const lic = licenses.find(l => l.license_key === licenseKey);

            if (!lic) {
                sendJSON({ success: false, message: 'License not found' }, 404);
                return;
            }

            if (body.status) lic.status = body.status;
            if (body.customer_name) lic.customer_name = body.customer_name;
            if (body.customer_email) lic.customer_email = body.customer_email;
            if (body.package) {
                lic.package = body.package;
                lic.max_devices = body.package === 'starter' ? 1 : body.package === 'bisnis' ? 3 : body.package === 'pro' ? 10 : 1;
            }

            saveLicenses(licenses);
            sendJSON({ success: true, license: lic });
            return;
        }

        // ─── GET /api/health ───
        if (req.method === 'GET' && pathParts[0] === 'api' && pathParts[1] === 'health') {
            sendJSON({ status: 'ok', timestamp: new Date().toISOString() });
            return;
        }

        // ─── No matching API route ───
        sendJSON({ error: 'Not found' }, 404);

    } catch (err) {
        console.error('API Error:', err.message);
        sendJSON({ error: err.message }, 500);
    }
}

// ─── Server ─────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    if (url.pathname.startsWith('/api/')) {
        handleAPI(req, res);
    } else {
        serveStatic(req, res);
    }
});

ensureData();
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SuruhNgoding Server running on http://0.0.0.0:${PORT}`);
    console.log(`   Static: http://localhost:${PORT}/`);
    console.log(`   API:    http://localhost:${PORT}/api/health`);
    console.log(`   Verify: http://localhost:${PORT}/api/verify-license (POST)`);
    console.log(`   Admin:  http://localhost:${PORT}/admin.html`);
});
