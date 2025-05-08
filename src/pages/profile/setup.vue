<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import authV2RegisterIllustrationBorderedDark from '@images/pages/auth-v2-register-illustration-bordered-dark.png'
import authV2RegisterIllustrationBorderedLight from '@images/pages/auth-v2-register-illustration-bordered-light.png'
import authV2RegisterIllustrationDark from '@images/pages/auth-v2-register-illustration-dark.png'
import authV2RegisterIllustrationLight from '@images/pages/auth-v2-register-illustration-light.png'
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
    authRequired: true,
  },
})

const handleError = (error, errMessage = 'Произошла неизвестная ошибка') => {
  if (error.response?.status === 422) {
    const message = error.response._data.message;
    snackbar.error(message)
  } else {
    snackbar.error(errMessage)
  }
}

const form = ref({
  name: '',
  password: '',
  password_confirmation: ''
})

const router = useRouter()

const completeRegistration = async () => {
  try{
    const response = await api.auth.completeRegistration({
      name: form.value.name,
      password: form.value.password,
      password_confirmation: form.value.password_confirmation
    })

    useCookie('userData').value = response.user
    router.replace('/profile')
  }catch (error) {
    console.log(error)
    handleError(error, 'Произошла ошибка')
  }
}
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
            Завершение регистрации 🚀
          </h4>
          <p class="mb-0">
            Почти готово! Завершите создание аккаунта и начните пользоваться всеми возможностями
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <VCol cols="12">
                <VTextField
                  class="mb-2"
                  v-model="form.name"
                  label="Имя"
                  placeholder="Алексей"
                  type="text"
                />

                <VTextField
                  class="mb-2"
                  v-model="form.password"
                  label="Пароль"
                  placeholder="Введите пароль"
                  type="password"
                />

                <VTextField
                  class="mb-2"
                  v-model="form.password_confirmation"
                  label="Подтверждение пароля"
                  placeholder="Подтвердите пароль"
                  type="password"
                />


                <VBtn
                  block
                  type="button"
                  @click="completeRegistration"
                >
                  Продолжить
                </VBtn>
              </VCol>

              <VCol cols="12" class="text-caption text-center">
                Продолжая, вы подтверждаете, что ознакоимились
                <router-link to="/terms" target="_blank">пользовательским соглашением</router-link>
                и
                <router-link to="/privacy" target="_blank">политикой конфидициальности</router-link>
              </VCol>
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
