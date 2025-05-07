<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import productsApi from '@/api/products';
import reviewsApi from '@/api/reviews';
import favoriteApi from "@/api/favorite";
import ProductCard from '@/components/ProductCard.vue';
import Navbar from "@/views/front-pages/front-page-navbar.vue";
import Footer from "@/views/front-pages/front-page-footer.vue";

definePage({
  meta: {
    layout: 'blank',
  },
})

const route = useRoute();
const router = useRouter();
const productId = ref(route.params.id);
const product = ref(null);
const reviews = ref([]);
const summary = ref(null);
const pagination = ref(null);
const relatedProducts = ref([]);
const tab = ref('order');
const currentPage = ref(1);
const isLoading = ref(true);
const errorMessage = ref(null);

const email = ref('')
const password = ref()

// Функция для загрузки данных
const loadProductData = async (id) => {
  try {
    isLoading.value = true;
    errorMessage.value = null;

    // Загружаем данные о товаре
    product.value = await productsApi.getProductById(id);

    // Загружаем первую страницу отзывов
    const reviewsResponse = await reviewsApi.getProductReviews(id, currentPage.value);

    // Проверяем, что reviewsResponse содержит ожидаемые данные
    if (!reviewsResponse || typeof reviewsResponse !== 'object') {
      throw new Error('Некорректный формат ответа API для отзывов');
    }

    reviews.value = reviewsResponse.reviews || [];
    summary.value = reviewsResponse.summary || {};
    pagination.value = reviewsResponse.pagination || {};

    // Загружаем похожие товары
    const relatedResponse = await productsApi.getRelatedProducts(id);
    relatedProducts.value = (relatedResponse || []).map(item => ({
      ...item,
      reviews: item.reviews || [],
      summary: item.summary || { averageRating: 0, totalReviews: 0 }
    })).slice(0, 6);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
    errorMessage.value = 'Не удалось загрузить данные. Попробуйте позже.';
  } finally {
    isLoading.value = false;
  }
};

// Выполняем загрузку данных при монтировании
onMounted(() => {
  loadProductData(productId.value);
});

// Отслеживаем изменения маршрута
watch(
  () => route.params.id,
  (newId) => {
    if (newId && newId !== productId.value) {
      productId.value = newId;
      currentPage.value = 1; // Сбрасываем страницу отзывов
      reviews.value = []; // Сбрасываем отзывы
      summary.value = null; // Сбрасываем сводку
      pagination.value = null; // Сбрасываем пагинацию
      loadProductData(newId); // Загружаем данные для нового товара
    }
  }
);

// Отладка изменения вкладок
const onTabChange = (newTab) => {
  tab.value = newTab;
};

