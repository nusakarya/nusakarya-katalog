import type { CatalogSubmission } from '../src/types'
import { DEMO_SLUG } from './demoData'

// Slugs that must never be handed out to a real submission, so a business
// named e.g. "Contoh" can't shadow the fixed demo page at /k/contoh.
const RESERVED_SLUGS = new Set([DEMO_SLUG])

// Strips combining diacritics (U+0300-U+036F) left behind by NFKD normalization,
// e.g. turns "kopi susu" style accented input into plain ASCII for slugs.
const slugify = (input: string): string =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

const randomSuffix = (): string => Math.random().toString(36).slice(2, 6)

export const generateUniqueSlug = async (
  kv: KVNamespace,
  businessName: string,
): Promise<string> => {
  const base = slugify(businessName) || 'toko'
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = attempt === 0 && !RESERVED_SLUGS.has(base) ? base : `${base}-${randomSuffix()}`
    if (RESERVED_SLUGS.has(candidate)) continue
    const existing = await kv.get(`catalog:${candidate}`)
    if (!existing) return candidate
  }
  return `${base}-${randomSuffix()}${randomSuffix()}`
}

export const saveSubmission = async (
  kv: KVNamespace,
  submission: CatalogSubmission,
): Promise<void> => {
  await kv.put(`catalog:${submission.slug}`, JSON.stringify(submission))
}

export const getSubmission = async (
  kv: KVNamespace,
  slug: string,
): Promise<CatalogSubmission | null> => {
  const raw = await kv.get(`catalog:${slug}`)
  if (!raw) return null
  return JSON.parse(raw) as CatalogSubmission
}

// Read-then-write, not atomic — fine for approximate pilot analytics, not for anything
// that needs exact counts under concurrent load.
export const incrementCounter = async (kv: KVNamespace, key: string): Promise<void> => {
  const current = Number((await kv.get(key)) ?? '0')
  await kv.put(key, String(current + 1))
}

export const getCounter = async (kv: KVNamespace, key: string): Promise<number> =>
  Number((await kv.get(key)) ?? '0')

// KV list() caps at 1000 keys per call — fine for pilot scale, would need
// pagination (cursor) if this ever grows past that.
export const listSubmissions = async (kv: KVNamespace): Promise<CatalogSubmission[]> => {
  const { keys } = await kv.list({ prefix: 'catalog:' })
  const submissions = await Promise.all(
    keys.map(async (key) => {
      const raw = await kv.get(key.name)
      return raw ? (JSON.parse(raw) as CatalogSubmission) : null
    }),
  )
  return submissions.filter((submission): submission is CatalogSubmission => submission !== null)
}

export const deleteSubmission = async (kv: KVNamespace, slug: string): Promise<void> => {
  await Promise.all([
    kv.delete(`catalog:${slug}`),
    kv.delete(`counter:${slug}:views`),
    kv.delete(`counter:${slug}:clicks`),
    kv.delete(`counter:${slug}:chat_clicks`),
  ])
}

const RATE_LIMIT_MAX_PER_HOUR = 5

export const checkRateLimit = async (kv: KVNamespace, ip: string): Promise<boolean> => {
  const key = `ratelimit:${ip}`
  const current = Number((await kv.get(key)) ?? '0')
  if (current >= RATE_LIMIT_MAX_PER_HOUR) return false
  await kv.put(key, String(current + 1), { expirationTtl: 3600 })
  return true
}
