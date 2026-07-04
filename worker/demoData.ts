import type { CatalogSubmission } from '../src/types'

export const DEMO_SLUG = 'contoh'

// Demo clicks never reach a real UMKM's phone — they route to NusaKarya's own
// WhatsApp (see handleWaRedirect / handleWaChatRedirect), turning the example
// page into a lead-gen path instead of a dead link.
export const NUSAKARYA_WHATSAPP = '6285234905742'

// Hand-drawn SVG icons (flat, brand-adjacent colors) so the demo page shows
// something relevant to each product instead of a bare monogram tile — no
// external image host to depend on or license. <img> never executes script
// embedded in an SVG (unlike <object>/<iframe>), so this is safe as an <img src>.
const ICON_KOPI_SUSU =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23fef3c7%22%2F%3E%20%3Cpath%20d%3D%22M28%2042h44l-4%2030a8%208%200%200%201-8%207H40a8%208%200%200%201-8-7z%22%20fill%3D%22%2378350f%22%2F%3E%20%3Cpath%20d%3D%22M28%2042h44l-1.5%2011H29.5z%22%20fill%3D%22%23e7c9a3%22%2F%3E%20%3Cpath%20d%3D%22M72%2046h6a9%209%200%200%201%200%2018h-6%22%20fill%3D%22none%22%20stroke%3D%22%2378350f%22%20stroke-width%3D%225%22%2F%3E%20%3Cpath%20d%3D%22M38%2030q4-8%200-14M50%2030q4-8%200-14M62%2030q4-8%200-14%22%20stroke%3D%22%23b45309%22%20stroke-width%3D%224%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20opacity%3D%220.6%22%2F%3E%20%3C%2Fsvg%3E'

const ICON_ES_TEH =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23ecfeff%22%2F%3E%20%3Cpath%20d%3D%22M32%2028h36l-5%2052a6%206%200%200%201-6%205H43a6%206%200%200%201-6-5z%22%20fill%3D%22%23d97706%22%20opacity%3D%220.85%22%2F%3E%20%3Cpath%20d%3D%22M38%2040l6%206-6%206M50%2038l6%206-6%206M62%2040l6%206-6%206%22%20stroke%3D%22%23f8fafc%22%20stroke-width%3D%224%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20opacity%3D%220.9%22%2F%3E%20%3Crect%20x%3D%2247%22%20y%3D%2210%22%20width%3D%225%22%20height%3D%2224%22%20rx%3D%222.5%22%20fill%3D%22%230e7490%22%20transform%3D%22rotate(10%2049%2022)%22%2F%3E%20%3C%2Fsvg%3E'

const ICON_NASI_GORENG =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23fff7ed%22%2F%3E%20%3Cellipse%20cx%3D%2250%22%20cy%3D%2272%22%20rx%3D%2238%22%20ry%3D%229%22%20fill%3D%22%23cbd5e1%22%2F%3E%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2254%22%20r%3D%2227%22%20fill%3D%22%23d97706%22%2F%3E%20%3Ccircle%20cx%3D%2236%22%20cy%3D%2246%22%20r%3D%222.5%22%20fill%3D%22%237c2d12%22%2F%3E%20%3Ccircle%20cx%3D%2260%22%20cy%3D%2242%22%20r%3D%222.5%22%20fill%3D%22%237c2d12%22%2F%3E%20%3Ccircle%20cx%3D%2266%22%20cy%3D%2258%22%20r%3D%222.5%22%20fill%3D%22%237c2d12%22%2F%3E%20%3Ccircle%20cx%3D%2234%22%20cy%3D%2262%22%20r%3D%222.5%22%20fill%3D%22%237c2d12%22%2F%3E%20%3Cellipse%20cx%3D%2250%22%20cy%3D%2250%22%20rx%3D%2215%22%20ry%3D%2211%22%20fill%3D%22%23fefce8%22%2F%3E%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%226%22%20fill%3D%22%23f59e0b%22%2F%3E%20%3C%2Fsvg%3E'

const ICON_ROTI_BAKAR =
  'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%20%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23fef2f2%22%2F%3E%20%3Cpath%20d%3D%22M26%2040q0-18%2024-18t24%2018v30a4%204%200%200%201-4%204H30a4%204%200%200%201-4-4z%22%20fill%3D%22%23d97706%22%2F%3E%20%3Cpath%20d%3D%22M32%2040q0-13%2018-13t18%2013%22%20fill%3D%22none%22%20stroke%3D%22%2378350f%22%20stroke-width%3D%224%22%2F%3E%20%3Cpath%20d%3D%22M30%2054q20%208%2040%200%22%20stroke%3D%22%2378350f%22%20stroke-width%3D%224%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%2F%3E%20%3Cpath%20d%3D%22M34%2062q16%206%2032%200%22%20stroke%3D%22%23fbbf24%22%20stroke-width%3D%224%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%2F%3E%20%3C%2Fsvg%3E'

export const DEMO_SUBMISSION: CatalogSubmission = {
  slug: DEMO_SLUG,
  businessName: 'Kedai Kopi Contoh',
  tagline: 'Kopi enak, harga bersahabat',
  whatsapp: NUSAKARYA_WHATSAPP,
  city: 'Surabaya',
  products: [
    { name: 'Kopi Susu Gula Aren', price: '18.000', imageUrl: ICON_KOPI_SUSU },
    { name: 'Es Teh Manis', price: '6.000', imageUrl: ICON_ES_TEH },
    { name: 'Nasi Goreng Spesial', price: '22.000', imageUrl: ICON_NASI_GORENG },
    { name: 'Roti Bakar Cokelat Keju', price: '15.000', imageUrl: ICON_ROTI_BAKAR },
  ],
  createdAt: Date.now(),
}
