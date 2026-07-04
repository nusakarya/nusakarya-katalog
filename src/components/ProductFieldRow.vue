<script setup lang="ts">
import type { Product } from '../types'

defineProps<{
  product: Product
  index: number
  canRemove: boolean
}>()

const emit = defineEmits<{
  update: [index: number, product: Product]
  remove: [index: number]
}>()
</script>

<template>
  <div class="product-row">
    <div>
      <label :for="`product-name-${index}`">Nama produk</label>
      <input
        :id="`product-name-${index}`"
        class="input"
        type="text"
        :value="product.name"
        placeholder="Kopi Susu Gula Aren"
        @input="emit('update', index, { ...product, name: ($event.target as HTMLInputElement).value })"
      />
    </div>
    <div>
      <label :for="`product-price-${index}`">Harga</label>
      <input
        :id="`product-price-${index}`"
        class="input"
        type="text"
        :value="product.price"
        placeholder="18.000"
        @input="emit('update', index, { ...product, price: ($event.target as HTMLInputElement).value })"
      />
    </div>
    <div>
      <label :for="`product-image-${index}`">URL foto (opsional)</label>
      <input
        :id="`product-image-${index}`"
        class="input"
        type="url"
        :value="product.imageUrl ?? ''"
        placeholder="https://..."
        @input="emit('update', index, { ...product, imageUrl: ($event.target as HTMLInputElement).value })"
      />
    </div>
    <div class="flex items-end">
      <button
        v-if="canRemove"
        type="button"
        class="btn btn--ghost h-fit w-full sm:w-auto"
        aria-label="Hapus produk"
        @click="emit('remove', index)"
      >
        Hapus
      </button>
    </div>
  </div>
</template>
