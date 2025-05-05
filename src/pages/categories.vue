<script setup>
import categoriesApi from '@/api/categories'
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import { onMounted, ref } from 'vue'

definePage({
  meta: {
    layout: 'blank',
  },
})

// Состояния
const categories = ref([])
const isLoading = ref(false)

// Загрузка категорий
const fetchCategories = async () => {
  try {
    isLoading.value = true
    const response = await categoriesApi.getCategories()
    // Проверяем тип ответа
    if (Array.isArray(response)) {
      categories.value = response
    } else if (response?.data) {
      categories.value = response.data
    } else {
      categories.value = []
    }
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error)
    categories.value = []
  } finally {
    isLoading.value = false
  }
}

// Монтирование
onMounted(fetchCategories)
</script>

<template>
  <div class="categories-page-wrapper">
    <Navbar />

    <VContainer class="categories-container my-6">

      <VRow v-if="isLoading">
        <VCol cols="12" class="text-center py-10">
          <VProgressCircular indeterminate color="primary" />
        </VCol>
      </VRow>

      <VRow v-else>
        <VCol
          v-for="category in categories"
          :key="category.category_id"
          cols="6"
          sm="4"
          md="3"
          lg="2"
        >
          <div class="text-center">
            <VImg
              :src="category.img?.src"
              alt=""
              aspect-ratio="1"
              cover
              height="100"
              class="rounded mb-3"
            />
            <span class="text-caption">{{ category.category_name }}</span>
            <br>
            <span class="text-caption text-disabled">
                {{ category.product_count }} товар(ов)
            </span>
          </div>
        </VCol>

        <!-- Если нет категорий -->
        <VCol v-if="!categories.length && !isLoading" cols="12">
          <p class="text-center text-disabled">Категории не найдены</p>
        </VCol>
      </VRow>
    </VContainer>

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.categories-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px;
}
</style>
