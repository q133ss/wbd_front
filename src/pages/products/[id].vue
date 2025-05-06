<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import productsApi from '@/api/products'; // Убедитесь, что путь правильный

const route = useRoute();
const productId = ref(route.params.id);
const product = ref(null);
const tab = ref('order'); // Вкладка по умолчанию

onMounted(async () => {
  try {
    product.value = await productsApi.getProductById(productId.value);
  } catch (error) {
    console.error('Ошибка при загрузке товара:', error);
  }
});

const parsedImages = computed(() => {
  if (product.value && product.value.product && product.value.product.images) {
    const images = product.value.product.images;
    if (Array.isArray(images)) {
      return images; // Если images уже массив, возвращаем его
    }
    if (typeof images === 'string') {
      try {
        return JSON.parse(images); // Если images - строка JSON, парсим её
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
    <!-- Хлебные крошки -->
    <VBreadcrumbs>
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
        <VRating :model-value="parseFloat(product?.product.rating)" readonly density="compact" size="small" />
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
          <VRating readonly density="compact" size="small" /> <!-- Заглушка для рейтинга магазина -->
          <VBtn text>Подробнее</VBtn>
        </div>
      </VCol>
    </VRow>

    <!-- Вкладки -->
    <VRow>
      <VCol cols="12">
        <VTabs v-model="tab">
          <VTab value="order">Условия заказа</VTab>
          <VTab value="description">Описание</VTab>
          <VTab value="reviews">Отзывы</VTab>
        </VTabs>
        <VTabsItems v-model="tab">
          <VTabItem value="order">
            <div v-html="product?.order_conditions"></div>
          </VTabItem>
          <VTabItem value="description">
            <div v-html="product?.product.description"></div>
          </VTabItem>
          <VTabItem value="reviews">
            <div v-for="review in product?.reviews" :key="review.id" class="mb-4">
              <p>{{ review.text }}</p>
              <VRating :model-value="review.rating" readonly density="compact" size="small" />
              <small>{{ review.created_at }}</small>
            </div>
            <div v-if="!product?.reviews.length">Нет отзывов</div>
          </VTabItem>
        </VTabsItems>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped lang="scss">
.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-image {
  object-fit: cover;
}
</style>
