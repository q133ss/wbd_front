<template>
  <Navbar />
  <VContainer class="page-container">
    <div v-if="seller" class="seller-page">
      <!-- Баннер -->
      <VCard>
        <VImg
          src="/src/assets/images/pages/user-profile-header-bg.png"
          min-height="125"
          max-height="250"
          cover
        />

        <VCardText class="d-flex align-bottom flex-sm-row flex-column justify-center gap-x-6">
          <div class="d-flex h-0">
            <VAvatar
              rounded
              color="primary"
              size="130"
              class="user-profile-avatar mx-auto"
            >
              <span class="text-lg">{{ seller.shop.wb_name.slice(0, 2).toUpperCase() }}</span>
            </VAvatar>
          </div>

          <div class="user-profile-info w-100 mt-16 pt-6 pt-sm-0 mt-sm-0">
            <h4 class="text-h4 text-center text-sm-start mb-2">
              {{ seller.shop.wb_name }}

              <VDialog
                v-model="isDialogVisible"
                width="500"
              >
                <!-- Activator -->
                <template #activator="{ props }">
                  <VBtn v-bind="props" variant="text" color="primary" class="details-btn">
                    <VIcon
                      size="20"
                      icon="ri-question-line"
                    />
                  </VBtn>
                </template>

                <!-- Dialog Content -->
                <VCard title="Информация о продавце">
                  <DialogCloseBtn
                    variant="text"
                    size="default"
                    @click="isDialogVisible = false"
                  />

                  <VCardText>
                    <VList :items="['ИНН: '+seller.shop.inn, 'Юр.лицо: '+seller.shop.legal_name]" />
                  </VCardText>
                </VCard>
              </VDialog>
            </h4>

            <div class="d-flex align-center justify-center justify-sm-space-between flex-wrap gap-6">
              <div class="d-flex flex-wrap justify-center justify-sm-start flex-grow-1 gap-6">
                <div class="d-flex align-center gap-x-2">
                  <VIcon
                    size="24"
                    icon="ri-id-card-line"
                  />
                  <div class="text-body-1 font-weight-medium">
                    ID: {{ seller.id }}
                  </div>
                </div>

                <div class="d-flex align-center gap-x-2">
                  <VIcon
                    size="24"
                    icon="ri-star-line"
                  />
                  <div class="text-body-1 font-weight-medium">
                    Рейтинг: {{ seller.rating }}
                  </div>
                </div>

                <div class="d-flex align-center gap-x-2">
                  <VIcon
                    size="24"
                    icon="ri-calendar-line"
                  />
                  <div class="text-body-1 font-weight-medium">
                    Дата регистрации: {{ formatDate(seller.shop.created_at) }}
                  </div>
                </div>
              </div>

              <VBtn prepend-icon="ri-user-follow-line">
                Страница на wildberries
              </VBtn>
            </div>
          </div>
        </VCardText>
      </VCard>


      <!-- Статистика -->
      <VRow class="mt-2">
      <VCol
        cols="12"
        lg="3"
        sm="6"
      >
        <VCard class="position-relative">
          <VCardText>
            <div class="d-flex align-center flex-wrap">
              <h3
                class="text-h4 me-2"
                :class="{
                    'text-success': seller.success_buybacks >= 75,
                    'text-warning': seller.success_buybacks >= 50 && seller.success_buybacks < 75,
                    'text-error': seller.success_buybacks < 50
                  }"
              >
                {{ seller.success_buybacks }}%
              </h3>
            </div>

            <h4 class="text-h6 mb-2">
              Успешных выкупов
            </h4>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        lg="3"
        sm="6"
      >
        <VCard class="position-relative">
          <VCardText>
            <div class="d-flex align-center flex-wrap">
              <h3
                class="text-h4 me-2"
                :class="{
                    'text-success': seller.cashback_paid >= 10000,
                    'text-warning': seller.cashback_paid >= 1000 && seller.cashback_paid < 10000,
                    'text-error': seller.cashback_paid < 1000
                  }"
              >
                {{ seller.cashback_paid }}%
              </h3>
            </div>

            <h4 class="text-h6 mb-2">
              Кэшбэка выплаченно
            </h4>
          </VCardText>
        </VCard>
      </VCol>

        <VCol
          cols="12"
          lg="3"
          sm="6"
        >
          <VCard class="position-relative">
            <VCardText>
              <div class="d-flex align-center flex-wrap">
                <h3
                  class="text-h4 me-2"
                  :class="{
                    'text-success': seller.product_rating >= 4,
                    'text-warning': seller.product_rating >= 2 && seller.product_rating < 3,
                    'text-error': seller.product_rating < 2
                  }"
                >
                  {{ seller.product_rating }}
                </h3>
              </div>

              <h4 class="text-h6 mb-2">
                Рейтинг товаров
              </h4>
            </VCardText>
          </VCard>
        </VCol>


        <VCol
          cols="12"
          lg="3"
          sm="6"
        >
          <VCard class="position-relative">
            <VCardText>
              <div class="d-flex align-center flex-wrap">
                <h3
                  class="text-h4 me-2"
                  :class="{
                    'text-success': seller.total_reviews >= 15,
                    'text-warning': seller.total_reviews >= 5 && seller.total_reviews < 15,
                    'text-error': seller.total_reviews < 5
                  }"
                >
                  {{ seller.total_reviews }}
                </h3>
              </div>

              <h4 class="text-h6 mb-2">
                Оценок товаров
              </h4>
            </VCardText>
          </VCard>
        </VCol>

      </VRow>

      <!-- Товары -->
      <div class="products row">
        <VRow>
          <ProductCard v-for="product in seller.shop.products" :key="product.id" :item="normalizeProduct(product)" />
        </VRow>
      </div>

      <!-- Отзывы -->
      <div class="reviews card-panel">
        <h3 class="center-align mb-2">Отзывы</h3>
        <VRow v-if="seller.reviews.length">
          <VCol
            cols="12"
            md="3"
            sm="6"

            v-for="review in seller.reviews" :key="review.id"
          >
            <VCard>
              <VCardTitle>
                {{ review.user_name }} ({{ formatDate(review.created_at) }})
              </VCardTitle>
              <VCardSubtitle>
                <VIcon
                  class="review-star"
                  size="24"
                  v-for="n in 5" :key="n"
                  :icon="n <= review.rating ? 'ri-star-fill' : 'ri-star-line'"
                />
              </VCardSubtitle>
              <VCardText>
                {{ review.text }}
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
        <div v-else class="center-align">
          <p class="text-caption">Нет отзывов</p>
        </div>
      </div>
