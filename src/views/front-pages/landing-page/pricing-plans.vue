<template>
  <section id="pricing" class="py-16">
    <v-container>
      <SectionTitle
        title="Выберите подходящий тариф"
        subtitle="Все тарифы безлимитные по выкупам. Платите только за объем продвигаемых товаров."
        class="mb-10"
      />

      <v-row justify="center" align="stretch" class="mx-auto gap-md-4 gap-8" style="max-width: 1200px;" dense>
        <v-col
          v-for="(plan, index) in plans"
          :key="plan.name"
          cols="12"
          md="3"
          v-motion
          class="position-relative"
          :initial="{ opacity: 0, y: 30 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: index * 150 } }"
        >
          <v-chip
              v-if="plan.popular"
              text="Most popular"
              variant="flat"
              class="position-absolute"
              style="top: -24px; left: 50%; opacity: 1; transform: translateX(-50%); z-index: 100; background-color: #F3E8FF; color: #6B21A8;"
            />
          <v-card
            :elevation="plan.popular ? 12 : 2"
            class="d-flex flex-column relative text-center pa-6"
            :style="plan.popular ? 'border: 2px solid var(--v-theme-primary); transform: scale(1.05); z-index: 10;' : ''"
          >
            <!-- Popular badge -->


            <!-- Plan header -->
            <div class="mb-6">
              <h3 class="text-h5 font-weight-bold mb-2">{{ plan.name }}</h3>
              <v-chip color="rgb(34 197 94 / var(--tw-text-opacity, 1))" class="mb-4" size="small">50% скидка</v-chip>
              
              <div class="mb-2">
                <span class="text-h2 font-weight-bold">{{ plan.price }}</span>
                <span class="text-subtitle-1 text--secondary ml-1">руб/мес</span>
              </div>
              <div class="text-body-2 text--secondary">{{ plan.subtitle }}</div>
              <div class="text-caption text--disabled">Безлимит выкупов</div>
            </div>

            <!-- Features -->
            <div class="mb-6">
              <v-row dense>
                <v-col
                  v-for="feature in plan.features"
                  :key="feature"
                  cols="12"
                  class="d-flex align-center justify-center mb-2"
                >
                  <v-icon color="rgb(34 197 94 / var(--tw-text-opacity, 1))" size="20" class="mr-2">ri-check-line</v-icon>
                  <span class="text-body-2">{{ feature }}</span>
                </v-col>
              </v-row>
            </div>

            <!-- CTA Button -->
            <v-btn
              color="primary"
              large
              block
              class="text-none"
              to="/seller/login"
            >
              Начать продвижение
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- Support link -->
      <div class="text-center mt-12">
        <p class="text-body-2 text--secondary mb-2">
          Нужна помощь с выбором тарифа?
        </p>
        <v-btn variant="text" href="https://t.me/WBDiscountPro" target="_blank" color="primary" class="font-weight-medium text-none" style="text-decoration: underline;">
          Связаться с нами
        </v-btn>
      </div>
    </v-container>
  </section>
</template>

<script setup lang="ts">
import SectionTitle from '../Ui/SectionTitle.vue'

interface Plan {
  name: string
  price: string
  subtitle: string
  costPerPurchase: string
  popular?: boolean
  features: string[]
}

const plans: Plan[] = [
  {
    name: 'Lite',
    price: '1500',
    subtitle: 'До 10 товаров в месяц',
    costPerPurchase: '',
    features: [
      'Полная аналитика',
      'Поддержка 24/7',
      'Антифрод система',
      'Живые покупатели',
      'Фото и видео отзывы',
      'Полная автоматизация',
      'Персональный менеджер'
    ]
  },
  {
    name: 'Pro',
    price: '3000',
    subtitle: 'До 50 товаров в месяц',
    costPerPurchase: '',
    popular: true,
    features: [
      'Полная аналитика',
      'Поддержка 24/7',
      'Антифрод система',
      'Живые покупатели',
      'Фото и видео отзывы',
      'Полная автоматизация',
      'Персональный менеджер'
    ]
  },
  {
    name: 'Superstar',
    price: '5000',
    subtitle: 'Безлимит товаров',
    costPerPurchase: '',
    features: [
      'Полная аналитика',
      'Поддержка 24/7',
      'Антифрод система',
      'Живые покупатели',
      'Фото и видео отзывы',
      'Полная автоматизация',
      'Персональный менеджер'
    ]
  }
]
</script>
