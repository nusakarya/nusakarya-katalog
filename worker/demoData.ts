import type { CatalogSubmission } from '../src/types'

export const DEMO_SLUG = 'contoh'

// Demo clicks never reach a real UMKM's phone — they route to NusaKarya's own
// WhatsApp (see handleWaRedirect / handleWaChatRedirect), turning the example
// page into a lead-gen path instead of a dead link.
export const NUSAKARYA_WHATSAPP = '6285234905742'

export const DEMO_SUBMISSION: CatalogSubmission = {
  slug: DEMO_SLUG,
  businessName: 'Kedai Kopi Contoh',
  tagline: 'Kopi enak, harga bersahabat',
  whatsapp: NUSAKARYA_WHATSAPP,
  city: 'Surabaya',
  products: [
    { name: 'Kopi Susu Gula Aren', price: '18.000' },
    { name: 'Es Teh Manis', price: '6.000' },
    { name: 'Nasi Goreng Spesial', price: '22.000' },
    { name: 'Roti Bakar Cokelat Keju', price: '15.000' },
  ],
  createdAt: Date.now(),
}
