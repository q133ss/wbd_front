<script setup>
import { ref, onMounted, computed } from 'vue'
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import productApi from '@/api/index'

// Состояния
const productsData = ref(null)
const currentPage = ref(1)
const isLoading = ref(false)

// Модальные окна
const dialogPrice = ref(false)
const dialogCashback = ref(false)
const dialogSort = ref(false)

// Фильтры
const filters = ref({
  price: [],
  cashback: [],
  category: null,
  sort: 'rating_product',
  order: 'asc'
})

// Загрузка товаров
const fetchProducts = async (page = 1) => {
  try {
    isLoading.value = true
    currentPage.value = page

    const params = { page, per_page: 18 }

    if (filters.value.price?.length === 2) {
      params.price_from = filters.value.price[0]
      params.price_to = filters.value.price[1]
    }

    if (filters.value.cashback?.length === 2) {
      params.cashback_from = filters.value.cashback[0]
      params.cashback_to = filters.value.cashback[1]
    }

    if (filters.value.category) {
      params.category_id = filters.value.category
    }

    if (filters.value.sort) {
      params.sort = filters.value.sort
    }

    if (filters.value.order) {
      params.order = filters.value.order
    }

    const response = await productApi.products.getProducts(params)
    productsData.value = response
    console.log(response)
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error)
  } finally {
    isLoading.value = false
  }
}


const applyFilters = () => {
  dialogPrice.value = false
  dialogCashback.value = false
  dialogSort.value = false
  fetchProducts(1)
}

const addToCart = (product) => {
  console.log('Добавлен товар:', product.product.name)
}

// Монтирование
onMounted(fetchProducts)

// Вычисляемые свойства
const products = computed(() => {
  if (Array.isArray(productsData.value)) {
    // если API отдало массив — возвращаем его
    return productsData.value
  }
  // иначе, как раньше — из поля data
  return productsData.value?.data || []
})

const pagination = computed(() => ({
  currentPage: productsData.value?.current_page || 1,
  lastPage: productsData.value?.last_page || 1,
  total: productsData.value?.total || 0,
  links: productsData.value?.links || []
}))
</script>

<template>
  <div class="landing-page-wrapper">
    <Navbar />

    <div class="banner-container">
      <div class="banner-wrap">
        <img
          src="@/assets/images/index/banner.png"
          alt="WB Discount баннер"
          class="banner-img"
        />
      </div>
    </div>

    <!-- Фильтры -->
    <VContainer class="filters-container">
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
    </VContainer>

    <!-- Модалка: Цена -->
    <VDialog v-model="dialogPrice" max-width="500">
      <VCard>
        <VCardTitle>Фильтр по цене</VCardTitle>
        <VCardText>
          <VRangeSlider
            v-model="filters.price"
            label="Цена"
            :min="0"
            :max="1000"
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

    <!-- Модалка: Кешбек -->
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
    <VContainer class="products-container">
      <VRow v-if="isLoading">
        <VCol cols="12" class="text-center py-10">
          <VProgressCircular indeterminate color="primary" />
        </VCol>
      </VRow>

      <VRow v-else>
        <VCol
          v-for="item in products"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <VCard class="product-card">
            <template v-if="item.product.images?.length">
              <VCarousel
                :continuous="false"
                :show-arrows="item.product.images.length > 1"
                height="200"
                hide-delimiters
              >
                <VCarouselItem
                  v-for="(image, idx) in item.product.images"
                  :key="idx"
                >
                  <VImg
                    :src="image"
                    cover
                    height="100%"
                    class="product-image"
                  />
                </VCarouselItem>
              </VCarousel>
            </template>

            <!-- Показываем плейсхолдер если нет картинок -->
            <template v-else>
              <div class="product-image-placeholder" style="height: 200px; background: #f2f2f2; display: flex; align-items: center; justify-content: center;">
                <span style="color: #999;">Нет изображения</span>
              </div>
            </template>

            <VCardItem>
              <VCardTitle class="text-body-1">
                {{ item.product.name }}
              </VCardTitle>
              <VChip
                v-if="item.product.category"
                size="small"
                color="orange-lighten-5"
                text-color="orange-darken-2"
                class="mt-2"
              >
                {{ item.product.category.name }}
              </VChip>
            </VCardItem>

            <VCardText>
              <div class="d-flex align-center gap-2 mb-2">
                <span class="text-h6 text-primary">
                  {{ item.price_with_cashback }} ₽
                </span>
                <span class="text-body-2 text-disabled text-decoration-line-through">
                  {{ item.product.price }} ₽
                </span>
              </div>

              <div class="d-flex align-center mb-2">
                <VIcon icon="mdi-cashback" color="success" size="20" class="me-1" />
                <span class="text-caption">
                  Кешбек {{ item.cashback_percentage }}%
                </span>
              </div>

              <div class="d-flex align-center mb-4">
                <VRating
                  :model-value="parseFloat(item.product.rating)"
                  density="compact"
                  size="small"
                  readonly
                  half-increments
                />
                <span class="text-caption ms-1">
                  ({{ item.reviews.length }})
                </span>
              </div>

              <VBtn block color="primary" prepend-icon="mdi-cart-plus" @click="addToCart(item)">
                В корзину
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Пагинация -->
      <VPagination
        v-if="pagination.lastPage > 1"
        v-model="currentPage"
        :length="pagination.lastPage"
        :total-visible="7"
        @update:modelValue="fetchProducts"
        class="mt-6"
      />
    </VContainer>

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.banner-container {
  width: 100%;
  max-width: calc(1440px - 32px);
  margin: 80px auto 0;
  padding: 0 16px;
}

.banner-wrap {
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.banner-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.filters-container {
  margin-top: 40px;
  padding: 20px;
  border-radius: 8px;
}

.products-container {
  margin-top: 20px;
  padding: 0 16px;
  max-width: 1440px;
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

.product-image {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
