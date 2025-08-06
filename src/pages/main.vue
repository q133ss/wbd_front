<script setup>
import { useConfigStore } from '@core/stores/config'
import { AppContentLayoutNav } from '@layouts/enums'
import { switchToVerticalNavOnLtOverlayNavBreakpoint } from '@layouts/utils'
import productApi from '@/api/index'
import ProductCard from '@/components/ProductCard.vue'
import { onMounted, ref } from 'vue'
import Footer from "@/views/front-pages/front-page-footer.vue"

const DefaultLayoutWithHorizontalNav = defineAsyncComponent(() => import('@/layouts/components/DefaultLayoutWithHorizontalNav.vue'))
const DefaultLayoutWithVerticalNav = defineAsyncComponent(() => import('@/layouts/components/DefaultLayoutWithVerticalNav.vue'))
const configStore = useConfigStore()

// ℹ️ This will switch to vertical nav when define breakpoint is reached when in horizontal nav layout

// Remove below composable usage if you are not using horizontal nav layout in your app
switchToVerticalNavOnLtOverlayNavBreakpoint()

const { layoutAttrs, injectSkinClasses } = useSkins()

injectSkinClasses()

// SECTION: Loading Indicator
const isFallbackStateActive = ref(false)
const refLoadingIndicator = ref(null)

watch([
  isFallbackStateActive,
  refLoadingIndicator,
], () => {
  if (isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.fallbackHandle()
  if (!isFallbackStateActive.value && refLoadingIndicator.value)
    refLoadingIndicator.value.resolveHandle()
}, { immediate: true })
// !SECTION

// Index page functions
// Состояния
const products = ref([])
const total = ref(0)
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
const filterMaxPrice = ref(100000)
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
      total.value = response.total
    } else {
      products.value.push(...response.data)
    }

    paginationInfo.value = {
      current_page: response.current_page,
      last_page: response.last_page
    }

    filterMaxPrice.value = response.max_price || 100000
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
  <Component
    v-bind="layoutAttrs"
    :is="configStore.appContentLayoutNav === AppContentLayoutNav.Vertical ? DefaultLayoutWithVerticalNav : DefaultLayoutWithHorizontalNav"
  >
    <AppLoadingIndicator ref="refLoadingIndicator" />

    <RouterView v-slot="{ Component }">
      <Suspense
        :timeout="0"
        @fallback="isFallbackStateActive = true"
        @resolve="isFallbackStateActive = false"
      >
        <div class="landing-page-wrapper">
          <div class="banner-container">
            <div class="banner-wrap">
              <img
                src="@/assets/images/index/banner.png"
                alt="WB Discount баннер"
                class="banner-img banner-desktop"
              />
              <img
                src="@/assets/images/index/mobileBanner.png"
                alt="WB Discount баннер"
                class="banner-img banner-mobile"
              />
            </div>
          </div>

          <VContainer class="products-container">
            <div class="d-flex align-end gap-3 pb-2">
              <h2 class="main-page-title">Товары с кэшбеком:</h2>
              <span class="text-subtitle-1">{{total}} товаров</span>
            </div>
            <VRow class="filter-desktop">
              <VCol cols="4" md="2">
                <VBtn block @click="dialogPrice = true" color="grey-lighten-3"  variant="elevated" class="filter-btn">
                  Цена, ₽
                </VBtn>
              </VCol>
              <VCol cols="4" md="2">
                <VBtn block @click="dialogCashback = true" color="grey-lighten-3"  variant="elevated" class="filter-btn">
                  Кешбек, %
                </VBtn>
              </VCol>
              <VCol cols="4" md="2">
                <VBtn block @click="dialogSort = true" color="grey-lighten-3"  variant="elevated" class="filter-btn">
                  Сортировка
                </VBtn>
              </VCol>
            </VRow>

            <div class="filter-mobile">
              <div class="mobile-filter-btn-wrap">
                <VBtn block @click="dialogPrice = true" color="grey-lighten-3"  variant="elevated" class="filter-btn">
                  Цена, ₽
                </VBtn>
              </div>
              <div class="mobile-filter-btn-wrap">
                <VBtn block @click="dialogCashback = true" color="grey-lighten-3"  variant="elevated" class="filter-btn">
                  Кешбек, %
                </VBtn>
              </div>
              <div class="mobile-filter-btn-wrap">
                <VBtn block @click="dialogSort = true" color="grey-lighten-3"  variant="elevated" class="filter-btn">
                  Сортировка
                </VBtn>
              </div>
            </div>
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
                  :max="filterMaxPrice"
                  :step="1000"
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
                  :step="1"
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
                :grid-config="{
              cols: '6',
              sm: '4',
              md: '3',
              lg: '2',
              xl: '2'
            }"
              />
            </VRow>

            <!-- Индикатор загрузки при скролле -->
            <VRow v-if="isLoading">
              <VCol cols="12" class="text-center py-6" style="height: 100vh">
                <VProgressCircular indeterminate color="primary" />
              </VCol>
            </VRow>
          </VContainer>
        </div>

      </Suspense>
    </RouterView>
  </Component>
</template>

<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use "@layouts/styles/default-layout";

.banner-container {
  width: 100%;
  max-width: calc(1440px - 32px);
}

.banner-wrap {
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
  //box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.banner-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

.main-page-title{
  font-size: 1.2em;
}

.filters-container {
  margin-top: 40px;
  padding: 20px;
  border-radius: 8px;
}

.filter-btn{
  font-weight: 500;
  box-shadow: none!important;
  border: 1px solid #D0D5DD;
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

.banner-mobile{
  display: none;
}

@media screen and (max-width: 956px){
  .banner-desktop{
    display: none;
  }

  .banner-mobile{
    display: block;
    padding: 0 16px 0 16px;
  }
}

.banner-mobile{
  border-radius: 7%;
}

.filter-mobile{
  display: none;
}

.mobile-filter-btn-wrap{
  width: 33%;
}

.mobile-filter-btn-wrap button{
  font-weight: 600;
  font-size: 14px;
}

@media screen and (max-width: 600px) {
  .filter-desktop {
    display: none;
  }

  .filter-mobile {
    display: flex;
    gap: 10px;
  }

  .mobile-filter-btn-wrap button{
    font-weight: 500;
    color: rgba(var(--v-theme-on-background), 0.55);
  }

  .footer .v-container{
    padding: 0!important;
  }
}
</style>
