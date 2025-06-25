<script setup>
import favoriteApi from '@/api/index'

const products = ref([])

onMounted(async () => {
  const response = await favoriteApi.favorite.getFavorites()
  if (response?.favorites) {
    products.value = response.favorites.map(fav => fav.product)
  }
})

const getProductWord = (count) => {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) return 'товар'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'товара'
  return 'товаров'
}

</script>

<template>
  <VContainer class="favorite-container">

    <h1 class="text-2xl font-bold mb-2">Избранное</h1>
    <p class="text-gray-600 mb-4">{{ products.length }} {{ getProductWord(products.length) }}</p>

    <VRow>
      <ProductCard
        v-for="item in products"
        :key="item.id"
        :item="item"
      />
    </VRow>

  </VContainer>
</template>


<style scoped lang="scss">

</style>
