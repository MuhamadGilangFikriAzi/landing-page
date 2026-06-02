/**
 * SuruhNgoding — License API
 *
 * PUBLIC  endpoint (no auth):
 *   POST /functions/v1/license/demo
 *
 * PROTECTED endpoints (header: x-api-key: <LICENSE_API_SECRET>):
 *   POST /functions/v1/license/activate
 *   POST /functions/v1/license/verify
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/* ── Types ─────────────────────────────────────────── */
interface ActivateBody {
  license_key: string  // SK-A1B2-C3D4-E5F6-G7H8
  device_id:   string  // UUID unik perangkat
  device_name: string  // Samsung Galaxy A34
  platform:    string  // android | ios | windows | macos | web
  app:         string  // suruhkelola | suruhlaundry
}

interface VerifyBody {
  license_key: string
  device_id:   string
  app:         string
}

interface DemoBody {
  owner_name:    string
  owner_email:   string
  owner_phone:   string
  product:       string  // SuruhKelola | SuruhLaundry
  business_name: string
}

/* ── Entry point ───────────────────────────────────── */
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  const action = new URL(req.url).pathname.split('/').pop()

  // ── Public: /demo ──────────────────────────────────
  if (action === 'demo') {
    let body: DemoBody
    try { body = await req.json() } catch {
      return json({ success: false, code: 'bad_request', message: 'Body harus JSON' }, 400)
    }
    const supabase = makeClient()
    return handleDemo(supabase, body, json)
  }

  // ── Protected endpoints: require x-api-key ─────────
  const secret = Deno.env.get('LICENSE_API_SECRET') ?? ''
  if (!secret || req.headers.get('x-api-key') !== secret) {
    return json({ success: false, code: 'unauthorized', message: 'API key tidak valid' }, 401)
  }

  let body: Record<string, string>
  try { body = await req.json() } catch {
    return json({ success: false, code: 'bad_request', message: 'Body harus JSON' }, 400)
  }

  const supabase = makeClient()

  if (action === 'activate') return handleActivate(supabase, body as ActivateBody, json)
  if (action === 'verify')   return handleVerify(supabase, body as VerifyBody, json)

  return json({ success: false, code: 'not_found', message: 'Endpoint tidak ditemukan' }, 404)
})

function makeClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  )
}

/* ══════════════════════════════════════════════════════
   DEMO — buat trial license tanpa auth (public)
   ══════════════════════════════════════════════════════ */
async function handleDemo(
  supabase: ReturnType<typeof createClient>,
  body: DemoBody,
  json: (d: object, s?: number) => Response,
) {
  const { owner_name, owner_email, owner_phone, product, business_name } = body

  if (!owner_name?.trim() || !owner_email?.trim() || !product) {
    return json({
      success: false, code: 'missing_fields',
      message: 'Field wajib: owner_name, owner_email, product',
    }, 400)
  }

  if (!['SuruhKelola', 'SuruhLaundry'].includes(product)) {
    return json({ success: false, code: 'invalid_product', message: 'Produk tidak valid' }, 400)
  }

  const email = owner_email.trim().toLowerCase()

  // Cek apakah email sudah punya demo aktif untuk produk ini
  const { data: existing } = await supabase
    .from('licenses')
    .select('license_key, valid_until, status')
    .eq('owner_email', email)
    .eq('product', product)
    .eq('license_type', 'trial')
    .maybeSingle()

  if (existing && existing.valid_until && new Date(existing.valid_until) > new Date()) {
    await sendDemoEmail(email, owner_name.trim(), existing.license_key, product, existing.valid_until)
    return json({
      success: true,
      code: 'existing',
      message: 'Kamu sudah pernah meminta demo. License key dikirim ulang ke emailmu.',
      license_key: existing.license_key,
      valid_until: existing.valid_until,
    })
  }

  const licenseKey = generateKey(product)

  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 7)
  validUntil.setHours(23, 59, 59, 0)

  const { error } = await supabase.from('licenses').insert({
    license_key:  licenseKey,
    product,
    package:      'Starter',
    owner_name:   owner_name.trim(),
    owner_email:  email,
    owner_phone:  (owner_phone ?? '').trim(),
    status:       'active',
    license_type: 'trial',
    valid_until:  validUntil.toISOString(),
    max_devices:  1,
    notes:        `Demo via web. Bisnis: ${(business_name ?? '').trim() || '-'}`,
  })

  if (error) {
    console.error('Demo insert error:', error)
    return json({ success: false, code: 'server_error', message: 'Gagal membuat demo license.' }, 500)
  }

  await sendDemoEmail(email, owner_name.trim(), licenseKey, product, validUntil.toISOString())

  return json({
    success: true,
    code: 'created',
    message: 'License key demo berhasil dibuat! Cek emailmu.',
    license_key: licenseKey,
    valid_until: validUntil.toISOString(),
  })
}

