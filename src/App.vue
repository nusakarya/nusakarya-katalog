<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import QRCode from 'qrcode'
import ProductFieldRow from './components/ProductFieldRow.vue'
import type { CreateCatalogPayload, CreateCatalogResponse, Product } from './types'

const MAX_PRODUCTS = 6

const form = reactive({
  businessName: '',
  tagline: '',
  whatsapp: '',
  city: '',
  website: '', // honeypot: real users never fill this
})

const products = ref<Product[]>([{ name: '', price: '', imageUrl: '' }])

const isSubmitting = ref(false)
const errorMessage = ref('')
const result = ref<CreateCatalogResponse | null>(null)
const qrDataUrl = ref('')

const canAddProduct = computed(() => products.value.length < MAX_PRODUCTS)

const addProduct = (): void => {
  if (!canAddProduct.value) return
  products.value.push({ name: '', price: '', imageUrl: '' })
}

const updateProduct = (index: number, product: Product): void => {
  products.value[index] = product
}

const removeProduct = (index: number): void => {
  products.value.splice(index, 1)
}

const validate = (): string => {
  if (!form.businessName.trim()) return 'Nama usaha wajib diisi.'
  if (!/^62\d{8,13}$/.test(form.whatsapp.trim())) {
    return 'Nomor WhatsApp harus format 62xxxxxxxxxx (tanpa +, spasi, atau strip).'
  }
  const validProducts = products.value.filter((p) => p.name.trim() && p.price.trim())
  if (validProducts.length === 0) return 'Isi minimal 1 produk (nama dan harga).'
  return ''
}

const submit = async (): Promise<void> => {
  errorMessage.value = ''

  const validationError = validate()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  isSubmitting.value = true
  try {
    const payload: CreateCatalogPayload = {
      businessName: form.businessName.trim(),
      tagline: form.tagline.trim(),
      whatsapp: form.whatsapp.trim(),
      city: form.city.trim(),
      products: products.value.filter((p) => p.name.trim() && p.price.trim()),
      website: form.website,
    }

    const response = await fetch('/api/catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      errorMessage.value = data?.message ?? 'Gagal membuat katalog. Coba lagi sebentar lagi.'
      return
    }

    const data = (await response.json()) as CreateCatalogResponse
    result.value = data
    qrDataUrl.value = await QRCode.toDataURL(data.url, { margin: 1, width: 240 })
  } catch {
    errorMessage.value = 'Gagal terhubung ke server. Periksa koneksi internet Anda.'
  } finally {
    isSubmitting.value = false
  }
}

const copyLink = async (): Promise<void> => {
  if (!result.value) return
  await navigator.clipboard.writeText(result.value.url)
}
</script>

<template>
  <div class="container py-10">
    <header class="mb-8 text-center">
      <p class="mb-1 text-sm font-bold text-brand">NusaKarya</p>
      <h1>Buat Katalog Online Gratis</h1>
      <p class="mt-2 text-slate-600">
        Isi form di bawah, dapatkan halaman katalog siap dibagikan ke pelanggan lewat WhatsApp
        atau kode QR. Gratis, tanpa perlu website sendiri.
      </p>
      <a class="mt-3 inline-flex text-sm font-semibold text-brand-dark" href="/k/contoh" target="_blank" rel="noopener noreferrer">
        👀 Lihat contoh tampilan katalog
      </a>
    </header>

    <div v-if="!result" class="card">
      <form novalidate @submit.prevent="submit">
        <div class="field">
          <label for="businessName">Nama usaha</label>
          <input
            id="businessName"
            v-model="form.businessName"
            class="input"
            type="text"
            placeholder="Warung Kopi Sederhana"
            required
          />
        </div>

        <div class="field">
          <label for="tagline">Tagline singkat (opsional)</label>
          <input
            id="tagline"
            v-model="form.tagline"
            class="input"
            type="text"
            placeholder="Kopi enak, harga bersahabat"
          />
        </div>

        <div class="field">
          <label for="whatsapp">Nomor WhatsApp</label>
          <input
            id="whatsapp"
            v-model="form.whatsapp"
            class="input"
            type="tel"
            placeholder="6281234567890"
            required
          />
          <p class="mt-1 text-xs text-slate-500">
            Format: 62 diikuti nomor, tanpa +, spasi, atau strip.
          </p>
        </div>

        <div class="field">
          <label for="city">Kota (opsional)</label>
          <input id="city" v-model="form.city" class="input" type="text" placeholder="Surabaya" />
        </div>

        <div :class="['field', 'honeypot-field']" aria-hidden="true">
          <label for="website">Website</label>
          <input id="website" v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
        </div>

        <div class="field">
          <label>Produk (minimal 1, maksimal {{ MAX_PRODUCTS }})</label>
          <div class="flex flex-col gap-3">
            <ProductFieldRow
              v-for="(product, index) in products"
              :key="index"
              :product="product"
              :index="index"
              :can-remove="products.length > 1"
              @update="updateProduct"
              @remove="removeProduct"
            />
          </div>
          <button
            v-if="canAddProduct"
            type="button"
            class="btn btn--ghost mt-3"
            @click="addProduct"
          >
            + Tambah produk
          </button>
        </div>

        <p v-if="errorMessage" class="mb-4 text-sm font-semibold text-rose-600">
          {{ errorMessage }}
        </p>

        <button type="submit" class="btn btn--primary w-full" :disabled="isSubmitting">
          {{ isSubmitting ? 'Membuat katalog...' : 'Buat Katalog Gratis' }}
        </button>
      </form>
    </div>

    <div v-else class="card text-center">
      <p class="mb-2 text-sm font-bold text-brand">Katalog berhasil dibuat!</p>
      <p class="mb-4 text-slate-600">
        Bagikan link atau kode QR ini ke pelanggan Anda.
      </p>
      <a class="mb-4 block break-all font-semibold text-brand-dark" :href="result.url">
        {{ result.url }}
      </a>
      <img
        v-if="qrDataUrl"
        :src="qrDataUrl"
        alt="Kode QR menuju halaman katalog"
        class="mx-auto mb-4 h-40 w-40"
      />
      <div class="flex flex-wrap justify-center gap-3">
        <button type="button" class="btn btn--ghost" @click="copyLink">Salin Link</button>
        <a class="btn btn--primary" :href="result.url" target="_blank" rel="noopener noreferrer">
          Lihat Halaman
        </a>
      </div>
    </div>

    <footer class="mt-10 text-center text-sm text-slate-500">
      Ingin fitur lebih lengkap (kasir, inventory, custom app)?
      <a class="font-semibold text-brand-dark" href="https://nusakarya.id" target="_blank" rel="noopener noreferrer">
        Lihat layanan NusaKarya
      </a>
    </footer>
  </div>
</template>
