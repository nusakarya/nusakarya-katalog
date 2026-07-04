import type { CatalogSubmission, CreateCatalogPayload, CreateCatalogResponse } from '../src/types'
import type { Env } from './env'
import { buildWaLink, renderCatalogPage } from './catalogPage'
import { checkRateLimit, generateUniqueSlug, getSubmission, incrementCounter, saveSubmission } from './storage'

const MAX_PRODUCTS = 6
const WHATSAPP_PATTERN = /^62\d{8,13}$/

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
  if (!Array.isArray(payload.products) || payload.products.length === 0) {
    return 'Isi minimal 1 produk.'
  }
  if (payload.products.length > MAX_PRODUCTS) {
    return `Maksimal ${MAX_PRODUCTS} produk.`
  }
  for (const product of payload.products) {
    if (!product.name?.trim() || product.name.length > 60) return 'Nama produk tidak valid.'
    if (!product.price?.trim() || product.price.length > 20) return 'Harga produk tidak valid.'
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
  const submission = await getSubmission(env.CATALOG_KV, slug)
  if (!submission) {
    return new Response('Katalog tidak ditemukan.', { status: 404 })
  }
  await incrementCounter(env.CATALOG_KV, `counter:${slug}:views`)
  return new Response(renderCatalogPage(submission), {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
  })
}

const handleWaRedirect = async (slug: string, productIndex: number, env: Env): Promise<Response> => {
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
  const submission = await getSubmission(env.CATALOG_KV, slug)
  if (!submission) {
    return new Response('Katalog tidak ditemukan.', { status: 404 })
  }
  await incrementCounter(env.CATALOG_KV, `counter:${slug}:chat_clicks`)
  const message = `Halo ${submission.businessName}, saya lihat katalog Anda dan ingin tanya-tanya.`
  return Response.redirect(buildWaLink(submission.whatsapp, message), 302)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/catalog' && request.method === 'POST') {
      return handleCreateCatalog(request, env)
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
