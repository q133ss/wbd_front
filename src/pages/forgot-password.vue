<script setup>
import authV2ForgotPasswordIllustrationBorderedDark from '@images/pages/auth-v2-forgot-password-illustration-bordered-dark.png'
import authV2ForgotPasswordIllustrationBorderedLight from '@images/pages/auth-v2-forgot-password-illustration-bordered-light.png'

import authV2ForgotPasswordIllustrationDark from '@images/pages/buyer-dark.png'
import authV2ForgotPasswordIllustrationLight from '@images/pages/buyer-light.png'

import authV2ForgotPasswordMaskDark from '@images/pages/auth-v2-forgot-password-mask-dark.png'
import authV2ForgotPasswordMaskLight from '@images/pages/auth-v2-forgot-password-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/api'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const authThemeImg = useGenerateImageVariant(
  authV2ForgotPasswordIllustrationLight,
  authV2ForgotPasswordIllustrationDark,
  authV2ForgotPasswordIllustrationBorderedLight,
  authV2ForgotPasswordIllustrationBorderedDark,
  true
)
const authThemeMask = useGenerateImageVariant(authV2ForgotPasswordMaskLight, authV2ForgotPasswordMaskDark)

const router = useRouter()
const route = useRoute()
const snackbar = useSnackbarStore()

const step = ref(1) // 1: Phone input, 2: Code verification, 3: Password reset
const phone = ref('')
const forSeller = ref(false)
const code = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const isLoading = ref(false)
const token = ref('')

definePage({
  meta: {
    layout: 'blank',
    unauthenticatedOnly: true,
  },
})

// Handle sending reset code
const handleSendResetCode = async () => {
  if (!phone.value) {
    snackbar.notify({ text: 'Введите номер телефона', color: 'error' })
    return
  }
  isLoading.value = true
  try {
    await api.auth.sendResetCode(phone.value, forSeller.value)
    snackbar.notify({ text: 'Ссылка отправлена вам в Telegram', color: 'success' })
    step.value = 2
  } catch (error) {
    snackbar.notify({
      text: error.response?._data?.message || 'Ошибка при отправке ссылки',
      color: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

// Handle password reset
const handleResetPassword = async () => {
  if (!password.value || !passwordConfirmation.value) {
    snackbar.notify({ text: 'Введите пароль и подтверждение', color: 'error' })
    return
  }
  if (password.value !== passwordConfirmation.value) {
    snackbar.notify({ text: 'Пароли не совпадают', color: 'error' })
    return
  }
  isLoading.value = true
  try {
    const res = await api.auth.resetPassword(token.value,
      forSeller.value,
      password.value,
      passwordConfirmation.value)

    useCookie('accessToken').value = res.token
    useCookie('userData').value = res.user

    await nextTick(() => {
      window.location.href = route.query.to ? String(route.query.to) : '/'
    })

    snackbar.notify({ text: 'Пароль успешно сброшен', color: 'success' })
    router.push({ name: 'login' })
  } catch (error) {
    console.error(error)
    snackbar.notify({
      text: error.response?._data?.message || 'Ошибка при сбросе пароля',
      color: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

// Handle form submission based on step
const handleSubmit = async () => {
  if (step.value === 1) {
    await handleSendResetCode()
  } else if (step.value === 3) {
    await handleResetPassword()
  }
}

onMounted(() => {
  if (route.query.token) {
    token.value = route.query.token
    step.value = 3

    // Проверяем роль из URL
    if (route.query.role === 'seller') {
      forSeller.value = true
    } else if (route.query.role === 'buyer') {
      forSeller.value = false
    }
  }
})
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

  <VRow class="auth-wrapper" no-gutters>
    <VCol md="8" class="d-none d-md-flex align-center justify-center position-relative">
      <div class="d-flex align-center justify-center pa-10">
        <img :src="authThemeImg" class="auth-illustration w-100" alt="auth-illustration">
      </div>
      <VImg :src="authThemeMask" class="d-none d-md-flex auth-footer-mask" alt="auth-mask" />
    </VCol>

    <VCol cols="12" md="4" class="auth-card-v2 d-flex align-center justify-center" style="background-color: rgb(var(--v-theme-surface));">
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-5 pa-lg-7">
        <VCardText>
          <h4 class="text-h4 mb-1">
            Восстановление пароля 🔒
          </h4>
          <p class="mb-0">
            {{ step === 1 ? 'Введите номер телефона, чтобы сменить пароль' : (step === 3 ? 'Введите новый пароль' : '') }}
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="handleSubmit">
            <VRow>
              <VCol cols="12" v-if="step === 1">
                <VRadioGroup v-model="forSeller" inline>
                  <VRadio label="Покупатель" :value="false" />
                  <VRadio label="Продавец" :value="true" />
                </VRadioGroup>
              </VCol>
              <!-- Step 1: Phone input -->
              <VCol v-if="step === 1" cols="12">
                <VTextField
                  v-model="phone"
                  autofocus
                  label="Телефон"
                  v-mask="'+7(###)###-##-##'"
                  placeholder="+7(999)999-99-99"
                  type="tel"
                  :disabled="isLoading"
                />
              </VCol>

              <VCol cols="12" v-if="step === 2">
                Ссылка для восстановления пароля отправлена вам в Telegram!
              </VCol>

              <!-- Step 3: Password inputs -->
              <template v-if="step === 3">
                <VCol cols="12">
                  <VTextField
                    v-model="password"
                    autofocus
                    label="Новый пароль"
                    placeholder="········"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="showPassword = !showPassword"
                    :disabled="isLoading"
                  />
                </VCol>
                <VCol cols="12">
                  <VTextField
                    v-model="passwordConfirmation"
                    label="Подтверждение пароля"
                    placeholder="········"
                    :type="showPasswordConfirmation ? 'text' : 'password'"
                    :append-inner-icon="showPasswordConfirmation ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="showPasswordConfirmation = !showPasswordConfirmation"
                    :disabled="isLoading"
                  />
                </VCol>
              </template>

              <!-- Submit button -->
              <VCol cols="12">
                <VBtn block type="submit" :loading="isLoading" v-if="step != 2">
                  {{ step === 1 ? 'Отправить код' : 'Сбросить пароль' }}
                </VBtn>
              </VCol>

              <!-- Back to login -->
              <VCol cols="12">
                <RouterLink class="d-flex align-center justify-center" :to="{ name: 'login' }">
                  <VIcon icon="ri-arrow-left-s-line" size="20" class="me-2 flip-in-rtl" />
                  <span>Вернуться к входу</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
