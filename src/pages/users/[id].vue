<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VContainer, VCol, VProgressCircular } from 'vuetify/components'
import api from '@/api'
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'

definePage({
  meta: {
    layout: 'blank',
  },
})

const route = useRoute()
const router = useRouter()
const buyerId = ref(route.params.id)
const buyer = ref(null)
const isDialogVisible = ref(false)

onMounted(async () => {
  try {
    const response = await api.user.getPublicProfile(buyerId.value)
    buyer.value = response
  } catch (error) {
    if (error.status === 404) {
      router.push('/not-found')
      return
    }
    console.error('Ошибка при загрузке данных покупателя:', error)
  }
})

const formatDate = (date) => {
  if (date) {
    return new Date(date).toLocaleDateString('ru-RU')
  }
  return ''
}
</script>

<template>
  <Navbar />
  <VContainer class="page-container">
    <div v-if="buyer" class="buyer-page">
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
              <VImg v-if="buyer.avatar" :src="buyer.avatar" />
              <span v-else class="text-lg">
                {{ buyer.name ? buyer.name.slice(0, 2).toUpperCase() : 'ПО' }}
              </span>
            </VAvatar>
          </div>

          <div class="user-profile-info w-100 mt-16 pt-6 pt-sm-0 mt-sm-0">
            <h4 class="text-h4 text-center text-sm-start mb-2">
              {{ buyer.name || buyer.role.name }}
            </h4>

            <div class="d-flex align-center justify-center justify-sm-start flex-wrap gap-6">
              <div class="d-flex align-center gap-x-2">
                <VIcon size="24" icon="ri-id-card-line" />
                <div class="text-body-1 font-weight-medium">
                  ID: {{ buyer.id }}
                </div>
              </div>
              <div class="d-flex align-center gap-x-2">
                <VIcon size="24" icon="ri-star-line" />
                <div class="text-body-1 font-weight-medium">
                  Рейтинг: {{ buyer.rating }}
                </div>
              </div>
              <div class="d-flex align-center gap-x-2">
                <VIcon size="24" icon="ri-calendar-line" />
                <div class="text-body-1 font-weight-medium">
                  Дата регистрации: {{ formatDate(buyer.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </VCardText>
      </VCard>

      <!-- Статистика -->
      <VRow class="mt-2">
        <VCol cols="12" lg="6" sm="6">
          <VCard class="position-relative">
            <VCardText>
              <div class="d-flex align-center flex-wrap">
                <h3
                  class="text-h4 me-2"
                  :class="{
                    'text-success': buyer.buybacks_stats.total >= 50,
                    'text-warning': buyer.buybacks_stats.total >= 10 && buyer.buybacks_stats.total < 50,
                    'text-error': buyer.buybacks_stats.total < 10,
                  }"
                >
                  {{ buyer.buybacks_stats.total }}
                </h3>
              </div>
              <h4 class="text-h6 mb-2">
                Всего выкупов
              </h4>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" lg="6" sm="6">
          <VCard class="position-relative">
            <VCardText>
              <div class="d-flex align-center flex-wrap">
                <h3
                  class="text-h4 me-2"
                  :class="{
                    'text-success': buyer.buybacks_stats.success_percentage >= 75,
                    'text-warning': buyer.buybacks_stats.success_percentage >= 50 && buyer.buybacks_stats.success_percentage < 75,
                    'text-error': buyer.buybacks_stats.success_percentage < 50,
                  }"
                >
                  {{ buyer.buybacks_stats.success_percentage }}%
                </h3>
              </div>
              <h4 class="text-h6 mb-2">
                Успешных выкупов
              </h4>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Отзывы -->
      <div class="reviews card-panel">
        <h3 class="center-align mb-2">Отзывы</h3>
        <VRow v-if="buyer.reviews.length">
          <VCol
            cols="12"
            md="3"
            sm="6"
            v-for="review in buyer.reviews"
            :key="review.id"
          >
            <VCard>
              <VCardTitle>
                {{ review.user_name }} ({{ formatDate(review.created_at) }})
              </VCardTitle>
              <VCardSubtitle>
                <VIcon
                  class="review-star"
                  size="24"
                  v-for="n in 5"
                  :key="n"
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
    </div>
    <div v-else>
      <VCol cols="12" class="text-center py-10 mt-10">
        <VProgressCircular indeterminate color="primary" />
      </VCol>
    </div>
  </VContainer>
  <Footer />
</template>

<style scoped lang="scss">
.page-container {
  padding-top: 80px;
}

.buyer-page {
  padding: 0;
}

.reviews {
  margin-top: 2rem;
  .text-caption {
    font-size: 12px;
    color: #666;
  }
}

.details-btn {
  padding: 0 !important;
  margin: 0;
}

.review-star {
  color: gold;
}
</style>
