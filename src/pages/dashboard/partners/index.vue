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
            {{ stats.site.clicks_count }}
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
            {{ stats.site.registrations_count }}
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
            {{ stats.site.topup_count }}
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
            {{ stats.site.earnings }}
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


      <VCol cols="12">
        <h3>Статистика Telegram</h3>

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
                Активаций бота
              </div>
              <div class="text-h5 mt-2">
                {{ stats.telegram.clicks_count }}
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
                {{ stats.telegram.registrations_count }}
              </div>
            </VCard>
          </VCol>
        </VRow>

        <p class="text-body-1 mb-4 mt-10">
          Здесь отображается статистика вашей партнёрской программы в Telegram: количество переходов по ссылке и регистраций.
        </p>
        <p class="text-body-1 mb-2">
          Ваша уникальная партнёрская ссылка — используйте её, чтобы приглашать новых пользователей:
        </p>

        <VAlert
          v-if="referralLink"
          type="primary"
          class="mb-4 cursor-pointer"
          icon="$success"
          @click="copyReferralLinkTg"
        >
          <strong>{{ referralLinkTg }}</strong>
        </VAlert>
      </VCol>
    </VRow>
    <VRow v-else>
      <VCol cols="12">
        <p class="text-body-1 mb-4">
          Делитесь этой ссылкой в Telegram, соцсетях или мессенджерах.
        </p>

        <VAlert
          v-if="referralLink"
          type="primary"
          class="mb-4 cursor-pointer"
          icon="$success"
          @click="copyReferralLinkTg"
        >
          <strong>{{ referralLinkTG }}</strong>
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
  site: {
    clicks_count: 0,
    registrations_count: 0,
    topup_count: 0,
    earnings: 0,
  },
  telegram: {
    clicks_count: 0,
    registrations_count: 0,
  }

})

const user = ref(null)

const referralLink = computed(() => {
  return user.value?.id ? `https://wbdiscount.pro?ref=${user.value.id}` : ''
})

const referralLinkTg = ref('')

onMounted(async () => {
  const profile = await api.user.profile()
  if (profile) {
    user.value = profile
  }

  const referralStats = await api.referral.getReferralStats()
  if (referralStats) {
    stats.value = referralStats
  }

  const tgLink = await api.telegram.getReferralLink()
  referralLinkTg.value = tgLink.link
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

const copyReferralLinkTg = () => {
  if (referralLink.value) {
    navigator.clipboard.writeText(referralLinkTg.value)
      .then(() => {
        snackbar.notify({ text: "Ссылка скопирована в буфер обмена", color: 'success' })
      })
      .catch(err => {
        snackbar.notify({ text: "Ошибка при копировании ссылки", color: 'error' })
      })
  }
}
</script>
