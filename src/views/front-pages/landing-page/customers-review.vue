<template>
  <section class="py-16" style="overflow: hidden;">
    <VContainer>
      <SectionTitle
        title="Почему всё больше продавцов выбирают WBDiscount"
        subtitle="Попробуйте и убедитесь сами!"
        class="mb-8"
      />

      <!-- Reviews Carousel -->
      <div class="position-relative overflow-hidden">
        <div
          ref="carouselContainer"
          class="d-flex"
          :style="carouselStyle"
        >
          <div
            v-for="(review, index) in reviews"
            :key="index"
            style="flex-shrink: 0; width: 320px; transition: transform 0.5s ease;"
          >
            <v-card class="h-100" elevation="4">
              <v-card-text class="pa-6">
                <!-- Rating -->
                <VRating
                  :model-value="5"
                  readonly
                  size="10"
                  color="yellow"
                  item-icon="ri-star-s-fill"
                  item-icon-empty="ri-star-s-fill"
                  class="mb-4 d-flex justify-start gap-3"
                />

                <!-- Review Text -->
                <blockquote class="text-body-1 mb-6" style="min-height: 80px; display: flex; align-items: center;">
                  "{{ review.text }}"
                </blockquote>

                <!-- Author Info -->
                <div class="d-flex align-center">
                  <VCard color="primary"
                    class="d-flex align-center justify-center text-white font-weight-bold"
                    style="width: 48px; height: 48px; border-radius: 50%; font-size: 18px;"
                  >
                    {{ review.author.charAt(0) }}
                  </VCard>
                  <div class="ml-3">
                    <div class="text-subtitle-2 font-weight-medium">
                      {{ review.author }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ review.role }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <!-- Navigation Dots -->
        <div class="d-flex justify-center mt-8">
          <VBtn
            v-for="(_, index) in Math.ceil(reviews.length / slidesToShow)"
            :key="index"
            icon
            width="14"
            height="14"
            :color="currentSlide === index ? 'primary' : 'grey'"
            class="mx-1"
            @click="goToSlide(index)"
          />            
        </div>
      </div>

      <!-- Button -->
      <div class="text-center mt-12">
        <v-btn
          size="large"
          color="primary"
          @click="scrollToSection('pricing')"
        >
          Начать продвижение
        </v-btn>
      </div>
    </VContainer>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import SectionTitle from '../Ui/SectionTitle.vue'

const carouselContainer = ref<HTMLElement>()
const currentSlide = ref(0)
const slideWidth = ref(344) // 320px + 24px gap
const slidesToShow = ref(3)
let autoSlideInterval: NodeJS.Timeout | null = null

const reviews = [
  { text: 'Наконец-то нашёл сервис, который действительно работает. Продажи выросли на 40% за месяц.', author: 'Алексей М.', role: 'Продавец электроники' },
  { text: 'Отличная альтернатива телеграм-группам. Здесь всё прозрачно и безопасно.', author: 'Мария К.', role: 'Продавец одежды' },
  { text: 'Автоматизация сэкономила мне кучу времени. Рекомендую всем коллегам.', author: 'Дмитрий В.', role: 'Продавец товаров для дома' },
  { text: 'Поддержка работает круглосуточно, всегда помогут решить любой вопрос.', author: 'Елена П.', role: 'Продавец косметики' },
  { text: 'Аналитика просто огонь! Теперь вижу, что работает, а что нет.', author: 'Игорь С.', role: 'Продавец спортивных товаров' },
  { text: 'Безопасность на высоте. Никаких блокировок за полгода использования.', author: 'Анна С.', role: 'Продавец детских товаров' },
  { text: 'Персональный менеджер помог настроить всё под мой бизнес. Супер!', author: 'Максим О.', role: 'Продавец автотоваров' },
  { text: 'Фото и видео отзывы выглядят естественно. Покупатели доверяют.', author: 'Ольга Н.', role: 'Продавец украшений' },
  { text: 'ROI вырос в 2 раза за первый месяц. Окупилось с лихвой.', author: 'Сергей Л.', role: 'Продавец техники' },
  { text: 'Интуитивно понятный интерфейс. Разобрался за 10 минут.', author: 'Татьяна М.', role: 'Продавец книг' }
]

const carouselStyle = computed(() => ({
  transform: `translateX(-${currentSlide.value * slideWidth.value}px)`,
  transition: 'transform 0.5s ease',
  gap: '24px',
  display: 'flex'
}))

const goToSlide = (index: number) => {
  currentSlide.value = index
}

const nextSlide = () => {
  const maxSlides = Math.ceil(reviews.length / slidesToShow.value)
  currentSlide.value = (currentSlide.value + 1) % maxSlides
}

const updateSlideWidth = () => {
  if (window.innerWidth < 768) {
    slidesToShow.value = 1
    slideWidth.value = 344
  } else if (window.innerWidth < 1024) {
    slidesToShow.value = 2
    slideWidth.value = 344
  } else {
    slidesToShow.value = 3
    slideWidth.value = 344
  }
}

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  updateSlideWidth()
  window.addEventListener('resize', updateSlideWidth)
  autoSlideInterval = setInterval(nextSlide, 4000)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSlideWidth)
  if (autoSlideInterval) clearInterval(autoSlideInterval)
})
</script>
