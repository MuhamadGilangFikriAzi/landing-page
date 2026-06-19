/**
 * SuruhNgoding — License API
 * Endpoint: POST /functions/v1/license/activate
 *           POST /functions/v1/license/verify
 *
 * Header wajib: x-api-key: <LICENSE_API_SECRET>
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/* ── Tipe ──────────────────────────────────────────────── */
interface ActivateBody {
  license_key: string  // contoh: SK-A1B2-C3D4-E5F6-G7H8
  device_id:   string  // UUID unik dari perangkat
  device_name: string  // contoh: Samsung Galaxy A34
  platform:    string  // android | ios | windows | macos | web
  app:         string  // suruhkelola | suruhlaundry
}

interface VerifyBody {
  license_key: string
  device_id:   string
  app:         string
}

/* ── Entry point ───────────────────────────────────────── */
Deno.serve(async (req: Request) => {
  // Pre-flight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const json = (data: object, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  // ── Auth ──────────────────────────────────────────────
  const secret = Deno.env.get('LICENSE_API_SECRET') ?? ''
  if (!secret || req.headers.get('x-api-key') !== secret) {
    return json({ success: false, code: 'unauthorized', message: 'API key tidak valid' }, 401)
  }

  // ── Routing  /functions/v1/license/<action> ───────────
  const action = new URL(req.url).pathname.split('/').pop()

  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return json({ success: false, code: 'bad_request', message: 'Body harus JSON' }, 400)
  }

  // Supabase pakai service role agar bisa bypass RLS dari Edge Function
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  )

  if (action === 'activate') return handleActivate(supabase, body as ActivateBody, json)
  if (action === 'verify')   return handleVerify(supabase, body as VerifyBody, json)

  return json({ success: false, code: 'not_found', message: 'Endpoint tidak ditemukan' }, 404)
})

/* ══════════════════════════════════════════════════════════
   ACTIVATE — daftarkan device ke license key
   ══════════════════════════════════════════════════════════ */
async function handleActivate(
  supabase: ReturnType<typeof createClient>,
  body: ActivateBody,
  json: (d: object, s?: number) => Response,
) {
  const { license_key, device_id, device_name, platform, app } = body

  if (!license_key || !device_id || !device_name || !platform || !app) {
    return json({
      success: false,
      code: 'missing_fields',
      message: 'Field wajib: license_key, device_id, device_name, platform, app',
    }, 400)
  }

  const key = license_key.trim().toUpperCase()

  // Validasi prefix key sesuai aplikasi
  const appProduct = app === 'suruhkelola' ? 'SuruhKelola' : 'SuruhLaundry'
  const expectedPrefix = app === 'suruhkelola' ? 'SK-' : 'SLNDRY-'
  if (!key.startsWith(expectedPrefix)) {
    return json({
      success: false,
      code: 'wrong_product',
      message: `License key ini bukan untuk ${appProduct}. Pastikan kamu memasukkan key yang benar.`,
    }, 400)
  }

  // Ambil lisensi + devices-nya
  const { data: license, error } = await supabase
    .from('licenses')
    .select('*, devices(*)')
    .eq('license_key', key)
    .single()

  if (error || !license) {
    return json({ success: false, code: 'not_found', message: 'License key tidak ditemukan' }, 404)
  }

  if (license.status !== 'active') {
    return json({
      success: false,
      code: 'inactive',
      message: 'Lisensi ini tidak aktif. Hubungi support SuruhNgoding.',
    }, 403)
  }

  if (license.product !== appProduct) {
    return json({
      success: false,
      code: 'wrong_product',
      message: `License key ini untuk ${license.product}, bukan ${appProduct}.`,
    }, 403)
  }

  const devices: any[] = license.devices ?? []
  const existing = devices.find((d: any) => d.device_id === device_id)

  // Device sudah terdaftar — perbarui last_seen saja
  if (existing) {
    await supabase
      .from('devices')
      .update({ last_seen: new Date().toISOString(), device_name })
      .eq('id', existing.id)

    return json({
      success: true,
      code: 'active',
      message: 'Lisensi aktif',
      license: buildLicenseInfo(license, devices.length),
    })
  }

  // Cek batas device (99 = unlimited)
  if (license.max_devices < 99 && devices.length >= license.max_devices) {
    return json({
      success: false,
      code: 'device_limit',
      message: `Batas device tercapai (${devices.length}/${license.max_devices}). ` +
               `Hapus device lama di admin panel atau hubungi support.`,
      license: buildLicenseInfo(license, devices.length),
    }, 403)
  }

  // Daftarkan device baru
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
    success: true,
    code: 'active',
    message: 'Lisensi berhasil diaktifkan!',
    license: buildLicenseInfo(license, devices.length + 1),
  })
}

/* ══════════════════════════════════════════════════════════
   VERIFY — cek status lisensi (dipakai untuk retry 30 menit)
   ══════════════════════════════════════════════════════════ */
async function handleVerify(
  supabase: ReturnType<typeof createClient>,
  body: VerifyBody,
  json: (d: object, s?: number) => Response,
) {
  const { license_key, device_id, app } = body

  if (!license_key || !device_id || !app) {
    return json({
      success: false,
      code: 'missing_fields',
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

  const devices: any[] = license.devices ?? []
  const registered = devices.find((d: any) => d.device_id === device_id)

  if (!registered) {
    return json({
      success: false,
      code: 'device_not_registered',
      message: 'Device tidak terdaftar. Lakukan aktivasi ulang.',
    }, 403)
  }

  // Perbarui last_seen
  await supabase
    .from('devices')
    .update({ last_seen: new Date().toISOString() })
    .eq('id', registered.id)

  return json({
    success: true,
    code: 'active',
    message: 'Lisensi valid',
    license: buildLicenseInfo(license, devices.length),
  })
}

/* ── Helper ────────────────────────────────────────────── */
function buildLicenseInfo(license: any, deviceCount: number) {
  return {
    product:      license.product,
    package:      license.package,
    owner_name:   license.owner_name,
    max_devices:  license.max_devices >= 99 ? 'unlimited' : license.max_devices,
    device_count: deviceCount,
    valid_until:  null,  // lifetime license
  }
}
