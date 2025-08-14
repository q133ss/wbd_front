<template>
  <section
    id="features"
    class="py-16"
  >
    <VContainer>
      <SectionTitle
        title="Преимущества WBdiscount"
        subtitle="Всё, что нужно для эффективного продвижения товаров на Wildberries"
        class="mb-10"
      />

      <VRow>
        <VCol
          v-for="(feature, index) in features"
          :key="feature.title"
          v-motion
          cols="12"
          md="6"
          lg="4"
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ 
            opacity: 1, 
            y: 0, 
            transition: { duration: 600, delay: index * 100 } 
          }"
        >
          <VCard
            class="h-100 pa-4"
            elevation="2"
          >
            <VRow
              no-gutters
              class="gap-3"
              align="start"
            >
              <VCol cols="auto">
                <div
                  class="d-flex align-center justify-center rounded-lg"
                  style="width: 48px; height: 48px; background-color: rgba(var(--v-theme-primary), 0.15);"
                >
                  <VIcon
                    :icon="feature.icon"
                    color="primary"
                    size="24"
                  />
                </div>
              </VCol>
              <VCol>
                <h3 class="text-h6 font-weight-medium mb-2">
                  {{ feature.title }}
                </h3>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ feature.description }}
                </p>
              </VCol>
            </VRow>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>
  </section>
</template>

<script setup>
import SectionTitle from '../Ui/SectionTitle.vue'

// Иконки Remix Icon
const features = [
  {
    title: 'Только живые покупатели',
    description: 'География ПВЗ по всей России делает продвижение органичным для алгоритмов WB.',
    icon: 'ri-user-line',
  },
  {
    title: 'Живые фото и видео в отзывах',
    description: 'Повышайте конверсию карточки за счёт медиа-отзывов.',
    icon: 'ri-camera-line',
  },
  {
    title: 'Автоматизация выкупов',
    description: 'Один раз настройте — получайте выкупы и отзывы в полуавтоматическом режиме.',
    icon: 'ri-settings-3-line',
  },
  {
    title: 'Антифрод система',
    description: 'Рейтинг, мониторинг, модерация спорных ситуаций.',
    icon: 'ri-shield-check-line',
  },
  {
    title: 'Оплата за товары',
    description: 'Безграничное количество выкупов в рамках тарифа.',
    icon: 'ri-currency-line',
  },
  {
    title: 'Простая аналитика',
    description: 'Отслеживайте эффективность продвижения в удобном интерфейсе.',
    icon: 'ri-bar-chart-line',
  },
]
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>
