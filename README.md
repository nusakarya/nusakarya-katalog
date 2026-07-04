# NusaKarya Katalog

Free instant catalog page generator for UMKM — a pilot project that doubles as
a lead-gen funnel for [NusaKarya](https://nusakarya.id). A business fills a
short form and gets a shareable catalog page (`/k/:slug`) with WhatsApp order
buttons and a QR code, no website of their own required.

## Stack

- **Frontend**: Vue 3 + Vite + Tailwind (the form/builder at `/`)
- **Backend**: a single Cloudflare Worker (`worker/index.ts`) serving the API,
  the public catalog pages, and the built SPA (via Workers Static Assets)
- **Storage**: Cloudflare KV (submissions + view/click counters)
- **Admin**: `/admin` — Firebase Authentication–gated dashboard (list, delete,
  export CSV/JSON)

## Local development

```bash
npm install
npm run build          # builds the Vue app into dist/
npm run worker:dev      # wrangler dev — serves everything on one port
```

Open `http://localhost:8787`. The form posts to `/api/catalog`; generated
pages are at `/k/:slug`; the demo page is always at `/k/contoh`; the admin
dashboard is at `/admin`.

For iterating on the form UI alone with hot reload, `npm run dev` also works
(Vite on its own port), but the API calls will 404 there — use
`npm run worker:dev` to exercise the full flow.

### Local secrets

Copy `.dev.vars.example` to `.dev.vars` (gitignored) and fill in real values:

```
FIREBASE_PROJECT_ID=...
FIREBASE_API_KEY=...
ADMIN_EMAIL=...
```

## Deploying

See the Cloudflare setup steps below. Once configured:

```bash
npm run deploy   # builds, then `wrangler deploy`
```

## Project layout

```
src/           Vue form (the catalog builder UI)
worker/        Cloudflare Worker: API, catalog page rendering, admin routes
public/        Static assets served as-is (favicon, admin.html)
```

Key files if you're changing behavior:

- `src/constants.ts` — `MAX_PRODUCTS`, shared by the form and the API validator
- `worker/storage.ts` — all KV reads/writes (submissions, counters, rate limit)
- `worker/catalogPage.ts` — the public catalog page HTML template
- `worker/demoData.ts` — the fixed `/k/contoh` demo data
- `worker/firebaseAuth.ts` — verifies Firebase ID tokens against Google's JWKS
  (Workers can't run the firebase-admin SDK)
