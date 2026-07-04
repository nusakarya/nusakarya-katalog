export interface Env {
  CATALOG_KV: KVNamespace
  ASSETS: Fetcher
  // Firebase project ID and Web API key — public, not secrets (Firebase enforces
  // access via Auth rules and token verification, not by hiding these), but still
  // set via .dev.vars locally / `wrangler secret put` in production so the admin
  // page (public/admin.html) can fetch them from /api/config instead of being
  // hand-edited per environment.
  FIREBASE_PROJECT_ID: string
  FIREBASE_API_KEY: string
  // Only this email's Firebase account may use /api/admin/* — set via
  // `wrangler secret put ADMIN_EMAIL` in production, or `.dev.vars` locally.
  ADMIN_EMAIL: string
}
