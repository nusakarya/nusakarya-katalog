import type { CatalogSubmission } from '../src/types'

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
    const candidate = attempt === 0 ? base : `${base}-${randomSuffix()}`
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

const RATE_LIMIT_MAX_PER_HOUR = 5

export const checkRateLimit = async (kv: KVNamespace, ip: string): Promise<boolean> => {
  const key = `ratelimit:${ip}`
  const current = Number((await kv.get(key)) ?? '0')
  if (current >= RATE_LIMIT_MAX_PER_HOUR) return false
  await kv.put(key, String(current + 1), { expirationTtl: 3600 })
  return true
}