/* ══════════════════════════════════════════════════════
   ACTIVATE — daftarkan device ke license key
   ══════════════════════════════════════════════════════ */
async function handleActivate(
  supabase: ReturnType<typeof createClient>,
  body: ActivateBody,
  json: (d: object, s?: number) => Response,
) {
  const { license_key, device_id, device_name, platform, app } = body

  if (!license_key || !device_id || !device_name || !platform || !app) {
    return json({
      success: false, code: 'missing_fields',
      message: 'Field wajib: license_key, device_id, device_name, platform, app',
    }, 400)
  }

  const key = license_key.trim().toUpperCase()

  const appProduct     = app === 'suruhkelola' ? 'SuruhKelola' : 'SuruhLaundry'
  const expectedPrefix = app === 'suruhkelola' ? 'SK-' : 'SLNDRY-'
  if (!key.startsWith(expectedPrefix)) {
    return json({
      success: false, code: 'wrong_product',
      message: `License key ini bukan untuk ${appProduct}. Pastikan kamu memasukkan key yang benar.`,
    }, 400)
  }

  const { data: license, error } = await supabase
    .from('licenses')
    .select('*, devices(*)')
    .eq('license_key', key)
    .single()

  if (error || !license) {
    return json({ success: false, code: 'not_found', message: 'License key tidak ditemukan' }, 404)
  }

  if (license.status !== 'active') {
    return json({ success: false, code: 'inactive', message: 'Lisensi ini tidak aktif. Hubungi support SuruhNgoding.' }, 403)
  }

  if (license.valid_until && new Date(license.valid_until) < new Date()) {
    return json({
      success: false, code: 'expired',
      message: 'Masa berlaku lisensi telah habis. Hubungi support SuruhNgoding untuk perpanjangan.',
      expired_at: license.valid_until,
    }, 403)
  }

  if (license.product !== appProduct) {
    return json({
      success: false, code: 'wrong_product',
      message: `License key ini untuk ${license.product}, bukan ${appProduct}.`,
    }, 403)
  }

  const devices: any[] = license.devices ?? []
  const existing = devices.find((d: any) => d.device_id === device_id)

  if (existing) {
    await supabase.from('devices')
      .update({ last_seen: new Date().toISOString(), device_name })
      .eq('id', existing.id)
    return json({
      success: true, code: 'active', message: 'Lisensi aktif',
      license: buildLicenseInfo(license, devices.length),
    })
  }

  if (license.max_devices < 99 && devices.length >= license.max_devices) {
    return json({
      success: false, code: 'device_limit',
      message: `Batas device tercapai (${devices.length}/${license.max_devices}). Hapus device lama di admin panel atau hubungi support.`,
      license: buildLicenseInfo(license, devices.length),
    }, 403)
  }

  const { error: insertErr } = await supabase.from('devices').insert({
    license_id:   license.id,
    device_id,
    device_name,
    platform,
    last_seen:    new Date().toISOString(),
    activated_at: new Date().toISOString(),
  })

  if (insertErr) {
    return json({ success: false, code: 'server_error', message: 'Gagal mendaftarkan device.' }, 500)
  }

  return json({
    success: true, code: 'active', message: 'Lisensi berhasil diaktifkan!',
    license: buildLicenseInfo(license, devices.length + 1),
  })
}

/* ══════════════════════════════════════════════════════
   VERIFY — cek status lisensi (dipakai setiap startup)
   ══════════════════════════════════════════════════════ */
async function handleVerify(
  supabase: ReturnType<typeof createClient>,
  body: VerifyBody,
  json: (d: object, s?: number) => Response,
) {
  const { license_key, device_id, app } = body

  if (!license_key || !device_id || !app) {
    return json({
      success: false, code: 'missing_fields',
      message: 'Field wajib: license_key, device_id, app',
    }, 400)
  }

  const key = license_key.trim().toUpperCase()

  const { data: license } = await supabase
    .from('licenses')
    .select('*, devices(*)')
    .eq('license_key', key)
    .single()

  if (!license) {
    return json({ success: false, code: 'not_found', message: 'License key tidak ditemukan' }, 404)
  }

  if (license.status !== 'active') {
    return json({ success: false, code: 'inactive', message: 'Lisensi tidak aktif' }, 403)
  }

  if (license.valid_until && new Date(license.valid_until) < new Date()) {
    return json({
      success: false, code: 'expired',
      message: 'Masa berlaku lisensi telah habis. Hubungi support untuk perpanjangan.',
      expired_at: license.valid_until,
    }, 403)
  }

  const devices: any[] = license.devices ?? []
  const registered = devices.find((d: any) => d.device_id === device_id)

  if (!registered) {
    return json({
      success: false, code: 'device_not_registered',
      message: 'Device tidak terdaftar. Lakukan aktivasi ulang.',
    }, 403)
  }

  await supabase.from('devices')
    .update({ last_seen: new Date().toISOString() })
    .eq('id', registered.id)

  return json({
    success: true, code: 'active', message: 'Lisensi valid',
    license: buildLicenseInfo(license, devices.length),
  })
}

