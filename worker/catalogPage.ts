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

export const renderCatalogPage = (data: CatalogSubmission): string => {
  const safeName = escapeHtml(data.businessName)
  const safeTagline = escapeHtml(data.tagline)
  const safeCity = escapeHtml(data.city)

  const productsHtml = data.products
    .map((product, index) => {
      const productName = escapeHtml(product.name)
      const productPrice = escapeHtml(product.price)
      const imageHtml = isSafeImageUrl(product.imageUrl)
        ? `<img class="product__image" src="${escapeHtml(product.imageUrl)}" alt="${productName}" loading="lazy" />`
        : ''

      return `
        <article class="product">
          ${imageHtml}
          <h3>${productName}</h3>
          <p class="product__price">Rp ${productPrice}</p>
          <a class="order-btn" href="/k/${data.slug}/wa/${index}">Pesan via WhatsApp</a>
        </article>
      `
    })
    .join('')

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
        background: #f8fafc;
        color: #0f172a;
      }
      .container { max-width: 720px; margin: 0 auto; padding: 2.5rem 1rem; }
      header { text-align: center; margin-bottom: 2rem; }
      header h1 { font-size: 1.75rem; margin: 0 0 0.25rem; }
      header p { color: #475569; margin: 0.25rem 0; }
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
      }
      .product h3 { margin: 0 0 0.25rem; font-size: 1.05rem; }
      .product__image {
        width: 100%;
        height: 140px;
        object-fit: cover;
        border-radius: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .product__price { font-weight: 700; color: #0f766e; margin: 0 0 0.75rem; }
      .order-btn {
        display: inline-flex;
        width: 100%;
        justify-content: center;
        padding: 0.6rem 1rem;
        border-radius: 0.6rem;
        background: #16a34a;
        color: #fff;
        font-weight: 600;
        text-decoration: none;
      }
      footer {
        text-align: center;
        margin-top: 2.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e2e8f0;
        color: #64748b;
        font-size: 0.875rem;
      }
      footer a { color: #115e59; font-weight: 700; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>${safeName}</h1>
        ${safeTagline ? `<p>${safeTagline}</p>` : ''}
        ${safeCity ? `<p>📍 ${safeCity}</p>` : ''}
      </header>
      <div class="grid">
        ${productsHtml}
      </div>
      <footer>
        Katalog ini dibuat gratis di
        <a href="https://nusakarya.id" target="_blank" rel="noopener noreferrer">NusaKarya</a>
      </footer>
    </div>
  </body>
</html>`
}
