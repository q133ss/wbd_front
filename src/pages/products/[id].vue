<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import productsApi from '@/api/products';
import reviewsApi from '@/api/reviews';
import ProductCard from '@/components/ProductCard.vue';
import Navbar from "@/views/front-pages/front-page-navbar.vue"
import Footer from "@/views/front-pages/front-page-footer.vue"

const route = useRoute();
const router = useRouter();
const productId = ref(route.params.id);
const product = ref(null);
const reviews = ref([]);
const summary = ref(null);
const pagination = ref(null);
const relatedProducts = ref([]); // Похожие товары
const tab = ref('order'); // Вкладка по умолчанию
const currentPage = ref(1); // Текущая страница отзывов
const isLoading = ref(true); // Индикатор загрузки

definePage({
  meta: {
    layout: 'blank',
  },
})

onMounted(async () => {
  try {
    // Загружаем данные о товаре
    product.value = await productsApi.getProductById(productId.value);
    // Загружаем первую страницу отзывов
    const reviewsResponse = await reviewsApi.getProductReviews(productId.value, currentPage.value);
    reviews.value = reviewsResponse.reviews || [];
    summary.value = reviewsResponse.summary || {};
    pagination.value = reviewsResponse.pagination || {};
    // Загружаем похожие товары
    const relatedResponse = await productsApi.getRelatedProducts(productId.value);
    relatedProducts.value = (relatedResponse || []).map(item => ({
      ...item,
      reviews: item.reviews || [],
      summary: item.summary || { averageRating: 0, totalReviews: 0 }
    })).slice(0, 6); // Ограничиваем до 6 товаров
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    isLoading.value = false;
  }
});

// Отладка изменения вкладок
const onTabChange = (newTab) => {
  tab.value = newTab;
};

// Загрузка следующей страницы отзывов
const loadMoreReviews = async () => {
  try {
    currentPage.value += 1;
    const reviewsResponse = await reviewsApi.getProductReviews(productId.value, currentPage.value);
    reviews.value = [...reviews.value, ...(reviewsResponse.reviews || [])];
    summary.value = reviewsResponse.summary || {};
    pagination.value = reviewsResponse.pagination || {};
  } catch (error) {
    console.error('Ошибка при загрузке отзывов:', error);
  }
};

const parsedImages = computed(() => {
  if (product.value && product.value.product && product.value.product.images) {
    const images = product.value.product.images;
    if (Array.isArray(images)) {
      return images;
    }
    if (typeof images === 'string') {
      try {
        return JSON.parse(images);
      } catch (e) {
        console.error('Ошибка при разборе изображений:', e);
        return [];
      }
    }
  }
  return [];
});
</script>

