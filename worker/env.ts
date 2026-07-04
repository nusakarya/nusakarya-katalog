export interface Env {
  CATALOG_KV: KVNamespace
  ASSETS: Fetcher
  // Firebase project ID (e.g. "nusakarya-katalog-admin") — public, not a secret,
  // but still set via .dev.vars locally / `wrangler secret put` in production
  // so it isn't hardcoded across environments.
  FIREBASE_PROJECT_ID: string
  // Only this email's Firebase account may use /api/admin/* — set via
  // `wrangler secret put ADMIN_EMAIL` in production, or `.dev.vars` locally.
  ADMIN_EMAIL: string
}
