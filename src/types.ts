export type Product = {
  name: string
  price: string
  imageUrl?: string
}

export type CatalogSubmission = {
  slug: string
  businessName: string
  tagline: string
  whatsapp: string
  city: string
  mapsUrl?: string
  products: Product[]
  createdAt: number
}

export type CreateCatalogPayload = Omit<CatalogSubmission, 'slug' | 'createdAt'> & {
  website?: string
}

export type CreateCatalogResponse = {
  slug: string
  url: string
}

export type CatalogSummary = {
  slug: string
  businessName: string
  whatsapp: string
  city: string
  productCount: number
  createdAt: number
  views: number
  clicks: number
  chatClicks: number
}
