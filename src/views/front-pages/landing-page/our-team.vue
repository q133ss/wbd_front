<template>
  <section id="how-it-works" class="py-12">
    <v-container>
      <SectionTitle
        title="Как это работает"
        subtitle="Простой процесс в три шага"
        class="mb-10"
      />

      <v-row class="position-relative d-flex justify-center gap-5" align="stretch" dense >
        <v-col
          v-for="(step, index) in steps"
          :key="step.title"
          v-motion
          min-width="320"
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: index * 200 } }"
          class="d-flex justify-center w-100"
        >
          <v-card class="text-center h-100 pa-6" elevation="6" style="position: relative; z-index: 1;">
            <!-- Step number -->
            <VCard
            color="primary"
              class="d-flex align-center justify-center text-white font-weight-bold mb-4"
              style="width: 64px; height: 64px; border-radius: 50%; background-color: var(--v-theme-primary); font-size: 24px; margin: 0 auto 16px auto;"
            >
              {{ index + 1 }}
            </VCard>

            <!-- Step icon -->
            <div
              class="d-flex align-center justify-center mb-4"
              style="width: 48px; height: 48px; border-radius: 8px; background-color: rgba(var(--v-theme-primary), 0.15); margin: 0 auto;"
            >
              <v-icon :icon="step.icon" color="primary" size="24" />
            </div>

            <!-- Step content -->
            <h3 class="text-h6 font-weight-medium mb-2">{{ step.title }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ step.description }}</p>

            <!-- Connector line (для md+) -->
            <div
              v-if="index < steps.length - 1"
              class="d-none d-md-block"
              :style="{
                position: 'absolute',
                top: '48px',
                left: '100%',
                width: '100%',
                height: '2px',
                background: 'linear-gradient(to right, rgba(var(--v-theme-primary),0.3), rgba(var(--v-theme-primary),0.15))',
                transform: 'translateX(16px)',
                zIndex: 0
              }"
            ></div>
          </v-card>
        </v-col>
      </v-row>

      <div class="text-center mt-12">
        <v-btn size="large" color="primary" @click="scrollToSection('pricing')">
          Начать продвижение
        </v-btn>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import SectionTitle from '../Ui/SectionTitle.vue'

const steps = [
  {
    title: 'Выложите объявление',
    description: 'Загрузите товар по артикулу, укажите размер кэшбэка, ключевые слова и критерии к отзыву.',
    icon: 'ri-add-line'
  },
  {
    title: 'Получайте заявки от покупателей',
    description: 'Вам остаётся только проверять фото/видео, которые отправляют покупатели.',
    icon: 'ri-group-line'
  },
  {
    title: 'Выплачивайте кэшбек',
    description: 'Отправляйте кэшбек только тем, кто полностью выполнил условия.',
    icon: 'ri-currency-line'
  }
]

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
