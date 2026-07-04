import { MAX_PRODUCTS } from '../src/constants'
import type { CatalogSubmission, CatalogSummary, CreateCatalogPayload, CreateCatalogResponse } from '../src/types'
import type { Env } from './env'
import { buildWaLink, renderCatalogPage } from './catalogPage'
import { DEMO_SLUG, DEMO_SUBMISSION, NUSAKARYA_WHATSAPP } from './demoData'
import { verifyFirebaseIdToken } from './firebaseAuth'
import {
  checkRateLimit,
  deleteSubmission,
  generateUniqueSlug,
  getCounter,
  getSubmission,
  incrementCounter,
  listSubmissions,
  saveSubmission,
} from './storage'

const WHATSAPP_PATTERN = /^62\d{8,13}$/
const MAPS_URL_MAX_LENGTH = 300

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const validatePayload = (payload: CreateCatalogPayload): string => {
  if (payload.website) return 'invalid submission'
  if (!payload.businessName?.trim() || payload.businessName.length > 80) {
    return 'Nama usaha wajib diisi (maks 80 karakter).'
  }
  if (!WHATSAPP_PATTERN.test(payload.whatsapp?.trim() ?? '')) {
    return 'Nomor WhatsApp tidak valid.'
  }
  if (payload.tagline && payload.tagline.length > 140) return 'Tagline terlalu panjang.'
  if (payload.city && payload.city.length > 60) return 'Nama kota terlalu panjang.'
  if (payload.mapsUrl) {
    if (payload.mapsUrl.length > MAPS_URL_MAX_LENGTH) return 'Link Google Maps terlalu panjang.'
    try {
      const parsed = new URL(payload.mapsUrl)
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return 'Link Google Maps tidak valid.'
      }
    } catch {
      return 'Link Google Maps tidak valid.'
    }
  }
  if (!Array.isArray(payload.products) || payload.products.length === 0) {
    return 'Isi minimal 1 produk.'
  }
  if (payload.products.length > MAX_PRODUCTS) {
    return `Maksimal ${MAX_PRODUCTS} produk.`
  }
  for (const product of payload.products) {
    if (!product.name?.trim() || product.name.length > 60) return 'Nama produk tidak valid.'
    if (!product.price?.trim() || product.price.length > 20) return 'Harga produk tidak valid.'
    if (product.imageUrl && product.imageUrl.length > 500) return 'URL foto produk terlalu panjang.'
  }
  return ''
}

const handleCreateCatalog = async (request: Request, env: Env): Promise<Response> => {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown'
  const withinLimit = await checkRateLimit(env.CATALOG_KV, ip)
  if (!withinLimit) {
    return jsonResponse({ message: 'Terlalu banyak percobaan. Coba lagi nanti.' }, 429)
  }

  let payload: CreateCatalogPayload
  try {
    payload = await request.json()
  } catch {
    return jsonResponse({ message: 'Payload tidak valid.' }, 400)
  }

  const validationError = validatePayload(payload)
  if (validationError) {
    return jsonResponse({ message: validationError }, 400)
  }

  const slug = await generateUniqueSlug(env.CATALOG_KV, payload.businessName.trim())
  const submission: CatalogSubmission = {
    slug,
    businessName: payload.businessName.trim(),
    tagline: payload.tagline?.trim() ?? '',
    whatsapp: payload.whatsapp.trim(),
    city: payload.city?.trim() ?? '',
    mapsUrl: payload.mapsUrl?.trim() || undefined,
    products: payload.products.map((product) => ({
      name: product.name.trim(),
      price: product.price.trim(),
      imageUrl: product.imageUrl?.trim() || undefined,
    })),
    createdAt: Date.now(),
  }

  await saveSubmission(env.CATALOG_KV, submission)

  const url = new URL(request.url)
  const response: CreateCatalogResponse = {
    slug,
    url: `${url.origin}/k/${slug}`,
  }
  return jsonResponse(response, 201)
}

const handleCatalogPage = async (slug: string, env: Env): Promise<Response> => {
  if (slug === DEMO_SLUG) {
    return new Response(renderCatalogPage(DEMO_SUBMISSION, { isDemo: true }), {
      headers: { 'Content-Type': 'text/html; charset=UTF-8' },
    })
  }

  const submission = await getSubmission(env.CATALOG_KV, slug)
  if (!submission) {
    return new Response('Katalog tidak ditemukan.', { status: 404 })
  }
  await incrementCounter(env.CATALOG_KV, `counter:${slug}:views`)
  return new Response(renderCatalogPage(submission), {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
  })
}