<!--      /// Отзывы-->
    </div>
    <div v-else>
      <VCol cols="12" class="text-center py-10 mt-10">
        <VProgressCircular indeterminate color="primary" />
      </VCol>
    </div>
  </VContainer>
  <Footer />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { VContainer, VCol, VProgressCircular } from 'vuetify/components'
import api from '@/api'
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import ProductCard from '@/components/ProductCard.vue' // Adjust path as needed

definePage({
  meta: {
    layout: 'blank',
  },
})

const route = useRoute()
const sellerId = ref(route.params.id)
const seller = ref(null)
const isDialogVisible = ref(false)

// Получение данных продавца
onMounted(async () => {
  try {
    const response = await api.seller.getSellerById(sellerId.value)
    seller.value = response
  } catch (error) {
    console.error('Ошибка при загрузке данных продавца:', error)
  }
})

// Форматирование даты
const formatDate = (date) => {
  if (date) {
    return new Date(date).toLocaleDateString('ru-RU')
  }
  return ''
}

// Нормализация данных продукта для ProductCard
const normalizeProduct = (product) => {
  let images = []
  if (product.images) {
    if (typeof product.images === 'string') {
      try {
        images = JSON.parse(product.images)
      } catch (e) {
        console.error('Failed to parse images:', product.images, e)
      }
    } else if (Array.isArray(product.images)) {
      images = product.images
    }
  }

  // Пример логики кешбека и цены
  const discount = parseFloat(product.discount || 0)
  const price = parseFloat(product.price || 0)
  const priceWithCashback = (price * (1 - discount / 100)).toFixed(2)

  return {
    product: {
      ...product,
      images,
    },
    price_with_cashback: priceWithCashback,
    cashback_percentage: discount,
    id: product.id,
  }
}
</script>

<style scoped lang="scss">
.page-container {
  padding-top: 80px;
}

.seller-page {
  padding: 0; // Reset padding to avoid doubling with VContainer
}

.statistics {
  .card {
    transition: transform 0.2s;
    &:hover {
      transform: translateY(-5px);
    }
    .card-content {
      padding: 15px;
      h5 {
        margin: 0;
        color: #26a69a;
      }
      p {
        margin: 5px 0;
        font-size: 14px;
      }
    }
  }
}

.products {
  margin-bottom: 20px;
}

.reviews {
  .review-item {
    margin-bottom: 16px;
    .card-content {
      padding: 16px;
    }
    p {
      margin: 8px 0;
      font-size: 14px;
    }
    .rating {
      margin: 8px 0;
      font-size: 16px;
      color: #ccc;
      .filled {
        color: #ffca28;
      }
    }
    .photos {
      margin-top: 8px;
      .review-photo {
        width: 100px;
        height: 100px;
        object-fit: cover;
        margin-right: 8px;
        display: inline-block;
      }
    }
    .video {
      margin-top: 8px;
      .responsive-video {
        max-width: 200px;
      }
    }
    .answer {
      margin-top: 8px;
      padding: 8px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
  }
  .text-caption {
    font-size: 12px;
    color: #666;
  }
}

.details-btn{
  padding: 0!important;
  margin: 0;
}

.review-star{
  color: gold;
}
</style>
