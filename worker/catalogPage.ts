import type { CatalogSubmission } from '../src/types'

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const isSafeImageUrl = (value: string | undefined): value is string => {
  if (!value) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export const buildWaLink = (whatsapp: string, message: string): string =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`

const getInitials = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

// Cycled by product index so cards read as distinct items at a glance,
// even when most submissions skip the optional product photo.
const MONOGRAM_PALETTE = [
  'linear-gradient(135deg, #0f766e, #14b8a6)',
  'linear-gradient(135deg, #0e7490, #22d3ee)',
  'linear-gradient(135deg, #b45309, #f59e0b)',
  'linear-gradient(135deg, #7e22ce, #c084fc)',
  'linear-gradient(135deg, #be123c, #fb7185)',
  'linear-gradient(135deg, #4338ca, #818cf8)',
]

export const renderCatalogPage = (data: CatalogSubmission): string => {
  const safeName = escapeHtml(data.businessName)
  const safeTagline = escapeHtml(data.tagline)
  const safeCity = escapeHtml(data.city)
  const initials = escapeHtml(getInitials(data.businessName))

  const productsHtml = data.products
    .map((product, index) => {
      const productName = escapeHtml(product.name)
      const productPrice = escapeHtml(product.price)
      const mediaHtml = isSafeImageUrl(product.imageUrl)
        ? `<img class="product__image" src="${escapeHtml(product.imageUrl)}" alt="${productName}" loading="lazy" />`
        : `<div class="product__monogram" style="background: ${MONOGRAM_PALETTE[index % MONOGRAM_PALETTE.length]}">${escapeHtml(getInitials(product.name))}</div>`

      return `
        <article class="product" style="animation-delay: ${index * 70}ms">
          ${mediaHtml}
          <h3>${productName}</h3>
          <p class="product__price">Rp ${productPrice}</p>
          <a class="order-btn" href="/k/${data.slug}/wa/${index}">
            <span aria-hidden="true">💬</span> Pesan via WhatsApp
          </a>
        </article>
      `
    })
    .join('')

  const productCountLabel =
    data.products.length === 1 ? '1 produk tersedia' : `${data.products.length} produk tersedia`

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeName}${safeTagline ? ` — ${safeTagline}` : ''}</title>
    <meta name="description" content="${safeTagline || `Katalog produk ${safeName}`}" />
    <meta property="og:title" content="${safeName}" />
    <meta property="og:description" content="${safeTagline}" />
    <meta property="og:type" content="website" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, sans-serif;
        background: #f1f5f9;
        color: #0f172a;
      }
      a { color: inherit; }
      .container { max-width: 760px; margin: 0 auto; padding: 0 1rem 6rem; }

      .hero {
        position: relative;
        overflow: hidden;
        margin: 0 -1rem 1.75rem;
        padding: 3rem 1.5rem 2.5rem;
        text-align: center;
        color: #fff;
        background: linear-gradient(150deg, #0f766e 0%, #0e7490 100%);
      }
      .hero__blob {
        position: absolute;
        width: 220px;
        height: 220px;
        border-radius: 999px;
        filter: blur(50px);
        opacity: 0.35;
        pointer-events: none;
      }
      .hero__blob--one { background: #5eead4; top: -70px; left: -60px; }
      .hero__blob--two { background: #67e8f9; bottom: -80px; right: -50px; }

      .avatar {
        position: relative;
        width: 72px;
        height: 72px;
        margin: 0 auto 1rem;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 800;
        background: rgba(255, 255, 255, 0.18);
        border: 2px solid rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(4px);
      }
      .hero h1 { position: relative; font-size: 1.75rem; margin: 0 0 0.35rem; }
      .hero p { position: relative; margin: 0.2rem 0; opacity: 0.92; }
      .hero__meta {
        position: relative;
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;
        margin-top: 0.75rem;
        font-size: 0.85rem;
        background: rgba(255, 255, 255, 0.16);
        padding: 0.3rem 0.8rem;
        border-radius: 999px;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
      }
      .product {
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        background: #fff;
        padding: 1rem;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        animation: rise-in 0.5s ease both;
      }
      .product:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px -12px rgba(15, 23, 42, 0.25);
        border-color: #99f6e4;
      }
      .product h3 { margin: 0 0 0.25rem; font-size: 1.05rem; }
      .product__image,
      .product__monogram {
        width: 100%;
        height: 140px;
        border-radius: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .product__image { object-fit: cover; }
      .product__monogram {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: 0.02em;
      }
      .product__price { font-weight: 700; color: #0f766e; margin: 0 0 0.75rem; }
      .order-btn {
        display: inline-flex;
        width: 100%;
        gap: 0.4rem;
        justify-content: center;
        align-items: center;
        padding: 0.6rem 1rem;
        border-radius: 0.6rem;
        background: #16a34a;
        color: #fff;
        font-weight: 600;
        text-decoration: none;
        transition: background 0.2s ease, transform 0.15s ease;
      }
      .order-btn:hover { background: #15803d; transform: translateY(-1px); }

      .share-bar {
        display: flex;
        justify-content: center;
        gap: 0.6rem;
        margin: 2rem 0 0.5rem;
      }
      .share-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 1rem;
        border-radius: 999px;
        border: 1px solid #cbd5e1;
        background: #fff;
        color: #334155;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        transition: border-color 0.2s ease, color 0.2s ease;
      }
      .share-btn:hover { border-color: #0f766e; color: #0f766e; }
      .share-btn[data-copied="true"] { border-color: #16a34a; color: #16a34a; }

      .wa-float {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.1rem;
        border-radius: 999px;
        background: #16a34a;
        color: #fff;
        font-weight: 700;
        text-decoration: none;
        box-shadow: 0 10px 24px -8px rgba(22, 163, 74, 0.6);
        transition: transform 0.2s ease;
      }
      .wa-float:hover { transform: translateY(-2px); }

      footer {
        text-align: center;
        margin-top: 2.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e2e8f0;
        color: #64748b;
        font-size: 0.875rem;
      }
      footer a { color: #115e59; font-weight: 700; text-decoration: none; }

      @keyframes rise-in {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (prefers-reduced-motion: reduce) {
        .product { animation: none; }
      }
    </style>
  </head>
  <body>
    <div class="hero">
      <div class="hero__blob hero__blob--one" aria-hidden="true"></div>
      <div class="hero__blob hero__blob--two" aria-hidden="true"></div>
      <div class="avatar" aria-hidden="true">${initials}</div>
      <h1>${safeName}</h1>
      ${safeTagline ? `<p>${safeTagline}</p>` : ''}
      ${safeCity ? `<span class="hero__meta">📍 ${safeCity}</span>` : ''}
    </div>

    <div class="container">
      <div class="grid">
        ${productsHtml}
      </div>

      <div class="share-bar">
        <button type="button" class="share-btn" id="share-btn">🔗 Bagikan Katalog</button>
      </div>

      <footer>
        ${productCountLabel} · Katalog ini dibuat gratis di
        <a href="https://nusakarya.id" target="_blank" rel="noopener noreferrer">NusaKarya</a>
      </footer>
    </div>

    <a
      class="wa-float"
      href="/k/${data.slug}/wa/chat"
      aria-label="Chat langsung via WhatsApp"
    >
      💬 Chat Sekarang
    </a>

    <script>
      (function () {
        var btn = document.getElementById('share-btn');
        if (!btn) return;
        btn.addEventListener('click', function () {
          var shareData = { title: document.title, url: window.location.href };
          if (navigator.share) {
            navigator.share(shareData).catch(function () {});
            return;
          }
          navigator.clipboard.writeText(window.location.href).then(function () {
            btn.textContent = '✓ Link tersalin';
            btn.setAttribute('data-copied', 'true');
            setTimeout(function () {
              btn.textContent = '🔗 Bagikan Katalog';
              btn.removeAttribute('data-copied');
            }, 2000);
          });
        });
      })();
    </script>
  </body>
</html>`
}