// Demo clicks never reach a real UMKM's WhatsApp — they route to NusaKarya's own
// number with a message about creating a catalog, regardless of which product/button
// was clicked, so the example page doubles as a lead-gen path.
const DEMO_WA_MESSAGE = 'Halo NusaKarya, saya lihat contoh katalog dan tertarik buat punya sendiri.'

const handleWaRedirect = async (slug: string, productIndex: number, env: Env): Promise<Response> => {
  if (slug === DEMO_SLUG) {
    return Response.redirect(buildWaLink(NUSAKARYA_WHATSAPP, DEMO_WA_MESSAGE), 302)
  }

  const submission = await getSubmission(env.CATALOG_KV, slug)
  if (!submission) {
    return new Response('Katalog tidak ditemukan.', { status: 404 })
  }
  const product = submission.products[productIndex]
  if (!product) {
    return new Response('Produk tidak ditemukan.', { status: 404 })
  }
  await incrementCounter(env.CATALOG_KV, `counter:${slug}:clicks`)
  const message = `Halo ${submission.businessName}, saya ingin pesan ${product.name}.`
  return Response.redirect(buildWaLink(submission.whatsapp, message), 302)
}

const handleWaChatRedirect = async (slug: string, env: Env): Promise<Response> => {
  if (slug === DEMO_SLUG) {
    return Response.redirect(buildWaLink(NUSAKARYA_WHATSAPP, DEMO_WA_MESSAGE), 302)
  }

  const submission = await getSubmission(env.CATALOG_KV, slug)
  if (!submission) {
    return new Response('Katalog tidak ditemukan.', { status: 404 })
  }
  await incrementCounter(env.CATALOG_KV, `counter:${slug}:chat_clicks`)
  const message = `Halo ${submission.businessName}, saya lihat katalog Anda dan ingin tanya-tanya.`
  return Response.redirect(buildWaLink(submission.whatsapp, message), 302)
}

type AdminAuthResult = { authorized: true } | { authorized: false; reason: string }

// Only a Firebase-authenticated user whose email matches env.ADMIN_EMAIL may
// call /api/admin/*. There's no user-management UI — this is a single-admin
// allowlist, not a general auth system. Returns a specific reason so a
// "logged in but still 401" case (wrong ADMIN_EMAIL vs. the account used to
// sign in) is distinguishable from an actually invalid/expired token.
const checkAdminAuth = async (request: Request, env: Env): Promise<AdminAuthResult> => {
  if (!env.ADMIN_EMAIL || !env.FIREBASE_PROJECT_ID) {
    return { authorized: false, reason: 'Admin belum dikonfigurasi di server (ADMIN_EMAIL/FIREBASE_PROJECT_ID kosong).' }
  }
  const header = request.headers.get('authorization') ?? ''
  const idToken = header.replace(/^Bearer\s+/i, '')
  if (!idToken) return { authorized: false, reason: 'Token tidak ditemukan.' }
  const identity = await verifyFirebaseIdToken(idToken, env.FIREBASE_PROJECT_ID)
  if (!identity) return { authorized: false, reason: 'Token tidak valid atau kedaluwarsa.' }
  if (!identity.email || identity.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    return { authorized: false, reason: 'Email akun ini tidak terdaftar sebagai admin di server.' }
  }
  return { authorized: true }
}

const handleListCatalogs = async (env: Env): Promise<Response> => {
  const submissions = await listSubmissions(env.CATALOG_KV)
  const summaries: CatalogSummary[] = await Promise.all(
    submissions
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(async (submission) => ({
        slug: submission.slug,
        businessName: submission.businessName,
        whatsapp: submission.whatsapp,
        city: submission.city,
        productCount: submission.products.length,
        createdAt: submission.createdAt,
        views: await getCounter(env.CATALOG_KV, `counter:${submission.slug}:views`),
        clicks: await getCounter(env.CATALOG_KV, `counter:${submission.slug}:clicks`),
        chatClicks: await getCounter(env.CATALOG_KV, `counter:${submission.slug}:chat_clicks`),
      })),
  )
  return jsonResponse(summaries)
}

const handleDeleteCatalog = async (slug: string, env: Env): Promise<Response> => {
  await deleteSubmission(env.CATALOG_KV, slug)
  return new Response(null, { status: 204 })
}

