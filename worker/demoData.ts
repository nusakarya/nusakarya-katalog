import type { CatalogSubmission } from '../src/types'

export const DEMO_SLUG = 'contoh'

// Demo clicks never reach a real UMKM's phone — they route to NusaKarya's own
// WhatsApp (see handleWaRedirect / handleWaChatRedirect), turning the example
// page into a lead-gen path instead of a dead link.
export const NUSAKARYA_WHATSAPP = '6285234905742'

// Real photos from Wikimedia Commons (freely licensed, CC BY / CC BY-SA — see
// each File: page for attribution), served at the 330px width because that's
// one of Commons' fixed thumbnail sizes (arbitrary widths are rejected for
// hotlinked/non-wiki requests — see mediawiki.org/wiki/Common_thumbnail_sizes).
// Verified each URL resolves and matches the product before using it.
const PHOTO_KOPI_SUSU =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Es_Kopi_Susu_Gula_Aren.jpg/330px-Es_Kopi_Susu_Gula_Aren.jpg'

const PHOTO_ES_TEH =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Ice_tea_glass.jpg/330px-Ice_tea_glass.jpg'

const PHOTO_NASI_GORENG =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Nasi_goreng_istimewa.JPG/330px-Nasi_goreng_istimewa.JPG'

const PHOTO_ROTI_BAKAR =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Roti_Bakar_Telur_Goyang.jpg/330px-Roti_Bakar_Telur_Goyang.jpg'

export const DEMO_SUBMISSION: CatalogSubmission = {
  slug: DEMO_SLUG,
  businessName: 'Kedai Kopi Contoh',
  tagline: 'Kopi enak, harga bersahabat',
  whatsapp: NUSAKARYA_WHATSAPP,
  city: 'Surabaya',
  products: [
    { name: 'Kopi Susu Gula Aren', price: '18.000', imageUrl: PHOTO_KOPI_SUSU },
    { name: 'Es Teh Manis', price: '6.000', imageUrl: PHOTO_ES_TEH },
    { name: 'Nasi Goreng Spesial', price: '22.000', imageUrl: PHOTO_NASI_GORENG },
    { name: 'Roti Bakar Cokelat Keju', price: '15.000', imageUrl: PHOTO_ROTI_BAKAR },
  ],
  createdAt: Date.now(),
}
