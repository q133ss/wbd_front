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
          <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
          <router-link
            :to="`/categories/${category.category_id}`"
            class="text-decoration-none"
          >
          <div class="text-center img-wrap">
            <VImg
              :src="category.img?.src || '/assets/images/no_image.svg'"
              alt=""
              cover
              height="335px"
              class="rounded mb-3"
            />
            <h2 class="text-caption category-name">{{ category.category_name }}</h2>
            <p class="text-caption text-disabled product-count">
                {{ category.product_count }} товар(ов)
            </p>
          </div>
          </router-link>
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

.category-name{
  position: relative;
  top: -100%;
  z-index: 999;
  height: 40px;
  color: #000000;
}

.product-count{
  position: relative;
  top: -80px;
  z-index: 999;
  color: #000000!important;
}

.img-wrap{
  height: 335px;
  background-color: #f5f5f4;
}
</style>
