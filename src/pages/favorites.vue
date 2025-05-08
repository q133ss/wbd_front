<script setup>
import Navbar from "@/views/front-pages/front-page-navbar.vue"
import Footer from "@/views/front-pages/front-page-footer.vue"
import favoriteApi from '@/api/index'

definePage({
  meta: {
    layout: 'blank',
    authRequired: true
  },
})

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
    <Navbar />

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

  <Footer />
</template>


<style scoped lang="scss">
.favorite-container{
  margin-top: 80px;
}
</style>
