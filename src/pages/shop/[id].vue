<template>
  <Navbar />
  <VContainer class="page-container">
    <div v-if="seller" class="seller-page">
      <!-- Баннер -->
      <div class="banner card-panel">
        <div class="row">
          <div class="col s12 m3 center-align">
            <div class="avatar">
              <img v-if="seller.avatar" :src="seller.avatar" alt="Аватар" class="circle responsive-img">
              <span v-else class="avatar-text">{{ seller.shop.wb_name.slice(0, 2).toUpperCase() }}</span>
            </div>
          </div>
          <div class="col s12 m9">
            <p><strong>Рейтинг:</strong> {{ seller.rating }}</p>
            <p><strong>Название:</strong> {{ seller.shop.wb_name }}</p>
            <p><strong>ИНН:</strong> {{ seller.shop.inn }}</p>
            <p><strong>ID:</strong> {{ seller.shop.id }}</p>
            <p><strong>Дата регистрации:</strong> {{ formatDate(seller.shop.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="statistics row">
        <div class="col s12 m3">
          <div class="card hoverable center-align">
            <div class="card-content">
              <h5>{{ seller.success_buybacks }}%</h5>
              <p>Успешных выкупов</p>
            </div>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="card hoverable center-align">
            <div class="card-content">
              <h5>{{ seller.cashback_paid }}</h5>
              <p>Кэшбека выплачено</p>
            </div>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="card hoverable center-align">
            <div class="card-content">
              <h5>{{ seller.product_rating }}</h5>
              <p>Рейтинг товаров</p>
            </div>
          </div>
        </div>
        <div class="col s12 m3">
          <div class="card hoverable center-align">
            <div class="card-content">
              <h5>{{ seller.total_reviews }}</h5>
              <p>Оценок товаров</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Товары -->
      <div class="products row">
        <div v-for="product in seller.shop.products" :key="product.id" class="col s12 m4">
          <ProductCard :item="{ product: normalizeProduct(product) }" />
        </div>
      </div>

      <!-- Отзывы -->
      <div class="reviews card-panel">
        <h5 class="center-align">Отзывы</h5>
        <div v-if="seller.reviews.length">
          <div v-for="review in seller.reviews" :key="review.id" class="review-item">
            <div class="card">
              <div class="card-content">
                <p><strong>{{ review.user_name }}</strong> ({{ review.created_at }})</p>
                <div class="rating">
                  <span v-for="n in 5" :key="n" :class="{ 'filled': n <= review.rating }">★</span>
                </div>
                <p v-if="review.text">{{ review.text }}</p>
                <p v-if="review.pros"><strong>Плюсы:</strong> {{ review.pros }}</p>
                <p v-if="review.cons"><strong>Минусы:</strong> {{ review.cons }}</p>
                <div v-if="review.photos?.length" class="photos">
                  <img
                    v-for="(photo, idx) in review.photos"
                    :key="idx"
                    :src="photo"
                    alt="Review photo"
                    class="review-photo"
                  />
                </div>
                <div v-if="review.video" class="video">
                  <video controls :src="review.video" class="responsive-video">
                    Ваш браузер не поддерживает видео.
                  </video>
                </div>
                <div v-if="review.answer" class="answer">
                  <p><strong>Ответ продавца ({{ formatDate(review.answer.createDate) }}):</strong></p>
                  <p>{{ review.answer.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="center-align">
          <p class="text-caption">Нет отзывов</p>
        </div>
      </div>
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
  return {
    ...product,
    images
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

.banner {
  padding: 20px;
  background: linear-gradient(135deg, #26a69a 0%, #4fc3f7 100%);
  color: white;
  .avatar {
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }
  .avatar-text {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    background-color: rgba(0, 0, 0, 0.2);
    color: white;
    font-size: 24px;
    font-weight: bold;
    border-radius: 50%;
  }
  p {
    margin: 5px 0;
    font-size: 16px;
  }
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
</style>
