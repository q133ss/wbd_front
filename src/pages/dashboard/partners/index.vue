<template>
  <VContainer class="py-6">
    <!-- Заголовок и описание -->
    <VRow>
      <VCol>
        <h1 class="text-h4 font-weight-bold mb-2">
          Партнёрская программа
        </h1>
        <p class="text-body-1">
          Зарабатывайте вместе с нами — приглашайте пользователей и получайте бонусы!
        </p>
      </VCol>
    </VRow>

    <!-- Блоки статистики -->
    <VRow
      class="mt-6"
      align="stretch"
    >
      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard
          class="pa-4"
          outlined
        >
          <div class="text-subtitle-1 font-weight-medium">
            Перешли по ссылке
          </div>
          <div class="text-h5 mt-2">
            {{ stats.clicks_count }}
          </div>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard
          class="pa-4"
          outlined
        >
          <div class="text-subtitle-1 font-weight-medium">
            Зарегистрировались
          </div>
          <div class="text-h5 mt-2">
            {{ stats.registrations_count }}
          </div>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard
          class="pa-4"
          outlined
        >
          <div class="text-subtitle-1 font-weight-medium">
            Пополнили баланс
          </div>
          <div class="text-h5 mt-2">
            {{ stats.topup_count }}
          </div>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        sm="6"
        md="3"
      >
        <VCard
          class="pa-4"
          outlined
        >
          <div class="text-subtitle-1 font-weight-medium">
            Вы заработали
          </div>
          <div class="text-h5 mt-2">
            {{ stats.earnings }}
          </div> <!-- Можно заменить на сумму, если появится -->
        </VCard>
      </VCol>
    </VRow>

    <!-- Ссылка и инструкция -->
    <VRow
      v-if="user?.role?.slug == 'seller'"
      class="mt-10"
    >
      <VCol cols="12">
        <p class="text-body-1 mb-4">
          Специально для вас мы создали партнёрскую программу, по которой вы сможете зарабатывать независимо от собственных продвижений.
        </p>
        <p class="text-body-1 mb-2">
          Копируйте вашу индивидуальную ссылку:
        </p>

        <VAlert
          v-if="referralLink"
          type="primary"
          class="mb-4 cursor-pointer"
          icon="$success"
          @click="copyReferralLink"
        >
          <strong>{{ referralLink }}</strong>
        </VAlert>

        <p class="text-body-1 mb-4">
          Отправляйте другу, получайте <strong>10% от всех его платежей</strong> и выводите отчисления по партнёрской программе от <strong>10 000 ₽</strong>.
        </p>

        <p class="text-body-1">
          А если вы являетесь веб-специалистом или медийной личностью, то для вас есть особые условия. <br>
          <a
            href="/dashboard/support"
            class="text-primary font-weight-medium"
          >Напишите нам</a> и узнайте все подробности.
        </p>
      </VCol>
    </VRow>
    <VRow v-else>
      <VCol cols="12">
        <p class="text-body-1 mb-4">
          Специально для вас мы создали партнёрскую программу, по которой вы сможете зарабатывать не только с кэшбека, но и за рекомендации сервиса!
        </p>
        <p class="text-body-1 mb-2">
          Копируйте вашу индивидуальную ссылку:
        </p>

        <VAlert
          v-if="referralLink"
          type="primary"
          class="mb-4 cursor-pointer"
          icon="$success"
          @click="copyReferralLink"
        >
          <strong>{{ referralLink }}</strong>
        </VAlert>

        <p class="text-body-1 mb-4">
          Отправляйте другу, который хочет продвигать свои товары на Wildberries и получайте <strong>10% от всех его платежей в системе.</strong>
        </p>

        <p class="text-body-1">
          Выводите отчисления по партнёрской программе от <strong>1000 ₽</strong>.<br>
          А если вы являетесь веб-специалистом или медийной личностью, то для вас есть особые условия.
          <a
            href="/dashboard/support"
            class="text-primary font-weight-medium"
          >Напишите нам</a> и узнайте все подробности.
        </p>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
import api from '@/api/index.js'
import { useSnackbarStore } from "@/stores/snackbar.js"
import { computed, onMounted, ref } from 'vue'

definePage({
  meta: {
    authRequired: true,
  },
})

const snackbar = useSnackbarStore()

const stats = ref({
  clicks_count: 0,
  registrations_count: 0,
  topup_count: 0,
  earnings: 0,
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

const copyReferralLink = () => {
  if (referralLink.value) {
    navigator.clipboard.writeText(referralLink.value)
      .then(() => {
        snackbar.notify({ text: "Ссылка скопирована в буфер обмена", color: 'success' })
      })
      .catch(err => {
        snackbar.notify({ text: "Ошибка при копировании ссылки", color: 'error' })
      })
  }
}
</script>