<template>
  <Navbar />
  <VProgressCircular v-if="isLoading" indeterminate />
  <VContainer v-else>
    <!-- Хлебные крошки -->
    <VBreadcrumbs class="breadcrumbs-container">
      <VBreadcrumbsItem to="/">Главная</VBreadcrumbsItem>
      <VBreadcrumbsItem v-if="product.product.category" :to="`/categories/${product.product.category.id}`">
        {{ product.product.category.name }}
      </VBreadcrumbsItem>
      <VBreadcrumbsItem>{{ product.name }}</VBreadcrumbsItem>
    </VBreadcrumbs>

    <!-- Основной контент -->
    <VRow>
      <!-- Слайдер изображений -->
      <VCol cols="12" md="6">
        <VCard class="product-card">
          <template v-if="parsedImages?.length">
            <VCarousel
              :continuous="false"
              :show-arrows="parsedImages.length > 1"
              height="400"
              hide-delimiters
            >
              <VCarouselItem
                v-for="(image, idx) in parsedImages"
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
            <div class="product-image-placeholder" style="height: 400px; background: #f2f2f2; display: flex; align-items: center; justify-content: center;">
              <span style="color: #999;">Нет изображения</span>
            </div>
          </template>
        </VCard>
      </VCol>

      <!-- Информация о товаре -->
      <VCol cols="12" md="6">
        <h1>{{ product.name }}</h1>
        <div class="d-flex align-center mb-2">
          <VRating
            :model-value="parseFloat(summary?.averageRating || 0)"
            readonly
            density="compact"
            size="small"
          />
          <span class="text-caption ml-2">({{ summary?.totalReviews || 0 }})</span>
        </div>
        <div class="d-flex align-center gap-2 mb-2">
          <span class="text-h5">{{ product.price_with_cashback }} ₽</span>
          <span class="text-body-2 text-disabled text-decoration-line-through">
            {{ product.price_without_cashback }} ₽
          </span>
          <VChip
            size="small"
            color="primary"
          >
            {{ product.cashback_percentage }}%
          </VChip>
        </div>
        <div class="buybacks_data">
          <div>Кол-во выкупов: {{ product.redemption_count }}</div>
          <div>Осталось товаров с кэшбеком: {{ product.product.quantity_available }}</div>
        </div>
        <VBtn color="secondary" class="mr-2">В избранное</VBtn>
        <VBtn color="primary">Заказать</VBtn>
        <div class="mt-4 shop-details">
          <strong>{{ product.shop.legal_name }}</strong>
          <VBtn variant="text" class="link-button ml-5">Подробнее</VBtn>
          <VRating
            :model-value="1"
            length="1"
            readonly
            density="compact"
            size="x-small"
            class="shop-rating"
          />
          ({{parseFloat(product.seller_rating || 0)}})
        </div>
      </VCol>
    </VRow>

    <!-- Вкладки -->
    <VRow>
      <VCol cols="12">
        <VTabs v-model="tab" @update:modelValue="onTabChange">
          <VTab value="order">Условия</VTab>
          <VTab value="description">Описание</VTab>
          <VTab value="reviews">Отзывы</VTab>
        </VTabs>
        <VWindow v-model="tab" class="product-tab-content">
          <VWindowItem value="order">
            <div v-if="product.order_conditions" v-html="product.order_conditions"></div>
            <div v-else class="text-caption">Условия заказа не указаны</div>
          </VWindowItem>
          <VWindowItem value="description">
            <div v-if="product?.product?.description" v-html="product?.product?.description"></div>
            <div v-else class="text-caption">Описание отсутствует</div>
          </VWindowItem>
          <VWindowItem value="reviews">
            <div v-for="review in reviews" :key="review.id" class="mb-4">
              <p><strong>{{ review.user }}</strong> ({{ review.createdDate }})</p>
              <VRating :model-value="review.rating" readonly density="compact" size="small" />
              <p v-if="review.text">{{ review.text }}</p>
              <p v-if="review.pros"><strong>Плюсы:</strong> {{ review.pros }}</p>
              <p v-if="review.cons"><strong>Минусы:</strong> {{ review.cons }}</p>
              <div v-if="review.photos.length">
                <VImg
                  v-for="(photo, idx) in review.photos"
                  :key="idx"
                  :src="photo"
                  width="100"
                  class="mr-2"
                  style="display: inline-block;"
                />
              </div>
              <div v-if="review.video">
                <video controls :src="review.video.id" style="max-width: 200px;">
                  Ваш браузер не поддерживает видео.
                </video>
              </div>
              <div v-if="review.answer" class="mt-2">
                <p><strong>Ответ продавца ({{ review.answer.createDate }}):</strong></p>
                <p>{{ review.answer.text }}</p>
              </div>
            </div>
            <div v-if="!reviews.length">Нет отзывов</div>
            <VBtn v-if="reviews.length && currentPage < pagination?.last_page" @click="loadMoreReviews">
              Загрузить еще
            </VBtn>
          </VWindowItem>
        </VWindow>
      </VCol>
    </VRow>

    <!-- Похожие товары -->
    <VRow v-if="relatedProducts.length" class="mt-8">
      <VCol cols="12">
        <h2 class="mb-4">Похожие товары</h2>
        <VRow>
          <ProductCard
            v-for="item in relatedProducts"
            :key="item.id"
            :item="item"
          />

        </VRow>
      </VCol>
    </VRow>
  </VContainer>
  <Footer />
</template>

<style scoped lang="scss">

.breadcrumbs-container{
  margin-top: 80px;
}

.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-image {
  object-fit: cover;
}

.mb-4 {
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.v-img {
  vertical-align: middle;
}

video {
  margin-top: 1rem;
}

.d-flex.align-center.mb-2 {
  gap: 0.5rem;
}

.text-caption {
  color: #666;
}

.mt-8 {
  padding-top: 2rem;
}

h2.mb-4 {
  font-size: 1.5rem;
  font-weight: 500;
}

.buybacks_data{
  border-top: 1px solid #eeeeee;
  border-bottom: 1px solid #eeeeee;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.shop-details{
  display: flex;
  align-items: center;
  border: 1px solid #eeeeee;
  padding: 10px;
  width: 300px;
  border-radius: 5px;
}

.product-tab-content{
  margin-top: 20px;
}
</style>
