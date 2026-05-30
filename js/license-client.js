/**
 * SuruhNgoding License Client
 * ─────────────────────────────────────────────────────────
 * File ini adalah REFERENSI untuk diimplementasi di aplikasi
 * SuruhKelola dan SuruhLaundry.
 *
 * Cara pakai:
 *   const lm = new LicenseManager({ app: 'suruhkelola' })
 *
 *   // Saat user input license key pertama kali:
 *   const result = await lm.activate(licenseKey, deviceId, deviceName, platform)
 *
 *   // Saat app dibuka (startup check):
 *   const result = await lm.verify()
 *
 *   // Result:
 *   result.status === 'active'      → izinkan masuk, lisensi valid
 *   result.status === 'on_check'    → izinkan masuk, API sedang tidak bisa dihubungi
 *   result.status === 'inactive'    → blokir, lisensi dinonaktifkan
 *   result.status === 'device_limit'→ blokir, device penuh
 *   result.status === 'not_found'   → blokir, key tidak dikenal
 */

'use strict'

const LICENSE_API_BASE = 'https://<project-ref>.supabase.co/functions/v1/license'
const LICENSE_API_KEY  = '<isi-dengan-LICENSE_API_SECRET-kamu>'
const RETRY_INTERVAL_MS = 30 * 60 * 1000   // 30 menit
const REQUEST_TIMEOUT_MS = 8000            // 8 detik

class LicenseManager {
  /**
   * @param {{ app: 'suruhkelola'|'suruhlaundry' }} opts
   */
  constructor(opts = {}) {
    this.app = opts.app             // 'suruhkelola' atau 'suruhlaundry'
    this._retryTimer = null
    this._onActivated = null        // callback saat retry berhasil
  }

  /* ── PUBLIC ─────────────────────────────────────────────── */

  /**
   * Panggil saat user pertama kali memasukkan license key.
   * Mendaftarkan device ke SuruhNgoding.
   *
   * @param {string} licenseKey  - contoh: SK-A1B2-C3D4-E5F6-G7H8
   * @param {string} deviceId    - UUID unik perangkat (generate sekali, simpan permanen)
   * @param {string} deviceName  - nama ramah, contoh: "Samsung Galaxy A34"
   * @param {string} platform    - android | ios | windows | macos | web
   * @returns {{ status, license?, message? }}
   */
  async activate(licenseKey, deviceId, deviceName, platform) {
    const result = await this._post('activate', {
      license_key: licenseKey,
      device_id:   deviceId,
      device_name: deviceName,
      platform,
      app: this.app,
    })

    if (result._networkError) {
      // API tidak bisa dihubungi — izinkan masuk, jadwalkan retry
      this._saveLocal(licenseKey, deviceId, 'on_check')
      this._startRetry(licenseKey, deviceId)
      return { status: 'on_check' }
    }

    if (result.success) {
      this._saveLocal(licenseKey, deviceId, 'active')
      this._stopRetry()
      return { status: 'active', license: result.license }
    }

    // Gagal karena key salah / tidak ditemukan / device limit
    return { status: result.code, message: result.message, license: result.license }
  }

  /**
   * Panggil setiap kali app dibuka (startup).
   * Jika API mati, tetap izinkan masuk dengan status on_check.
   *
   * @returns {{ status, license?, message? }}
   */
  async verify() {
    const saved = this._loadLocal()
    if (!saved) return { status: null }   // Belum pernah aktivasi

    const result = await this._post('verify', {
      license_key: saved.licenseKey,
      device_id:   saved.deviceId,
      app: this.app,
    })

    if (result._networkError) {
      // API mati — pakai status yang tersimpan lokal, izinkan masuk
      if (saved.status === 'active' || saved.status === 'on_check') {
        this._saveLocal(saved.licenseKey, saved.deviceId, 'on_check')
        this._startRetry(saved.licenseKey, saved.deviceId)
        return { status: 'on_check' }
      }
    }

    if (result.success) {
      this._saveLocal(saved.licenseKey, saved.deviceId, 'active')
      this._stopRetry()
      return { status: 'active', license: result.license }
    }

    // Lisensi dicabut atau device dihapus admin
    this._clearLocal()
    this._stopRetry()
    return { status: result.code, message: result.message }
  }

  /**
   * Hapus data lisensi lokal (saat logout atau reset app).
   */
  clear() {
    this._clearLocal()
    this._stopRetry()
  }

  /**
   * Daftarkan callback yang dipanggil saat retry berhasil.
   * Berguna untuk memperbarui UI tanpa reload.
   *
   * @param {(license: object) => void} fn
   */
  onActivated(fn) {
    this._onActivated = fn
  }

  /* ── PRIVATE ─────────────────────────────────────────────── */

  async _post(action, body) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const resp = await fetch(`${LICENSE_API_BASE}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': LICENSE_API_KEY,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
      clearTimeout(timer)
      return await resp.json()
    } catch {
      clearTimeout(timer)
      return { success: false, _networkError: true }
    }
  }

  _startRetry(licenseKey, deviceId) {
    this._stopRetry()
    this._retryTimer = setInterval(async () => {
      const result = await this._post('verify', {
        license_key: licenseKey,
        device_id:   deviceId,
        app: this.app,
      })
      if (result.success) {
        this._saveLocal(licenseKey, deviceId, 'active')
        this._stopRetry()
        if (typeof this._onActivated === 'function') {
          this._onActivated(result.license)
        }
      }
      // Jika masih gagal → biarkan timer jalan, retry lagi 30 menit kemudian
    }, RETRY_INTERVAL_MS)
  }

  _stopRetry() {
    if (this._retryTimer) {
      clearInterval(this._retryTimer)
      this._retryTimer = null
    }
  }

  _saveLocal(licenseKey, deviceId, status) {
    try {
      localStorage.setItem('sn_license', JSON.stringify({
        licenseKey, deviceId, status, savedAt: Date.now(),
      }))
    } catch { /* storage penuh atau private mode */ }
  }

  _loadLocal() {
    try {
      return JSON.parse(localStorage.getItem('sn_license') || 'null')
    } catch { return null }
  }

  _clearLocal() {
    try { localStorage.removeItem('sn_license') } catch { /* ignore */ }
  }
}

// Export untuk module system (ES module / CommonJS)
if (typeof module !== 'undefined') module.exports = LicenseManager
if (typeof window !== 'undefined') window.LicenseManager = LicenseManager
