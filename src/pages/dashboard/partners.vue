<template>
  <v-container class="py-6">
    <!-- Заголовок и описание -->
    <v-row>
      <v-col>
        <h1 class="text-h4 font-weight-bold mb-2">Партнёрская программа</h1>
        <p class="text-body-1">
          Зарабатывайте вместе с нами — приглашайте пользователей и получайте бонусы!
        </p>
      </v-col>
    </v-row>

    <!-- Блоки статистики -->
    <v-row class="mt-6" align="stretch">
      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" outlined>
          <div class="text-subtitle-1 font-weight-medium">Перешли по ссылке</div>
          <div class="text-h5 mt-2">{{ stats.clicks_count }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" outlined>
          <div class="text-subtitle-1 font-weight-medium">Зарегистрировались</div>
          <div class="text-h5 mt-2">{{ stats.registrations_count }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" outlined>
          <div class="text-subtitle-1 font-weight-medium">Пополнили баланс</div>
          <div class="text-h5 mt-2">{{ stats.topup_count }}</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="pa-4" outlined>
          <div class="text-subtitle-1 font-weight-medium">Вы заработали</div>
          <div class="text-h5 mt-2">—</div> <!-- Можно заменить на сумму, если появится -->
        </v-card>
      </v-col>
    </v-row>

    <!-- Ссылка и инструкция -->
    <v-row class="mt-10">
      <v-col cols="12">
        <p class="text-body-1 mb-4">
          Специально для вас мы создали партнёрскую программу, по которой вы сможете зарабатывать независимо от собственных продвижений.
        </p>
        <p class="text-body-1 mb-2">
          Копируйте вашу индивидуальную ссылку:
        </p>

        <v-alert
          v-if="referralLink"
          type="info"
          border="start"
          colored-border
          class="mb-4"
          dense
        >
          <strong>{{ referralLink }}</strong>
        </v-alert>

        <p class="text-body-1 mb-4">
          Отправляйте другу, получайте <strong>10% от всех его платежей</strong> и выводите отчисления по партнёрской программе от <strong>10 000 ₽</strong>.
        </p>

        <p class="text-body-1">
          А если вы являетесь веб-специалистом или медийной личностью, то для вас есть особые условия. <br />
          <a href="/dashboard/support" class="text-primary font-weight-medium">Напишите нам</a> и узнайте все подробности.
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/api'

const stats = ref({
  clicks_count: 0,
  registrations_count: 0,
  topup_count: 0
})

const user = ref(null)

const referralLink = computed(() => {
  return user.value?.id ? `https://wbdiscount.pro?ref=${user.value.id}` : ''
})

onMounted(async () => {
  const profile = await api.user.profile()
  if (profile) {
    user.value = profile
  }

  const referralStats = await api.referral.getReferralStats()
  if (referralStats) {
    stats.value = referralStats
  }
})
</script>