const csvEscape = (value: string): string =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

const EXPORT_COLUMNS = [
  'slug',
  'businessName',
  'tagline',
  'whatsapp',
  'city',
  'mapsUrl',
  'productCount',
  'products',
  'createdAt',
  'views',
  'clicks',
  'chatClicks',
] as const

const handleExportCatalogs = async (request: Request, env: Env): Promise<Response> => {
  const submissions = await listSubmissions(env.CATALOG_KV)
  submissions.sort((a, b) => b.createdAt - a.createdAt)

  const records = await Promise.all(
    submissions.map(async (submission) => ({
      slug: submission.slug,
      businessName: submission.businessName,
      tagline: submission.tagline,
      whatsapp: submission.whatsapp,
      city: submission.city,
      mapsUrl: submission.mapsUrl ?? '',
      productCount: submission.products.length,
      products: submission.products.map((p) => `${p.name} (Rp ${p.price})`).join(' | '),
      createdAt: new Date(submission.createdAt).toISOString(),
      views: await getCounter(env.CATALOG_KV, `counter:${submission.slug}:views`),
      clicks: await getCounter(env.CATALOG_KV, `counter:${submission.slug}:clicks`),
      chatClicks: await getCounter(env.CATALOG_KV, `counter:${submission.slug}:chat_clicks`),
    })),
  )

  const format = new URL(request.url).searchParams.get('format') === 'csv' ? 'csv' : 'json'
  const filenameDate = new Date().toISOString().slice(0, 10)

  if (format === 'csv') {
    const lines = [
      EXPORT_COLUMNS.join(','),
      ...records.map((record) =>
        EXPORT_COLUMNS.map((column) => csvEscape(String(record[column]))).join(','),
      ),
    ]
    return new Response(lines.join('\r\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=UTF-8',
        'Content-Disposition': `attachment; filename="katalog-export-${filenameDate}.csv"`,
      },
    })
  }

  return new Response(JSON.stringify(records, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="katalog-export-${filenameDate}.json"`,
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // The zone's dashboard-level "Always Use HTTPS" toggle isn't reachable with
    // the API token this project deploys with, so it's enforced here instead —
    // this is authoritative either way and doesn't depend on that setting.
    if (url.protocol === 'http:') {
      url.protocol = 'https:'
      return Response.redirect(url.toString(), 301)
    }

    if (url.pathname === '/api/catalog' && request.method === 'POST') {
      return handleCreateCatalog(request, env)
    }

    // Public on purpose: a Firebase Web API key + project ID are not secrets
    // (see Env comment). This just lets public/admin.html avoid hand-edited
    // per-environment constants.
    if (url.pathname === '/api/config' && request.method === 'GET') {
      return jsonResponse({
        firebaseApiKey: env.FIREBASE_API_KEY,
        firebaseProjectId: env.FIREBASE_PROJECT_ID,
      })
    }

    if (url.pathname.startsWith('/api/admin/')) {
      const auth = await checkAdminAuth(request, env)
      if (!auth.authorized) {
        return jsonResponse({ message: auth.reason }, 401)
      }
      if (url.pathname === '/api/admin/catalogs/export' && request.method === 'GET') {
        return handleExportCatalogs(request, env)
      }
      if (url.pathname === '/api/admin/catalogs' && request.method === 'GET') {
        return handleListCatalogs(env)
      }
      const adminDeleteMatch = url.pathname.match(/^\/api\/admin\/catalogs\/([a-z0-9-]+)$/)
      if (adminDeleteMatch && request.method === 'DELETE') {
        return handleDeleteCatalog(adminDeleteMatch[1], env)
      }
      return jsonResponse({ message: 'Not found' }, 404)
    }

    const waChatMatch = url.pathname.match(/^\/k\/([a-z0-9-]+)\/wa\/chat$/)
    if (waChatMatch) {
      return handleWaChatRedirect(waChatMatch[1], env)
    }

    const waMatch = url.pathname.match(/^\/k\/([a-z0-9-]+)\/wa\/(\d+)$/)
    if (waMatch) {
      return handleWaRedirect(waMatch[1], Number(waMatch[2]), env)
    }

    const catalogMatch = url.pathname.match(/^\/k\/([a-z0-9-]+)$/)
    if (catalogMatch) {
      return handleCatalogPage(catalogMatch[1], env)
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