// Загрузка следующей страницы отзывов
const loadMoreReviews = async () => {
  try {
    currentPage.value += 1;
    const reviewsResponse = await reviewsApi.getProductReviews(productId.value, currentPage.value);

    if (!reviewsResponse || typeof reviewsResponse !== 'object') {
      throw new Error('Некорректный формат ответа API для дополнительных отзывов');
    }

    reviews.value = [...reviews.value, ...(reviewsResponse.reviews || [])];
    summary.value = reviewsResponse.summary || {};
    pagination.value = reviewsResponse.pagination || {};
  } catch (error) {
    console.error('Ошибка при загрузке дополнительных отзывов:', error);
    errorMessage.value = 'Не удалось загрузить дополнительные отзывы.';
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

const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('ru-RU', options);
}

const isLoginFormVisible = ref(false)
const addToFavorites = async (productId) => {
  try {
    // Вызываем метод addToFavorite и передаем productId
    const response = await favoriteApi.addToFavorite(productId)
    // Здесь можно обработать результат, например, показать уведомление о добавлении в избранное
    console.log('Товар добавлен в избранное:', response)
  } catch (error) {
    if(error.statusCode == 401){
      isLoginFormVisible.value = true;
    }else{
      console.error('Ошибка при добавлении в избранное:', error)
    }
  }
}

const resetLoginForm = () => {
  email.value = ''
  password.value = ''
  isLoginFormVisible.value = false
}
</script>

<template>
  <Navbar />
  <VCol cols="12" v-if="isLoading" class="text-center py-10 mt-10">
    <VProgressCircular indeterminate color="primary" />
  </VCol>
  <VContainer v-else>
    <!-- Отображение ошибки, если она есть -->
    <VAlert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </VAlert>

    <!-- Хлебные крошки -->
    <VBreadcrumbs class="breadcrumbs-container">
      <VBreadcrumbsItem to="/">Главная</VBreadcrumbsItem>
      <span>/</span>
      <VBreadcrumbsItem v-if="product?.product?.category" :to="`/categories/${product.product.category.id}`">
        {{ product.product.category.name }}
      </VBreadcrumbsItem>
      <span>/</span>
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
          <!-- Плейсхолдер если нет картинок -->
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
          <VChip
            size="small"
            color="primary"
          >
            {{ product?.cashback_percentage }}%
          </VChip>
        </div>
        <div class="buybacks_data">
          <div>Кол-во выкупов: {{ product?.redemption_count }}</div>
          <div>Осталось товаров с кэшбеком: {{ product?.product?.quantity_available }}</div>
        </div>
        <VBtn color="secondary" class="mr-2" @click="addToFavorites(product.id)">В избранное</VBtn>
        <VBtn color="primary">Заказать</VBtn>
        <div class="mt-4 shop-details">
          <strong>{{ product?.shop?.legal_name }}</strong>
          <VBtn variant="text" class="link-button ml-5" :to="`/shop/${product.shop?.user_id}`">Подробнее</VBtn>
          <VRating
            :model-value="1"
            length="1"
            readonly
            density="compact"
            size="x-small"
            class="shop-rating"
          />
          ({{ parseFloat(product?.seller_rating || 0) }})
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
            <div v-if="product?.order_conditions" v-html="product.order_conditions"></div>
            <div v-else class="text-caption">Условия заказа не указаны</div>
          </VWindowItem>
          <VWindowItem value="description">
            <div v-if="product?.product?.description" v-html="product?.product?.description"></div>
            <div v-else class="text-caption">Описание отсутствует</div>
          </VWindowItem>
          <VWindowItem value="reviews">
            <div v-if="reviews.length">
              <div v-for="review in reviews" :key="review.id" class="mb-4">
                <p><strong>{{ review.user }}</strong> ({{ formatDate(review.createdDate) }})</p>
                <VRating :model-value="review.rating" readonly density="compact" size="small" />
                <p v-if="review.text">{{ review.text }}</p>
                <p v-if="review.pros"><strong>Плюсы:</strong> {{ review.pros }}</p>
                <p v-if="review.cons"><strong>Минусы:</strong> {{ review.cons }}</p>
                <div v-if="review.answer" class="mt-2">
                  <p><strong>Ответ продавца ({{ formatDate(review.answer.createDate) }}):</strong></p>
                  <p>{{ review.answer.text }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-caption">Нет отзывов</div>
            <VBtn
              v-if="pagination?.last_page && currentPage < pagination.last_page"
              @click="loadMoreReviews"
              :disabled="isLoading"
            >
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

  <VDialog
    :model-value="isLoginFormVisible"
    @update:model-value="val => { if (!val) resetLoginForm() }"
    max-width="900"
  >
    <VCard class="share-project-dialog pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        size="default"
        variant="text"
        @click="resetLoginForm"
      />
      <VCardText class="pt-5">

        <VRow>
          <VCol cols="12">
            <h2>Что бы продолжить, войдите в систему</h2>
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="email"
              label="Email"
              type="email"
              placeholder="email@mail.net"
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model="password"
              label="Пароль"
              autocomplete="on"
              type="password"
              placeholder="············"
            />
          </VCol>

          <VCol
            cols="12"
            class="d-flex gap-4"
          >
            <VBtn type="submit">
              Войти
            </VBtn>

            <VBtn
              color="secondary"
            >
              Регистрация
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style scoped lang="scss">
.breadcrumbs-container {
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

.buybacks_data {
  border-top: 1px solid #eeeeee;
  border-bottom: 1px solid #eeeeee;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.shop-details {
  display: flex;
  align-items: center;
  border: 1px solid #eeeeee;
  padding: 10px;
  width: 300px;
  border-radius: 5px;
}

.product-tab-content {
  margin-top: 20px;
}
</style>
