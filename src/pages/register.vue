<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV2RegisterIllustrationBorderedDark from '@images/pages/auth-v2-register-illustration-bordered-dark.png'
import authV2RegisterIllustrationBorderedLight from '@images/pages/auth-v2-register-illustration-bordered-light.png'

import authV2RegisterIllustrationDark from '@images/pages/buyer-dark.png'
import authV2RegisterIllustrationLight from '@images/pages/buyer-light.png'
// import authV2RegisterIllustrationDark from '@images/pages/auth-v2-register-illustration-dark.png'
// import authV2RegisterIllustrationLight from '@images/pages/auth-v2-register-illustration-light.png'

import authV2RegisterMaskDark from '@images/pages/auth-v2-register-mask-dark.png'
import authV2RegisterMaskLight from '@images/pages/auth-v2-register-mask-light.png'
import api from '@/api'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbar = useSnackbarStore()

const authThemeMask = useGenerateImageVariant(authV2RegisterMaskLight, authV2RegisterMaskDark)
const authThemeImg = useGenerateImageVariant(authV2RegisterIllustrationLight, authV2RegisterIllustrationDark, authV2RegisterIllustrationBorderedLight, authV2RegisterIllustrationBorderedDark, true)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const form = ref({
  phone: '',
  name: '',
  password: '',
  password_confirmation: '',
  role_id: 2
})

const handleError = (error, errMessage = 'Произошла неизвестная ошибка') => {
  if (error.response?.status === 422) {
    const message = error.response._data.message;
    snackbar.error(message)
  } else {
    snackbar.error(errMessage)
  }
}

const route = useRoute()
const router = useRouter()

const openBot = () => {
  window.open(
    'https://t.me/wbdappc_bot?start=register',
    '_blank',
    'noopener,noreferrer'
  )
}

const roleMap = {
  user: 2,
  seller: 3
}

const role = route.query.role || 'user'
const role_id = roleMap[role] || 2
</script>

<template>
  <RouterLink to="/">
    <div class="app-logo auth-logo">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="app-logo-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </RouterLink>

  <VRow
    no-gutters
    class="auth-wrapper"
  >
    <VCol
      md="8"
      class="d-none d-md-flex align-center justify-center position-relative"
    >
      <!-- here your illustrator -->
      <div class="d-flex align-center justify-center pa-10">
        <img
          :src="authThemeImg"
          class="auth-illustration w-100"
          alt="auth-illustration"
        >
      </div>
      <VImg
        :src="authThemeMask"
        class="d-none d-md-flex auth-footer-mask"
        alt="auth-mask"
      />
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface));"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-5 pa-lg-7"
      >
        <VCardText>
          <h4 class="text-h4 mb-1">
            Регистрация 🚀
          </h4>
          <p class="mb-0">
            Создайте аккаунт, что бы начать использовать все возможности сервиса
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <VCol cols="12">
                <VBtn
                  block
                  color="white"
                  variant="outlined"
                  type="button"
                  prepend-icon="ri-telegram-fill"
                  @click="openBot()"
                >Регистрация через Telegram</VBtn>
              </VCol>

              <VCol cols="12" class="text-caption text-center">
                Продолжая, вы подтверждаете, что ознакоимились
                <router-link to="/terms" target="_blank">пользовательским соглашением</router-link>
                и
                <router-link to="/privacy" target="_blank">политикой конфидициальности</router-link>
              </VCol>

              <!-- create account -->
              <VCol cols="12">
                <div class="text-center text-base">
                  <span class="d-inline-block">Уже есть аккаунт?</span> <RouterLink
                    class="text-primary d-inline-block"
                    :to="{ name: 'login' }"
                  >
                    Войти
                  </RouterLink>
                </div>
              </VCol>

<!--              <VCol cols="12">-->
<!--                <div class="d-flex align-center">-->
<!--                  <VDivider />-->
<!--                  <span class="mx-4 text-high-emphasis">или</span>-->
<!--                  <VDivider />-->
<!--                </div>-->
<!--              </VCol>-->

<!--              &lt;!&ndash; auth providers &ndash;&gt;-->
<!--              <VCol-->
<!--                cols="12"-->
<!--                class="text-center"-->
<!--              >-->
<!--                <AuthProvider />-->
<!--              </VCol>-->
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
