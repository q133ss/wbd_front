<script setup>
import { VForm } from 'vuetify/components/VForm'
import api from '@/api'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import { themeConfig } from '@themeConfig'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2LoginMaskDark from '@images/pages/auth-v2-login-mask-dark.png'
import authV2LoginMaskLight from '@images/pages/auth-v2-login-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbar = useSnackbarStore()
const authThemeImg = useGenerateImageVariant(authV2LoginIllustrationLight, authV2LoginIllustrationDark, authV2LoginIllustrationBorderedLight, authV2LoginIllustrationBorderedDark, true)
const authThemeMask = useGenerateImageVariant(authV2LoginMaskLight, authV2LoginMaskDark)

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

const isPasswordVisible = ref(false)
const route = useRoute()
const router = useRouter()

const errors = ref({
  email: undefined,
  password: undefined,
})

const refVForm = ref()

const credentials = ref({
  email: '',
  password: '',
})

const rememberMe = ref(false)

const roleMap = {
  user: 2,
  seller: 3
}

const role = route.query.role || 'user'
const role_id = 3

const login = async () => {
  try {
    const res = await api.auth.login({
      phone: credentials.value.phone,
      password: credentials.value.password,
      role_id: role_id,
    })

    const { token, user } = res

    useCookie('accessToken').value = token
    useCookie('userData').value = user

    await nextTick(() => {
      window.location.href = route.query.to ? String(route.query.to) : '/dashboard/products'
    })
  } catch (error) {
    if (error.response?.status === 422) {
      const message = error.response?.data?.errors
        ? Object.values(error.response.data.errors)[0][0]
        : 'Неверный телефон или пароль';
      snackbar.error(message)
    } else {
      snackbar.error('Неверный телефон или пароль')
    }
  }
}

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}

const reloadPage = (role) => {
  router.push('/login?role='+role).then(() => {
    window.location.reload()
  })
}
</script>

<template>
  <RouterLink to="/">
    <div class="auth-logo app-logo">
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
            Добро пожаловать на <span class="text-capitalize">{{ themeConfig.app.title }}!</span> 👋🏻
          </h4>
          <p class="mb-0">
            Пожалуйста, войдите в свою учетную запись, чтобы начать работу с сервисом
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <VTextField
                  v-model="credentials.phone"
                  label="Телефон"
                  v-mask="'+7(###)###-##-##'"
                  placeholder="+7(999)999-99-99"
                  type="text"
                  autofocus
                  :rules="[requiredValidator, phoneValidator]"
                  :error-messages="errors.phone"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="credentials.password"
                  label="Пароль"
                  placeholder="············"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  :error-messages="errors.password"
                  :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between my-6 gap-x-2">
                  <VCheckbox
                    v-model="rememberMe"
                    label="Запомнить меня"
                  />
                  <RouterLink
                    class="text-primary"
                    :to="{ name: 'forgot-password' }"
                  >
                    Забыли пароль?
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                >
                  Войти
                </VBtn>
              </VCol>

              <!-- create account -->
              <VCol
                cols="12"
                class="text-body-1 text-center"
              >
                <span class="d-inline-block">
                  Впервые у нас?
                </span>
                <RouterLink
                  class="text-primary ms-1 d-inline-block text-body-1"
                  :to="role === 'seller' ? '/register?role=seller' : '/register'"
                >
                  Создать аккаунт
                </RouterLink>
              </VCol>

              <!--              <VCol-->
              <!--                cols="12"-->
              <!--                class="d-flex align-center"-->
              <!--              >-->
              <!--                <VDivider />-->
              <!--                <span class="mx-4 text-high-emphasis">или</span>-->
              <!--                <VDivider />-->
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
