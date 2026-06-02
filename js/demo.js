/* ════════════════════════════════════════════════════
   SuruhNgoding — Demo Page
   Ganti DEMO_API_BASE dengan URL Supabase project kamu
   ════════════════════════════════════════════════════ */

const DEMO_API_BASE    = 'https://<project-ref>.supabase.co/functions/v1/license'
const ADMIN_WA_NUMBER  = '62881080608167'

let selectedProduct = ''

/* ── Product selector ─────────────────────────────── */
function selectProduct(product) {
  selectedProduct = product
  document.getElementById('d-produk').value = product
  document.getElementById('card-sk').classList.toggle('selected', product === 'SuruhKelola')
  document.getElementById('card-sl').classList.toggle('selected', product === 'SuruhLaundry')
  hideError()
}

/* ── Form submit ──────────────────────────────────── */
async function submitDemo(event) {
  event.preventDefault()

  if (!selectedProduct) {
    showError('Pilih produk terlebih dahulu — SuruhKelola atau SuruhLaundry.')
    return
  }

  const nama   = document.getElementById('d-nama').value.trim()
  const bisnis = document.getElementById('d-bisnis').value.trim()
  const email  = document.getElementById('d-email').value.trim()
  const wa     = document.getElementById('d-wa').value.trim()

  setLoading(true)
  hideError()

  try {
    const resp = await fetch(`${DEMO_API_BASE}/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_name:    nama,
        owner_email:   email,
        owner_phone:   wa,
        product:       selectedProduct,
        business_name: bisnis,
      }),
    })

    const data = await resp.json()

    if (data.success) {
      showResult(data, nama, wa)
    } else {
      showError(data.message || 'Terjadi kesalahan. Coba lagi atau hubungi admin via WhatsApp.')
    }
  } catch {
    showError('Tidak dapat terhubung ke server. Coba lagi atau hubungi admin via WhatsApp.')
  } finally {
    setLoading(false)
  }
}

/* ── Show result state ────────────────────────────── */
function showResult(data, nama, waNumber) {
  const { license_key, valid_until, code } = data

  // Fill result
  document.getElementById('result-nama').textContent = nama
  document.getElementById('result-key-display').textContent = license_key
  document.getElementById('result-valid-until').textContent = formatDate(valid_until)
  document.getElementById('result-product-tag').innerHTML =
    `<i class="fa-solid fa-tag"></i> ${selectedProduct}`

  // Email note
  const emailNote = document.getElementById('email-note')
  if (code === 'existing') {
    emailNote.textContent = 'Kamu sudah pernah request demo. Detail dikirim ulang ke emailmu.'
  } else {
    emailNote.textContent = 'Detail license juga dikirim ke emailmu (jika layanan email dikonfigurasi admin).'
  }

  // WA share — normalise number: 081xxx → 6281xxx
  const waClean = waNumber.replace(/[^0-9]/g, '').replace(/^0/, '62')
  const waMsg = encodeURIComponent(
    `🔑 *License Key Demo ${selectedProduct}*\n\n` +
    `Halo ${nama}!\n\n` +
    `License key trial kamu:\n` +
    `*${license_key}*\n\n` +
    `📅 Berlaku sampai: ${formatDate(valid_until)}\n` +
    `📱 Kuota: 1 device · Starter\n\n` +
    `*Cara aktivasi:*\n` +
    `1. Buka aplikasi ${selectedProduct}\n` +
    `2. Pengaturan → Aktivasi Lisensi\n` +
    `3. Masukkan key di atas\n\n` +
    `Puas? Beli selamanya di suruhngoding.com/beli.html\n` +
    `— SuruhNgoding`
  )

  const adminMsg = encodeURIComponent(
    `Halo SuruhNgoding! Saya baru saja coba demo *${selectedProduct}*.\n\n` +
    `Nama: ${nama}\n` +
    `WA: ${waNumber}\n\n` +
    `Saya ingin tanya lebih lanjut tentang lisensi.`
  )

  document.getElementById('btn-wa-user').href  = `https://wa.me/${waClean}?text=${waMsg}`
  document.getElementById('btn-wa-admin').href = `https://wa.me/${ADMIN_WA_NUMBER}?text=${adminMsg}`

  // Switch view
  document.getElementById('demo-form-wrap').style.display  = 'none'
  document.getElementById('demo-result-wrap').style.display = 'block'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/* ── Copy license key ─────────────────────────────── */
function copyKey() {
  const key = document.getElementById('result-key-display').textContent
  const btn = document.getElementById('btn-copy-key')
  const done = () => {
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Tersalin!'
    setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-copy"></i> Salin' }, 2200)
    showToast('License key disalin ke clipboard.', 'success')
  }

  if (navigator.clipboard) {
    navigator.clipboard.writeText(key).then(done).catch(() => fallbackCopy(key, done))
  } else {
    fallbackCopy(key, done)
  }
}

function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'; ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
  callback()
}

/* ── UI helpers ───────────────────────────────────── */
function setLoading(on) {
  const btn = document.getElementById('btn-submit')
  btn.disabled = on
  btn.innerHTML = on
    ? '<i class="fa-solid fa-spinner fa-spin"></i> Memproses…'
    : '<i class="fa-solid fa-wand-magic-sparkles"></i> Aktifkan License Demo Gratis'
}

function showError(msg) {
  const el = document.getElementById('error-msg')
  el.textContent = msg
  el.style.display = 'block'
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

function hideError() {
  document.getElementById('error-msg').style.display = 'none'
}
