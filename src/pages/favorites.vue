<script setup>
import Navbar from "@/views/front-pages/front-page-navbar.vue"
import Footer from "@/views/front-pages/front-page-footer.vue"
import favoriteApi from '@/api/index'

definePage({
  meta: {
    layout: 'blank',
  },
})

const products = ref([])

onMounted(async () => {
  const response = await favoriteApi.favorite.getFavorites()
  if (response?.favorites) {
    products.value = response.favorites.map(fav => fav.product)
  }
})
</script>

<template>
  <VContainer class="favorite-container">
    <Navbar />

    <h1 class="text-2xl font-bold mb-2">Избранное</h1>
    <p class="text-gray-600 mb-4">{{ products.length }} товаров</p>

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
