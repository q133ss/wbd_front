<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
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
    unauthenticatedOnly: true,
  },
})

const form = ref({
  phone: '',
  code: ''
})

let btnText = 'Отправить код'
let step = ref(1)

const handleError = (error, errMessage = 'Произошла неизвестная ошибка') => {
  if (error.response?.status === 422) {
    const message = error.response?.data?.errors
      ? Object.values(error.response.data.errors)[0][0]
      : errMessage;
    snackbar.error(message)
  } else {
    snackbar.error(errMessage)
  }
}

const sendCode = async () => {
  if (step.value == 1) {
    try{
      const { data } = await api.auth.sendCode(form.value.phone)
      step.value = 2
      btnText = 'Подтвердить код'
      snackbar.notify({ text: 'Код успешно отправлен', color: 'success' })
    }catch (error) {
      handleError(error, 'Ошибка при отправке кода')
    }
  }
}

const route = useRoute()

const roleMap = {
  user: 2,
  seller: 3
}

const role = route.query.role || 'user'
const role_id = roleMap[role] || 2

const verifyCode = async () => {
  if (step.value == 2) {
    try{
      const router = useRouter()
      const response = await api.auth.verifyCode({phone: form.value.phone,
        code: form.value.code,
        role_id: role_id})

      const token = response.token
      const user = response.user

      useCookie('accessToken').value = token
      useCookie('userData').value = user
      router.replace('/profile')
    }catch (error) {
      console.log(error)
      handleError(error, 'Неверный код')
    }
  }
}

const handleBtnClick = () => {
  if (step.value == 1) {
    sendCode()
  } else if (step.value == 2) {
    verifyCode()
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
            Регистрация 🚀
          </h4>
          <p class="mb-0">
            Создайте аккаунт, что бы начать использовать все возможности сервиса
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- Username -->
              <VCol cols="12">
                <VTextField
                  v-model="form.phone"
                  label="Телефон"
                  v-mask="'+7(###)###-##-##'"
                  placeholder="+7(999)999-99-99"
                  type="text"
                  autofocus
                  :rules="[requiredValidator, phoneValidator]"
                  :disabled="step != 1"
                />
              </VCol>

              <VCol cols="12">
                <VTextField
                  class="mb-2"
                  v-if="step == 2"
                  v-model="form.code"
                  label="Код"
                  placeholder="1234"
                  type="text"
                />

                <VBtn
                  block
                  type="button"
                  @click="handleBtnClick"
                >
                  {{btnText}}
                </VBtn>
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

              <VCol cols="12">
                <div class="d-flex align-center">
                  <VDivider />
                  <span class="mx-4 text-high-emphasis">или</span>
                  <VDivider />
                </div>
              </VCol>

              <!-- auth providers -->
              <VCol
                cols="12"
                class="text-center"
              >
                <AuthProvider />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <div class="text-center"><router-link to="/register?role=seller">Регистрация для продавцов</router-link></div>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
