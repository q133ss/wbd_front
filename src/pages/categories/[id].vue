<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import productApi from '@/api/index'
import categoriesApi from '@/api/categories'
import ProductCard from "@/components/ProductCard.vue"

definePage({
  meta: {
    layout: 'blank',
  },
})

// Состояния
const productsData = ref(null)
const subCategories = ref([])
const currentPage = ref(1)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isAllLoaded = ref(false)
const scrollObserver = ref(null)
const scrollTrigger = ref(null)

const route = useRoute()
const categoryId = ref(route.params.id)

// Загрузка подкатегорий
const fetchSubCategories = async () => {
  try {
    const response = await categoriesApi.getSubCategories(categoryId.value)
    subCategories.value = response
  } catch (error) {
    console.error('Ошибка загрузки подкатегорий:', error)
  }
}

// Модальные окна
const dialogPrice = ref(false)
const dialogCashback = ref(false)
const dialogSort = ref(false)

const filters = ref({
  price: [],
  cashback: [],
  sort: 'rating_product',
  order: 'asc'
})

// Загрузка товаров с пагинацией
const fetchProducts = async (page = 1, reset = false) => {
  try {
    if (reset) {
      isAllLoaded.value = false
      isLoading.value = true
      productsData.value = null
    } else if (page > 1) {
      isLoadingMore.value = true
    }

    const params = {
      page,
      per_page: 18,
      sort: filters.value.sort,
      order: filters.value.order
    }

    // Фильтры по цене
    if (filters.value.price.length === 2) {
      params.price_from = Math.min(...filters.value.price)
      params.price_to = Math.max(...filters.value.price)
    }

    // Фильтры по кешбеку
    if (filters.value.cashback.length === 2) {
      params.cashback_from = Math.min(...filters.value.cashback)
      params.cashback_to = Math.max(...filters.value.cashback)
    }

    // 🟢 Используем метод получения товаров из категории
    const response = await productApi.categories.getCategoryProducts(categoryId.value, params)

    if (reset || !productsData.value || !Array.isArray(productsData.value.data)) {
      productsData.value = response
    } else {
      productsData.value = {
        ...response,
        data: [
          ...(Array.isArray(productsData.value.data) ? productsData.value.data : []),
          ...(Array.isArray(response.data) ? response.data : [])
        ]
      }
    }

    isAllLoaded.value = !response.next_page_url
    currentPage.value = page
  } catch (error) {
    console.error('Ошибка загрузки:', error)
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Инициализация Intersection Observer
const initScrollObserver = () => {
  // Очищаем предыдущий observer
  if (scrollObserver.value) {
    scrollObserver.value.disconnect()
  }

  // Создаем новый observer
  scrollObserver.value = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isLoadingMore.value && !isAllLoaded.value) {
        fetchProducts(currentPage.value + 1)
      }
    },
    { rootMargin: '200px' }
  )

  // Начинаем наблюдение
  if (scrollTrigger.value) {
    scrollObserver.value.observe(scrollTrigger.value)
  }
}

// Очистка при демонтировании
onUnmounted(() => {
  if (scrollObserver.value) {
    scrollObserver.value.disconnect()
  }
})

// Инициализация при монтировании
onMounted(() => {
  fetchSubCategories()
  fetchProducts(1, true)
  initScrollObserver()
})

const applyFilters = () => {
  dialogPrice.value = false
  dialogCashback.value = false
  dialogSort.value = false
  fetchProducts(1, true)
}

// Реакция на изменение данных
watch(productsData, () => {
  initScrollObserver()
}, { deep: true })

// Реакция на изменение категории
watch(() => route.params.id, (newId) => {
  categoryId.value = newId
  fetchProducts(1, true)
})

const router = useRouter()

const goToProduct = (productId) => {
  router.push(`/products/${productId}`)
}
</script>

