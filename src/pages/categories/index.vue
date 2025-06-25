<script setup>
import categoriesApi from '@/api/categories'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

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

const router = useRouter()
const ageDialog = ref(false)
const pendingCategoryId = ref(null)

const handleCategoryClick = (category) => {
  if (category.requires_age_confirmation) {
    pendingCategoryId.value = category.category_id
    ageDialog.value = true
  } else {
    router.push(`/categories/${category.category_id}`)
  }
}

const confirmAge = () => {
  ageDialog.value = false
  if (pendingCategoryId.value) {
    router.push(`/categories/${pendingCategoryId.value}`)
    pendingCategoryId.value = null
  }
}

// Монтирование
onMounted(fetchCategories)
</script>

<template>
  <div class="categories-page-wrapper">
    <VContainer class="categories-container my-6">

      <VRow v-if="isLoading">
        <VCol cols="12" class="text-center py-10" style="height: 100vh">
          <VProgressCircular indeterminate color="primary" />
        </VCol>
      </VRow>

      <VRow v-else>
        <VCol
          v-for="category in categories"
          :key="category.category_id"
          cols="4"
          sm="4"
          md="3"
          lg="2"
        >
          <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
          <div
            style="cursor: pointer"
            @click="handleCategoryClick(category)"
            class="text-decoration-none"
          >
          <div class="text-center img-wrap">
            <VImg
              :src="category.img?.src || '/assets/images/no_image.svg'"
              alt=""
              cover
              position="center"
              class="category-img mb-3"
            />
            <h2 class="text-caption category-name">{{ category.category_name }}</h2>
            <p class="text-caption text-disabled product-count">
                {{ category.product_count }} товар(ов)
            </p>
          </div>
          </div>
        </VCol>

        <!-- Если нет категорий -->
        <VCol v-if="!categories.length && !isLoading" cols="12">
          <p class="text-center text-disabled">Категории не найдены</p>
        </VCol>
      </VRow>
    </VContainer>
  </div>

  <VDialog v-model="ageDialog" persistent max-width="400">
    <VCard>
      <VCardTitle>Подтверждение возраста</VCardTitle>
      <VCardText>Вам есть 18 лет?</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn text @click="ageDialog = false">Нет</VBtn>
        <VBtn color="primary" text @click="confirmAge">Да</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>

.category-name{
  position: relative;
  top: -100%;
  z-index: 999;
  height: 40px;
  color: #000000;
  text-align: left;
  font-size: 15px!important;
  margin-left: 16px;
}

.product-count{
  position: relative;
  top: -90px;
  padding: 5px;
  z-index: 999;
  color: #000000!important;
  background: #ffffffa1;
  box-shadow: none!important;
  border-radius: 20px;
  font-size: 13px!important;
  width: 60%;
  margin-left: 15px;
}

.img-wrap{
  //height: 285px;
  width: 200px;
  height: 235px;
}

.category-img{
  border-radius: 20px;
}
</style>
