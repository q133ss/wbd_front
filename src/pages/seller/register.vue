<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import authV2RegisterIllustrationBorderedDark from '@images/pages/auth-v2-register-illustration-bordered-dark.png'
import authV2RegisterIllustrationBorderedLight from '@images/pages/auth-v2-register-illustration-bordered-light.png'

import authV2RegisterIllustrationDark from '@images/pages/seller-dark.png'
import authV2RegisterIllustrationLight from '@images/pages/seller-light.png'

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
  role_id: 3,
  email: ''
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

const register = async () => {
  try{
    const response = await api.auth.register(form.value.phone, form.value.name, form.value.password, form.value.password_confirmation, form.value.role_id, form.value.email)
    const token = response.token
    const user = response.user

    useCookie('accessToken').value = token
    useCookie('userData').value = user
    router.push('/')
  }catch (error) {
    handleError(error, 'Ошибка при отправке кода')
  }
}

const roleMap = {
  user: 2,
  seller: 3
}

const role = 'seller'
const role_id = 3

const handleBtnClick = () => {
  register()
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
            Регистрация продавца 🚀
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
                  v-model="form.name"
                  label="Имя"
                  placeholder="Имя"
                  type="text"
                  autofocus
                />

                <VTextField
                  v-model="form.phone"
                  label="Телефон"
                  v-mask="'+7(###)###-##-##'"
                  placeholder="+7(999)999-99-99"
                  type="text"
                  class="mt-3"
                  :rules="[phoneValidator]"
                />

                <VTextField
                  v-model="form.email"
                  label="Email"
                  placeholder="mail@email.net"
                  type="text"
                  class="mt-3"
                />

                <VTextField
                  v-model="form.password"
                  label="Пароль"
                  placeholder="********"
                  class="mt-3"
                  type="password"
                />

                <VTextField
                  v-model="form.password_confirmation"
                  label="Повторите пароль"
                  placeholder="********"
                  class="mt-3"
                  type="password"
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="button"
                  @click="handleBtnClick"
                >
                  Зарегистрироваться
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
                  to="/seller/login"
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