<template>
  <div class="landing-page-wrapper">
    <Navbar />

    <VContainer class="page-container">
      <VRow>
        <!-- Блок подкатегорий -->
        <VCol cols="12" md="3">
          <VCard class="subcategories-card">
            <VCardTitle class="text-h6">Подкатегории</VCardTitle>
            <VList v-if="subCategories.length > 0">
              <VListItem
                v-for="category in subCategories"
                :key="category.category_id"
                :to="`/categories/${category.category_id}`"
                active-class="active-subcategory"
              >
                <VListItemTitle>
                  {{ category.category_name }}
                </VListItemTitle>
                <VListItemSubtitle>
                  {{ category.product_count }} товаров
                </VListItemSubtitle>
              </VListItem>
            </VList>

            <div v-else class="pa-4 text-center text-disabled">
              <VIcon icon="mdi-folder-remove-outline" size="48" class="mb-2" />
              <div>Нет подкатегорий</div>
            </div>
          </VCard>
        </VCol>

        <!-- Блок товаров -->
        <VCol cols="12" md="9">
          <!-- Фильтры -->
          <VCard class="mb-4">
            <VCardText>
              <VRow>
                <VCol cols="12" md="4">
                  <VBtn block @click="dialogPrice = true">Цена</VBtn>
                </VCol>
                <VCol cols="12" md="4">
                  <VBtn block @click="dialogCashback = true">Кешбек</VBtn>
                </VCol>
                <VCol cols="12" md="4">
                  <VBtn block @click="dialogSort = true">Сортировка</VBtn>
                </VCol>
              </VRow>
            </VCardText>
          </VCard>

          <!-- Модалка: Цена -->
          <VDialog v-model="dialogPrice" max-width="500">
            <VCard>
              <VCardTitle>Фильтр по цене</VCardTitle>
              <VCardText>
                <VRangeSlider
                  v-model="filters.price"
                  label="Цена"
                  :min="0"
                  :max="100000"
                  :step="10"
                  thumb-label="always"
                />
              </VCardText>
              <VCardActions>
                <VSpacer />
                <VBtn text @click="dialogPrice = false">Отмена</VBtn>
                <VBtn text color="primary" @click="applyFilters">Применить</VBtn>
              </VCardActions>
            </VCard>
          </VDialog>

          <VDialog v-model="dialogCashback" max-width="500">
            <VCard>
              <VCardTitle>Фильтр по кешбеку</VCardTitle>
              <VCardText>
                <VRangeSlider
                  v-model="filters.cashback"
                  label="Кешбек"
                  :min="0"
                  :max="100"
                  thumb-label="always"
                />
              </VCardText>
              <VCardActions>
                <VSpacer />
                <VBtn text @click="dialogCashback = false">Отмена</VBtn>
                <VBtn text color="primary" @click="applyFilters">Применить</VBtn>
              </VCardActions>
            </VCard>
          </VDialog>

          <!-- Модалка: Сортировка -->
          <VDialog v-model="dialogSort" max-width="500">
            <VCard>
              <VCardTitle>Сортировка</VCardTitle>
              <VCardText>
                <VSelect
                  v-model="filters.sort"
                  label="Сортировка"
                  :items="[
                    { title: 'По рейтингу', value: 'rating_product' },
                    { title: 'По цене', value: 'price' },
                    { title: 'По скидке', value: 'discount' }
                  ]"
                />
                <VRadioGroup v-model="filters.order" inline>
                  <VRadio label="По возрастанию" value="asc" />
                  <VRadio label="По убыванию" value="desc" />
                </VRadioGroup>
              </VCardText>
              <VCardActions>
                <VSpacer />
                <VBtn text @click="dialogSort = false">Отмена</VBtn>
                <VBtn text color="primary" @click="applyFilters">Применить</VBtn>
              </VCardActions>
            </VCard>
          </VDialog>

          <!-- Список товаров -->
          <VRow v-if="isLoading">
            <VCol cols="12" class="text-center py-10">
              <VProgressCircular indeterminate color="primary" />
            </VCol>
          </VRow>

          <VRow v-else>
            <ProductCard
              v-for="item in productsData?.data"
              :key="item.id"
              :item="item"
              @go-to-product="goToProduct"
            />
          </VRow>
        </VCol>
      </VRow>

      <!-- Триггер для подгрузки -->
      <div ref="scrollTrigger" style="height: 1px;"></div>

      <!-- Индикаторы -->
      <div v-if="isLoadingMore" class="text-center py-4">
        <VProgressCircular indeterminate />
      </div>

    </VContainer>

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  margin-top: 80px;
  max-width: 1440px;
}

.subcategories-card {
  position: sticky;
  top: 80px;
  padding: 16px;
}

.active-subcategory {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.product-card {
  height: 100%;
  transition: transform 0.3s ease;
  margin-bottom: 16px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
}
</style>