/* ── Helpers ────────────────────────────────────────── */
function buildLicenseInfo(license: any, deviceCount: number) {
  return {
    product:      license.product,
    package:      license.package,
    owner_name:   license.owner_name,
    license_type: license.license_type ?? 'lifetime',
    max_devices:  license.max_devices >= 99 ? 'unlimited' : license.max_devices,
    device_count: deviceCount,
    valid_until:  license.valid_until ?? null,
  }
}

function generateKey(product: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const seg = (len = 4) => {
    const buf = new Uint8Array(len)
    crypto.getRandomValues(buf)
    return Array.from(buf).map(b => chars[b % chars.length]).join('')
  }
  return product === 'SuruhLaundry'
    ? `SLNDRY-${seg()}-${seg()}-${seg()}-${seg()}`
    : `SK-${seg()}-${seg()}-${seg()}-${seg()}`
}

/* ── Email via Resend (opsional) ─────────────────────
   Set env var RESEND_API_KEY di Supabase untuk mengaktifkan.
   Kalau tidak diset, email dilewati tanpa error.
   ────────────────────────────────────────────────── */
async function sendDemoEmail(
  to: string,
  name: string,
  licenseKey: string,
  product: string,
  validUntil: string,
) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return

  const validStr = new Date(validUntil).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const html = `<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#2d2d4a;background:#f5f5fb;">
  <div style="background:#ffffff;border-radius:16px;padding:32px;border:1.5px solid #e5e5f0;">
    <h2 style="color:#000069;margin:0 0 8px;">&#128273; License Key Demo ${product}mu Siap!</h2>
    <p>Halo <strong>${name}</strong>!</p>
    <p>Berikut license key trial kamu &#8212; berlaku <strong>7 hari</strong>:</p>
    <div style="background:#000069;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
      <span style="font-family:'Courier New',monospace;font-size:20px;font-weight:bold;color:#4DCFFF;letter-spacing:0.1em;">${licenseKey}</span>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td style="padding:6px 0;color:#6b6b8a;font-size:14px;">&#128197; Berlaku sampai</td><td style="padding:6px 0;font-weight:600;font-size:14px;">${validStr}</td></tr>
      <tr><td style="padding:6px 0;color:#6b6b8a;font-size:14px;">&#128241; Kuota device</td><td style="padding:6px 0;font-weight:600;font-size:14px;">1 device</td></tr>
      <tr><td style="padding:6px 0;color:#6b6b8a;font-size:14px;">&#127873; Paket</td><td style="padding:6px 0;font-weight:600;font-size:14px;">Starter (Trial)</td></tr>
    </table>
    <p style="font-weight:700;margin-bottom:8px;">Cara aktivasi:</p>
    <ol style="margin:0 0 20px;padding-left:20px;line-height:1.8;">
      <li>Buka aplikasi <strong>${product}</strong></li>
      <li>Buka menu <strong>Pengaturan &#8594; Aktivasi Lisensi</strong></li>
      <li>Masukkan license key di atas</li>
    </ol>
    <a href="https://suruhngoding.com/beli.html" style="display:inline-block;background:linear-gradient(135deg,#0067D1,#000069);color:white;text-decoration:none;border-radius:10px;padding:12px 24px;font-weight:700;font-size:14px;">Puas? Beli Lisensi Selamanya &#8594;</a>
    <hr style="border:1px solid #e5e5f0;margin:24px 0 16px;">
    <p style="color:#a3a3bc;font-size:12px;margin:0;">Tim SuruhNgoding &bull; <a href="https://suruhngoding.com" style="color:#0067D1;">suruhngoding.com</a></p>
  </div>
</body></html>`

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'SuruhNgoding <noreply@suruhngoding.com>',
        to:      [to],
        subject: `License Key Demo ${product}mu Sudah Siap!`,
        html,
      }),
    })
  } catch (err) {
    console.error('Email send failed:', err)
  }
}
