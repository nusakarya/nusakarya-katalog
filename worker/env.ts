export interface Env {
  CATALOG_KV: KVNamespace
  ASSETS: Fetcher
  // Set via `wrangler secret put ADMIN_TOKEN` in production, or a local
  // `.dev.vars` file (gitignored) for `wrangler dev` — never commit this value.
  ADMIN_TOKEN: string
}
