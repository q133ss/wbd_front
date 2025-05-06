<script setup>
import { ref, onMounted } from 'vue'
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import ProductCard from '@/components/ProductCard.vue'
import productApi from '@/api/index'

// Состояния
const products = ref([])
const paginationInfo = ref({
  current_page: 1,
  last_page: 1
})

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
  if (isLoading.value || (paginationInfo.value && page > paginationInfo.value.last_page)) return

  try {
    isLoading.value = true

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

    if (page === 1) {
      products.value = response.data
    } else {
      products.value.push(...response.data)
    }

    paginationInfo.value = {
      current_page: response.current_page,
      last_page: response.last_page
    }
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

// Монтирование
onMounted(fetchProducts)


const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight

  if (scrollTop + clientHeight >= scrollHeight - 300) {
    fetchProducts(paginationInfo.value.current_page + 1)
  }
}

onMounted(() => {
  fetchProducts(1)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

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
      <VRow>
        <ProductCard
          v-for="item in products"
          :key="item.id"
          :item="item"
        />
      </VRow>

      <!-- Индикатор загрузки при скролле -->
      <VRow v-if="isLoading">
        <VCol cols="12" class="text-center py-6">
          <VProgressCircular indeterminate color="primary" />
        </VCol>
      </VRow>
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
  margin-bottom: 20px;
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
