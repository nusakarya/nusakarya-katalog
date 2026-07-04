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
