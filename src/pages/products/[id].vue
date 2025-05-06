<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import productsApi from '@/api/products';
import reviewsApi from '@/api/reviews';
import Navbar from "@/views/front-pages/front-page-navbar.vue"
import Footer from "@/views/front-pages/front-page-footer.vue"

definePage({
  meta: {
    layout: 'blank',
  },
})

const route = useRoute();
const productId = ref(route.params.id);
const product = ref(null);
const reviews = ref([]);
const summary = ref(null);
const pagination = ref(null);
const tab = ref('order'); // Вкладка по умолчанию
const currentPage = ref(1); // Текущая страница отзывов

onMounted(async () => {
  try {
    // Загружаем данные о товаре
    product.value = await productsApi.getProductById(productId.value);
    // Загружаем первую страницу отзывов
    const reviewsResponse = await reviewsApi.getProductReviews(productId.value, currentPage.value);
    reviews.value = reviewsResponse.reviews || [];
    summary.value = reviewsResponse.summary || {};
    pagination.value = reviewsResponse.pagination || {};
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  }
});

// Отладка изменения вкладок
const onTabChange = (newTab) => {
  console.log('Переключение вкладки:', newTab);
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
  <VContainer>
    <Navbar />
    <!-- Хлебные крошки -->
    <VBreadcrumbs class="breadcrumbs-container">
      <VBreadcrumbsItem to="/">Главная</VBreadcrumbsItem>
      <VBreadcrumbsItem v-if="product?.category" :to="`/categories/${product.category.id}`">
        {{ product.category.name }}
      </VBreadcrumbsItem>
      <VBreadcrumbsItem>{{ product?.name }}</VBreadcrumbsItem>
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
        <h1>{{ product?.name }}</h1>
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
          <span class="text-h5">{{ product?.price_with_cashback }} ₽</span>
          <span class="text-body-2 text-disabled text-decoration-line-through">
            {{ product?.price_without_cashback }} ₽
          </span>
          <span class="text-caption">Кешбек {{ product?.cashback_percentage }}%</span>
        </div>
        <div>Кол-во выкупов: {{ product?.redemption_count }}</div>
        <div>Осталось товаров с кэшбеком: {{ product?.product.quantity_available }}</div>
        <VBtn color="primary" class="mr-2">В избранное</VBtn>
        <VBtn color="secondary">В корзину</VBtn>
        <div class="mt-4">
          <strong>{{ product?.shop.legal_name }}</strong>
          <VRating :model-value="product?.seller_rating || 0" readonly density="compact" size="small" />
          <VBtn text>Подробнее</VBtn>
        </div>
      </VCol>
    </VRow>

    <!-- Вкладки -->
    <VRow>
      <VCol cols="12">
        <VTabs v-model="tab" @update:modelValue="onTabChange">
          <VTab value="order">Условия заказа</VTab>
          <VTab value="description">Описание</VTab>
          <VTab value="reviews">Отзывы</VTab>
        </VTabs>
        <VWindow v-model="tab">
          <VWindowItem value="order">
            <div v-html="product?.order_conditions"></div>
          </VWindowItem>
          <VWindowItem value="description">
            <div v-html="product?.product.description"></div>
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
    <Footer />
  </VContainer>
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
</style>
