<script setup>
import { ref } from 'vue'
import api from '@/api'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbar = useSnackbarStore()
const userData = useCookie('userData')
const role = userData?.value?.role?.slug || 'buyer' // Default to 'buyer' if role is not set
const isDialogVisible = ref(false)


definePage({
  meta: {
    authRequired: true,
  },
})

// Form data
const formData = ref({
  name: userData.value.name || '',
  phone: userData.value.phone || '',
  inn: userData.value.shop?.inn || '',
  legal_name: userData.value.shop?.legal_name || '',
  wb_name: userData.value.shop?.wb_name || '',
  email: userData.value.email || '',
  password: '',
  password_confirmation: '',
})

const isLoading = ref(false)

const statistics = ref(null)
const statisticsResponse = await api.profile.getProfileStatistics()
statistics.value = statisticsResponse

// Телеграм бот qr
const telegramLinkCookie = useCookie('telegramBotLink')
const qrCodeLink = ref(null)
const qrCodeSrc = ref('')

const openBot = async () => {
  if (telegramLinkCookie.value) {
    window.open(telegramLinkCookie.value, '_blank')
  } else {
    const response = await api.profile.getTelegramLink()
    if (response?.link) {
      qrCodeLink.value = response.link
      telegramLinkCookie.value = response.link
      window.open(response.link, '_blank')
    }
  }
}

if (telegramLinkCookie.value) {
  qrCodeLink.value = telegramLinkCookie.value
  qrCodeSrc.value = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeLink.value)}&size=200x200`
} else {
  const response = await api.profile.getTelegramLink()
  if (response?.link) {
    qrCodeLink.value = response.link
    telegramLinkCookie.value = response.link
    qrCodeSrc.value = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(response.link)}&size=200x200`
  }
}
// Update profile function
const updateProfile = async () => {
  isLoading.value = true

  try {
    const response = await api.profile.updateProfile({
      name: formData.value.name,
      phone: formData.value.phone,
      email: formData.value.email,
      password: formData.value.password,
      password_confirmation: formData.value.password_confirmation,
    })

    if (response) {
      // Update cookie with new data
      userData.value = {
        ...userData.value,
        name: formData.value.name,
        phone: formData.value.phone,
        email: formData.value.email,
      }
      snackbar.notify({ text: 'Профиль успешно обновлен', color: 'success' })
    }
  } catch (error) {
    snackbar.error(error.response._data.message || 'Ошибка при обновлении профиля')
  } finally {
    isLoading.value = false
  }
}

// Date formatting function
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}

// Карты
const sbpPhone = ref('')
const sbpComment = ref('')
const sberCard = ref('')
const tbankCard = ref('')
const ozonCard = ref('')
const alfaCard = ref('')
const vtbCard = ref('')
const raiffeisenCard = ref('')
const gazprombankCard = ref('')

const savePayments = async () => {
  const response = await api.profile.savePayments(
    sbpPhone.value,
    sbpComment.value,
    sberCard.value,
    tbankCard.value,
    ozonCard.value,
    alfaCard.value,
    vtbCard.value,
    raiffeisenCard.value,
    gazprombankCard.value
  ).then(res =>{
    snackbar.notify({ text: 'Данные успешно сохраннены', color: 'success' })
  }).catch(err => {
    console.error(err)
    snackbar.error(err.response?._data?.message || 'Ошибка при сохранении данных')
  })
}

const getPayments = async () => {
  const response = await api.profile.getPayments().then(
    res => {
      sbpPhone.value = res.sbp,
      sbpComment.value = res.sbp_comment,

      sberCard.value = res.sber,
      tbankCard.value = res.tbank,
      ozonCard.value = res.ozon,
      alfaCard.value = res.alfa,
      vtbCard.value = res.vtb,
      raiffeisenCard.value = res.raiffeisen,
      gazprombankCard.value = res.gazprombank
    }
  ).catch(err => {
    snackbar.error(err.response?._data?.message || 'Ошибка при загрузке платежных данных')
  })
}
getPayments()
</script>

<template>
  <VContainer>
    <VCard>
      <VImg
        v-if="role === 'seller'"
        src="/images/user-profile-header-bg.png"
        min-height="125"
        max-height="250"
        cover
      />

      <VImg
        v-else
        src="/images/app-search-header-bg.png"
        min-height="125"
        max-height="250"
        cover
      />

      <VCardText class="d-flex align-bottom flex-sm-row flex-column justify-center gap-x-6">
        <div class="d-flex h-0">
          <VAvatar
            rounded
            color="primary"
            size="130"
            class="user-profile-avatar mx-auto"
          >
            <span class="text-lg">{{ userData.name.slice(0, 2).toUpperCase() }}</span>
          </VAvatar>
        </div>

        <div class="user-profile-info w-100 mt-16 pt-6 pt-sm-0 mt-sm-0">
          <h4 class="text-h4 text-center text-sm-start mb-2">
            {{ userData.name }}
          </h4>

          <div class="d-flex align-center justify-center justify-sm-space-between flex-wrap gap-6">
            <div class="d-flex flex-wrap justify-center justify-sm-start flex-grow-1 gap-6">
              <div class="d-flex align-center gap-x-2">
                <VIcon
                  size="24"
                  icon="ri-id-card-line"
                />
                <div class="text-body-1 font-weight-medium">
                  ID: {{ userData.id }}
                </div>
              </div>

              <div class="d-flex align-center gap-x-2">
                <VIcon
                  size="24"
                  icon="ri-star-line"
                />
                <div class="text-body-1 font-weight-medium">
                  Рейтинг: {{ userData.rating }}
                </div>
              </div>

              <div class="d-flex align-center gap-x-2">
                <VIcon
                  size="24"
                  icon="ri-calendar-line"
                />
                <div class="text-body-1 font-weight-medium">
                  Дата регистрации: {{ formatDate(userData.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </VCardText>
    </VCard>

    <VRow class="mt-6">
      <!-- Left Column: Account Settings -->
      <VCol cols="12" md="6">
        <VCard title="Настройки аккаунта">
          <VCardText>
            <VForm @submit.prevent="updateProfile">
              <VTextField
                v-model="formData.name"
                label="Имя"
                prepend-icon="ri-user-line"
                class="mb-4"
              />
              <VTextField
                v-model="formData.phone"
                label="Телефон"
                v-mask="'+7(###)###-##-##'"
                prepend-icon="ri-phone-line"
                class="mb-4"
              />
              <VTextField
                v-if="role === 'seller'"
                v-model="formData.inn"
                label="ИНН"
                prepend-icon="ri-file-text-line"
                class="mb-4"
                disabled
              />
              <VTextField
                v-if="role === 'seller'"
                v-model="formData.legal_name"
                label="Наименование юр. лица"
                prepend-icon="ri-building-line"
                class="mb-4"
                disabled
              />
              <VTextField
                v-if="role === 'seller'"
                v-model="formData.wb_name"
                label="Название магазина на WB"
                prepend-icon="ri-store-line"
                class="mb-4"
                disabled
              />
              <VTextField
                v-model="formData.email"
                label="Почта"
                prepend-icon="ri-mail-line"
                class="mb-4"
              />
              <VTextField
                v-model="formData.password"
                label="Новый пароль"
                type="password"
                prepend-icon="ri-lock-line"
                class="mb-4"
              />
              <VTextField
                v-model="formData.password_confirmation"
                label="Подтверждение пароля"
                type="password"
                prepend-icon="ri-lock-line"
                class="mb-4"
              />

              <VBtn
                type="submit"
                color="primary"
                :loading="isLoading"
                block
              >
                Сохранить
              </VBtn>
            </VForm>
          </VCardText>
        </VCard>

        <VCard title="Платежные данные для кэшбека" v-if="role === 'buyer'" class="mt-6">
          <VCardText>
            <VForm @submit.prevent="updateProfile">


              <VTextField
                v-model="sbpPhone"
                label="Сбп номер телефона"
                class="mb-4"
                v-mask="'+7(###)###-##-##'"
                placeholder="+7(___)___-__-__"
              >
                <template #prepend>
      <span class="prepend-icon">
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8.70679L8.844 17.3651V22.6464L4.00567 31.2878L4 8.70679Z" fill="#5B57A2"/>
          <path d="M22.5989 14.2145L27.1379 11.4325L36.4272 11.4238L22.5989 19.8952V14.2145Z" fill="#D90751"/>
          <path d="M22.5733 8.65566L22.599 20.119L17.7437 17.1356V0L22.5736 8.65566H22.5733Z" fill="#FAB718"/>
          <path d="M36.4273 11.4237L27.1376 11.4323L22.5733 8.65566L17.7437 0L36.427 11.4237H36.4273Z" fill="#ED6F26"/>
          <path d="M22.599 31.3357V25.7741L17.7437 22.8474L17.7463 40.0001L22.599 31.3357Z" fill="#63B22F"/>
          <path d="M27.1266 28.5791L8.84366 17.3651L4 8.70679L36.4076 28.5678L27.1263 28.5791H27.1266Z" fill="#1487C9"/>
          <path d="M17.7468 39.9999L22.5988 31.3356L27.1265 28.579L36.4075 28.5676L17.7468 39.9999Z" fill="#017F36"/>
          <path d="M4.00562 31.2876L17.7833 22.8476L13.1513 20.0056L8.84394 22.6463L4.00562 31.2876Z" fill="#984995"/>
        </svg>
      </span>
                </template>
              </VTextField>
              <VTextField
                v-model="sbpComment"
                label="СПБ Банки (укажите банки в комментарии)"
                prepend-icon="none"
                class="mb-4"
              />

              <VTextField
                v-model="sberCard"
                label="Сбербанк (карта)"
                class="mb-4 w-100"
                placeholder="0000 0000 0000 0000"
                v-mask="'#### #### #### ####'"
              >
                <template #prepend>
      <span class="prepend-icon">
        <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M35.3517 7.77026C36.2892 8.99861 37.0828 10.3331 37.7165 11.7469L19.7398 25.1769L12.2268 20.404V14.6619L19.7398 19.4349L35.3517 7.77026Z" fill="#21A038"/>
<path d="M4.55927 19.9993C4.55927 19.7417 4.56547 19.4857 4.57787 19.2312L0.0247968 19.0051C0.00929965 19.3349 5.50217e-06 19.6679 5.50217e-06 20.004C-0.0019317 22.6298 0.507688 25.23 1.49964 27.6556C2.49159 30.0813 3.94634 32.2846 5.78045 34.1391L9.01005 30.8677C7.59822 29.4426 6.47822 27.7488 5.7144 25.8836C4.95058 24.0185 4.55802 22.0187 4.55927 19.9993Z" fill="url(#paint0_linear_1595_21748)"/>
<path d="M19.7358 4.62042C19.9899 4.62042 20.2424 4.62985 20.4935 4.64241L20.7213 0.0265021C20.3949 0.0107964 20.0663 0.00294452 19.7358 0.00294452C17.1436 -0.000259062 14.5765 0.515474 12.1817 1.52053C9.78683 2.52559 7.61148 4.00017 5.78052 5.85962L9.01012 9.13268C10.4163 7.70139 12.0878 6.5659 13.9285 5.79152C15.7692 5.01715 17.7427 4.61915 19.7358 4.62042Z" fill="url(#paint1_linear_1595_21748)"/>
<path d="M19.7357 35.3798C19.4815 35.3798 19.2289 35.3798 18.9764 35.3594L18.7485 39.9737C19.076 39.9904 19.4051 39.9989 19.7357 39.9989C22.3267 40.0016 24.8926 39.4855 27.2861 38.4802C29.6797 37.4748 31.8536 36 33.6832 34.1406L30.4598 30.8691C29.0533 32.2997 27.382 33.4345 25.5417 34.2086C23.7014 34.9827 21.7282 35.3808 19.7357 35.3798Z" fill="url(#paint2_linear_1595_21748)"/>
<path d="M28.2905 7.30319L32.1275 4.43689C28.6204 1.55876 24.2426 -0.00798939 19.7297 3.06379e-05V4.61908C22.7856 4.61524 25.7706 5.55117 28.2905 7.30319Z" fill="url(#paint3_linear_1595_21748)"/>
<path d="M39.47 20.0001C39.4724 18.7985 39.3687 17.5989 39.16 16.416L34.9123 19.5886C34.9123 19.7253 34.9123 19.8619 34.9123 20.0001C34.9134 22.1491 34.4688 24.2743 33.6077 26.238C32.7464 28.2017 31.4876 29.9601 29.9128 31.3992L32.9767 34.831C35.0239 32.9579 36.6599 30.6698 37.7785 28.1149C38.8972 25.5599 39.4734 22.7952 39.47 20.0001Z" fill="#21A038"/>
<path d="M19.7358 35.3804C17.6152 35.3811 15.5181 34.9305 13.5801 34.0577C11.6423 33.1849 9.90692 31.9093 8.48638 30.3137L5.10181 33.4172C6.94978 35.4923 9.20748 37.1505 11.7285 38.2845C14.2495 39.4184 16.9776 40.0027 19.7358 39.9994V35.3804Z" fill="url(#paint4_linear_1595_21748)"/>
<path d="M9.55867 8.60016L6.49642 5.16846C4.44858 7.04117 2.81201 9.3292 1.69285 11.8842C0.573697 14.4391 -0.0030512 17.2039 1.21392e-05 19.9993H4.55928C4.55834 17.8505 5.0029 15.7252 5.86412 13.7615C6.72535 11.7978 7.98405 10.0394 9.55867 8.60016Z" fill="url(#paint5_linear_1595_21748)"/>
<defs>
<linearGradient id="paint0_linear_1595_21748" x1="6.70253" y1="33.5628" x2="1.60155" y2="19.0127" gradientUnits="userSpaceOnUse">
<stop offset="0.14" stop-color="#F1E813"/>
<stop offset="0.3" stop-color="#E6E418"/>
<stop offset="0.58" stop-color="#C9DA26"/>
<stop offset="0.89" stop-color="#A2CC39"/>
</linearGradient>
<linearGradient id="paint1_linear_1595_21748" x1="7.08227" y1="6.67631" x2="19.9554" y2="1.83568" gradientUnits="userSpaceOnUse">
<stop offset="0.06" stop-color="#0FA7DF"/>
<stop offset="0.54" stop-color="#0098F8"/>
<stop offset="0.92" stop-color="#0290EA"/>
</linearGradient>
<linearGradient id="paint2_linear_1595_21748" x1="18.4479" y1="37.2111" x2="32.9749" y2="33.9728" gradientUnits="userSpaceOnUse">
<stop offset="0.12" stop-color="#A2CC39"/>
<stop offset="0.28" stop-color="#86C239"/>
<stop offset="0.87" stop-color="#219F38"/>
</linearGradient>
<linearGradient id="paint3_linear_1595_21748" x1="18.7814" y1="1.54704" x2="31.2138" y2="5.3327" gradientUnits="userSpaceOnUse">
<stop offset="0.06" stop-color="#0290EA"/>
<stop offset="0.79" stop-color="#0C89CA"/>
</linearGradient>
<linearGradient id="paint4_linear_1595_21748" x1="6.24549" y1="32.8549" x2="19.7905" y2="37.8499" gradientUnits="userSpaceOnUse">
<stop offset="0.13" stop-color="#F1E813"/>
<stop offset="0.3" stop-color="#EAE616"/>
<stop offset="0.53" stop-color="#D8DF1F"/>
<stop offset="0.8" stop-color="#BAD52D"/>
<stop offset="0.98" stop-color="#A2CC39"/>
</linearGradient>
<linearGradient id="paint5_linear_1595_21748" x1="1.6985" y1="20.5584" x2="7.24536" y2="6.32068" gradientUnits="userSpaceOnUse">
<stop offset="0.07" stop-color="#A2CC39"/>
<stop offset="0.26" stop-color="#81C45E"/>
<stop offset="0.92" stop-color="#0FA7DF"/>
</linearGradient>
</defs>
</svg>
      </span>
                </template>
              </VTextField>

              <VTextField
                v-model="tbankCard"
                label="Т-банк (карта)"
                class="mb-4 w-100"
                placeholder="0000 0000 0000 0000"
                v-mask="'#### #### #### ####'"
              >
                <template #prepend>
                  <span class="prepend-icon">
                    <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H40.0001V20.1171C40.0001 25.2743 37.2489 30.0398 32.7829 32.6186L20 40L7.21719 32.6186C2.75113 30.0398 0 25.2743 0 20.1171V0Z" fill="#FFDD2D"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10.9783 10.5891V16.846C11.8339 15.8798 13.3895 15.2259 15.1682 15.2259H17.1011V22.4994C17.1011 24.4345 16.5753 26.1283 15.7952 27.0599H24.2029C23.4244 26.1273 22.8998 24.4357 22.8998 22.5031V15.2259H24.8328C26.6115 15.2259 28.1671 15.8798 29.0227 16.846V10.5891H10.9783Z" fill="#333333"/>
                    </svg>
                  </span>
                </template>
              </VTextField>

              <VTextField
                v-model="ozonCard"
                label="Ozon банк (карта)"
                class="mb-4 w-100"
                placeholder="0000 0000 0000 0000"
                v-mask="'#### #### #### ####'"
              >
                <template #prepend>
                  <span class="prepend-icon">
                    <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M4.99595 17.3694C7.77476 17.3694 9.81173 15.4571 9.81173 12.6854C9.81173 9.91371 7.77603 8.00141 4.99595 8.00141C2.21715 8.00141 0.18018 9.91371 0.18018 12.6854C0.18018 15.4571 2.21592 17.3694 4.99595 17.3694ZM23.7646 17.3694C26.5434 17.3694 28.5803 15.4571 28.5803 12.6854C28.5803 9.91371 26.5434 8.00141 23.7646 8.00141C20.9858 8.00141 18.9488 9.91371 18.9488 12.6854C18.9488 15.4571 20.9858 17.3694 23.7646 17.3694ZM38.3784 17.065V11.6596C38.3784 9.05434 36.9743 8.00141 35.0769 8C33.8111 8 32.8196 8.61022 32.2418 9.6079H32.1867V8.27731H29.8743V17.065H32.2136V12.7406C32.2136 10.8273 33.0668 10.1625 34.2506 10.1625C35.378 10.1625 36.039 10.746 36.039 12.1589V17.065H38.3784ZM10.6649 10.2737V8.27731H18.1506V10.1344L13.445 15.0686H18.371V17.065H10.5548V15.1798L15.2604 10.2737H10.6649ZM4.99595 15.2079C3.56494 15.2079 2.62968 14.2092 2.62968 12.6854C2.62968 11.1602 3.56494 10.1625 4.99595 10.1625C6.42697 10.1625 7.36223 11.1602 7.36223 12.6854C7.36223 14.2106 6.42697 15.2079 4.99595 15.2079ZM23.7646 15.2079C22.3335 15.2079 21.3983 14.2092 21.3983 12.6854C21.3983 11.1602 22.3335 10.1625 23.7646 10.1625C25.1956 10.1625 26.1308 11.1602 26.1308 12.6854C26.1308 14.2106 25.1956 15.2079 23.7646 15.2079ZM30.0772 31.3003V22.5499H27.7366V25.7235H23.9914V22.5499H21.6507V31.3003H23.9914V27.7667H27.7366V31.3003H30.0772ZM17.6889 23.8193V22.5499H20.0296V31.3003H17.6889V30.1129H17.6342C17.1662 30.9406 16.1473 31.6036 14.7156 31.6036C12.3749 31.6036 10.5573 29.9204 10.5573 26.9108C10.5573 23.9298 12.4302 22.2736 14.7156 22.2736C16.1191 22.2736 17.2215 22.9367 17.6342 23.8193H17.6889ZM2.36869 24.1789C2.9468 23.1306 4.04785 22.4676 5.47957 22.4676C7.79196 22.4676 9.69155 24.1789 9.69155 26.9108C9.69155 29.6441 7.59964 31.6036 4.87331 31.6036C2.12006 31.6036 0 29.6441 0 25.973C0 21.8327 1.12921 19.2373 4.92847 18.934L8.81097 18.6306V20.8663L5.31426 21.1978C3.05704 21.4188 2.39561 22.2466 2.31357 24.1789H2.36869ZM13.0093 26.9661C13.0093 28.4297 13.9166 29.4784 15.3217 29.4784C16.7253 29.4784 17.6889 28.4015 17.6889 26.9379C17.6889 25.4472 16.7253 24.3989 15.3217 24.3989C13.9182 24.3989 13.0093 25.4757 13.0093 26.9661ZM2.4495 26.9393C2.4495 28.4568 3.49671 29.4784 4.84516 29.4784C6.19488 29.4784 7.24081 28.4568 7.24081 26.9393C7.24081 25.3934 6.19488 24.4823 4.84516 24.4823C3.49548 24.4823 2.4495 25.3934 2.4495 26.9393ZM33.8605 27.1051L37.0261 31.3003L40 31.2992L36.0906 26.5241L39.6707 22.5499H36.7791L33.8605 26.1658V22.5499H31.5198V31.3003H33.8605V27.1051Z" fill="#005BFF"/>
</svg>
                  </span>
                </template>
              </VTextField>

              <VTextField
                v-model="alfaCard"
                label="Альфа банк (карта)"
                class="mb-4 w-100"
                placeholder="0000 0000 0000 0000"
                v-mask="'#### #### #### ####'"
              >
                <template #prepend>
                  <span class="prepend-icon">
                   <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 34.53H33.29V40H7V34.53ZM14.82 21.62H25.19L26.94 27.12H32.69L24.93 4C24.18 1.78 23.31 0 20.34 0C17.37 0 16.46 1.75 15.68 4L7.56 27.11H12.95L14.82 21.62V21.62ZM20.08 6H20.21L23.7 17H16.4L20.08 6V6Z" fill="#EF3124"/>
</svg>

                  </span>
                </template>
              </VTextField>


              <VTextField
                v-model="vtbCard"
                label="ВТБ (карта)"
                class="mb-4 w-100"
                placeholder="0000 0000 0000 0000"
                v-mask="'#### #### #### ####'"
              >
                <template #prepend>
                  <span class="prepend-icon">
                   <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.95505 8L6.71401 14.1472H37.759L40 8H8.95505ZM5.59479 17.2182L3.35375 23.3642H34.3987L36.6397 17.2182C36.6397 17.2182 5.59479 17.2182 5.59479 17.2182ZM2.24104 26.4365L0 32.5811H31.0449L33.2834 26.4352C33.2847 26.4365 2.24104 26.4365 2.24104 26.4365Z" fill="#009FDF"/>
</svg>

                  </span>
                </template>
              </VTextField>


              <VTextField
                v-model="raiffeisenCard"
                label="Райффайзенбанк (карта)"
                class="mb-4 w-100"
                placeholder="0000 0000 0000 0000"
                v-mask="'#### #### #### ####'"
              >
                <template #prepend>
                  <span class="prepend-icon">
                   <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M40 32.44C40 37.3 37.3 40 32.44 40H7.56C2.7 40 0 37.3 0 32.44V7.56C0 2.7 2.7 0 7.56 0H32.45C37.3 0 40 2.7 40 7.56V32.44Z" fill="#FFE600"/>
<path d="M25.7195 18.0494V14.2294L27.0995 12.8494V16.1594L28.2995 17.3594L33.1295 12.5294L34.3195 13.7194C34.3095 12.8194 34.1295 10.2094 31.9195 8.03942C29.5395 5.73942 26.9595 6.77942 26.0795 7.65942L21.2595 12.4794L22.4895 13.7094L19.9995 16.2194L17.5095 13.7294L18.7395 12.4994L13.9195 7.67942C13.0395 6.79942 10.4595 5.75942 8.07944 8.05942C5.86944 10.2294 5.68944 12.8394 5.67944 13.7394L6.86944 12.5494L11.6995 17.3794L12.8995 16.1794V12.8694L14.2795 14.2494V18.0694L16.2195 19.9994L6.65944 29.5594L10.4395 33.3294L19.9995 23.7794L29.5595 33.3394L33.3395 29.5694L23.7795 19.9994L25.7195 18.0494Z" fill="#2B2D34"/>
</svg>
                  </span>
                </template>
              </VTextField>


              <VTextField
                v-model="gazprombankCard"
                label="Газпромбанк (карта)"
                class="mb-4 w-100"
                placeholder="0000 0000 0000 0000"
                v-mask="'#### #### #### ####'"
              >
                <template #prepend>
                  <span class="prepend-icon">
                   <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 20.0109C0 8.97027 8.97352 0 20.0136 0C31.0286 0 40 8.97027 40 20.0109C40 31.0286 31.0286 40 20.0136 40C8.97352 40 0 31.0286 0 20.0109ZM0.999892 20.0109C0.999892 30.4774 9.52908 38.9996 20.0136 38.9996C30.4769 38.9996 39.0001 30.4753 39.0001 20.0109C39.0001 9.52691 30.4801 1.00043 20.0136 1.00043C9.52583 1.00043 0.999892 9.52257 0.999892 20.0109ZM25.6885 7.43707C22.5233 6.02539 16.6254 5.88542 11.7942 8.03711C12.1804 7.76042 12.5836 7.51085 13.0018 7.28733C13.2568 7.15061 13.5178 7.02365 13.7831 6.90755C15.3044 6.199 17.7577 5.51215 20.8154 5.51215C20.9597 5.51215 21.1041 5.51324 21.2489 5.51649C23.8634 5.56315 26.9629 6.46593 28.8574 8.33984C29.1797 8.73264 29.3663 9.12435 29.4352 9.42708C30.9386 10.191 31.8164 10.9071 32.3009 11.7405C32.5109 12.1788 32.5798 12.64 32.4854 13.1727C32.9785 13.4494 33.406 13.8292 33.7386 14.2871C33.9431 14.6332 34.1054 15.0228 34.1531 15.3754C34.2209 15.8344 34.2665 16.3661 33.7809 16.9922C34.2898 17.2472 34.7043 17.9612 34.7542 18.265C35.0087 19.3945 34.2665 20.5056 33.3198 21.3639C32.6112 21.9824 31.3585 22.6769 30.0277 23.2313C29.2714 23.546 28.4896 23.8162 27.7686 24.0007C24.9902 24.7038 22.4278 25.1183 20.185 25.4818C19.2584 25.6326 18.386 25.7737 17.5754 25.9223C18.3143 26.0992 19.2079 26.3108 20.3852 26.4529C21.1957 26.5517 22.1408 26.6168 23.2633 26.6168C29.1564 26.6168 34.3598 23.8379 34.3598 23.8379C34.3598 23.8379 34.2453 24.1873 34.1276 24.5117C30.383 26.7773 24.4423 27.7246 21.8967 27.6085C19.33 27.4913 17.1577 27.0996 15.0298 26.4507C14.3799 26.6341 13.7397 26.85 13.112 27.0996C16.3509 28.5796 18.7999 28.9052 21.5522 29.1113C24.3707 29.3218 29.0441 28.648 32.9709 27.2179C32.883 27.3069 32.8158 27.4165 32.7501 27.5239C32.678 27.6411 32.6069 27.7572 32.5109 27.8418C30.4986 28.9052 26.2467 29.9696 24.0956 30.0619C21.9667 30.1552 19.3777 30.0619 17.111 29.6441C15.1687 29.2535 13.571 28.648 11.9076 27.9112C11.6097 28.1391 11.4708 28.4201 11.3987 28.7446C17.8998 32.1441 23.954 32.2114 30.8708 30.0619L30.2441 30.6641C22.6367 33.7641 16.6943 32.5597 12.0909 30.3385C11.932 30.2691 11.7464 30.1986 11.6097 30.1074C12.0497 30.8485 15.561 33.4158 19.4922 33.7402C20.9136 33.8618 22.5 33.7912 23.9703 33.584C25.3006 33.3963 26.5365 33.0957 27.4696 32.7235L26.314 33.3236C25.3651 33.7869 22.8456 34.8535 19.3289 34.6202C14.6365 34.2947 11.9998 32.2125 10.8198 31.1274C10.2653 30.6152 10.013 30.0391 9.84972 29.3218C8.78527 28.7663 8.11523 28.1858 7.56293 27.3079C7.2385 26.8229 7.30523 26.2457 7.37413 25.7563L7.51845 25.3451C7.00629 24.9707 6.47515 24.5779 6.26736 24.1873C5.80187 23.354 6.08398 22.6356 6.40625 22.0801C6.30371 21.9618 6.20443 21.8435 6.11437 21.7253C5.9592 21.5202 5.83116 21.3151 5.76118 21.11C5.62066 20.74 5.59896 20.3657 5.64073 19.9512C5.73513 19.2589 6.10514 18.6133 6.59071 18.0556C7.60634 16.875 9.22852 15.9505 11.9765 15.0488C14.0717 14.349 15.1969 14.107 16.5413 13.8184C16.9347 13.7337 17.3465 13.6458 17.8065 13.5406C20.1877 12.9894 23.0322 12.806 25.4118 11.9727C18.7755 10.8171 11.8864 11.8793 6.26736 15.7389L6.63629 14.6528C11.6764 11.3694 17.2499 9.42708 26.6829 11.0699C27.1918 10.7682 27.4919 10.4666 27.6329 9.86654C25.2729 9.0115 22.7078 8.71094 19.4021 8.75543C16.441 8.84983 11.0975 9.95551 8.23513 11.6504L9.1097 10.561C11.0975 9.37717 16.2999 7.82986 20.211 7.76042C22.9601 7.69206 24.3707 7.85265 27.6552 8.73264C27.3519 8.18034 26.6829 7.90039 25.6885 7.43707ZM30.7286 12.2504C30.6386 11.6026 29.8985 10.9776 29.2497 10.561C29.1895 10.7715 29.024 11.0102 28.8515 11.2218C28.7581 11.3368 28.6627 11.4431 28.5807 11.5332C29.2974 11.7198 30.0374 11.9933 30.7286 12.2504ZM27.564 12.4566C27.0985 12.8277 26.5696 13.15 25.7807 13.4538C27.0785 13.6806 28.0496 14.0516 29.1564 14.3544C29.1678 14.3598 29.1808 14.362 29.1933 14.3609C29.4341 14.3609 30.2262 13.6285 30.363 13.4277C29.9344 13.24 29.4531 13.0512 28.9372 12.8743C28.5004 12.7246 28.0393 12.5825 27.564 12.4566ZM32.5109 15.8572C32.8098 15.2789 32.6253 14.9089 32.003 14.3761C31.7475 14.6799 31.4697 14.9316 31.1697 15.1628C31.3878 15.2669 31.5972 15.357 31.7996 15.4525C32.0464 15.5686 32.283 15.6923 32.5109 15.8572ZM22.1077 14.6332C19.0554 15.0033 15.6776 15.6478 12.7886 16.505L12.6345 16.5517C11.2006 16.9878 5.77854 18.6328 7.42513 20.9006L7.44466 20.8789C7.602 20.701 8.74512 19.4021 12.3475 18.355C14.8817 17.6107 17.4799 17.1376 20.1188 16.6569C22.4892 16.225 24.8926 15.7867 27.3107 15.1411C25.8713 14.758 24.8904 14.5291 23.6632 14.528C23.1939 14.528 22.6888 14.5616 22.1077 14.6332ZM25.4134 17.4316C23.7722 17.8472 19.7933 18.4256 15.5176 19.35C14.1753 19.6506 10.4975 20.5056 8.69412 22.0334C8.98329 22.2721 9.21333 22.4045 9.45964 22.5336C9.64573 22.6313 9.84158 22.7279 10.0798 22.8668C10.8198 22.3796 11.8387 21.9173 13.3442 21.5224C15.7189 20.8919 17.5646 20.5881 19.6555 20.2441L20.2799 20.1411C22.6156 19.7873 27.0307 18.8628 29.4575 17.9839C30.0157 17.7951 30.5387 17.5608 30.9842 17.2884C31.1865 17.1647 31.3726 17.0334 31.5386 16.8956C31.3764 16.7133 29.8041 15.9505 29.7575 16.0211C28.7896 16.4822 27.4018 16.9434 25.4134 17.4316ZM27.0551 20.5773C22.1077 21.9173 18.5211 22.0996 14.451 23.1C13.9822 23.2183 13.5064 23.355 13.0415 23.5113C12.7029 23.6241 12.3698 23.7478 12.0497 23.8835C12.8098 24.2773 13.6431 24.6257 14.4743 24.9501C16.1388 24.464 16.9287 24.2556 19.3289 23.8628L20.6619 23.623C21.9331 23.3908 23.7082 23.0621 25.1096 22.7778C28.7896 21.9878 34.1764 20.2756 32.7431 18.0556C32.6714 18.1163 32.5998 18.1717 32.5282 18.227C32.4376 18.2986 32.3475 18.3702 32.2575 18.4494C31.1697 19.2773 29.4352 19.9512 27.0551 20.5773ZM8.27854 24.2773C8.43859 24.1168 8.64855 23.9768 8.81076 23.8379C8.43859 23.6458 8.18359 23.4831 7.89117 23.2964L7.72298 23.189C7.53744 23.61 7.9107 24.0668 8.27854 24.2773ZM12.5776 25.6196C11.9076 25.319 11.1919 25.0206 10.4975 24.6962C10.1742 24.9045 9.87522 25.1107 9.64301 25.319C10.1975 25.6434 10.7308 25.9418 11.2864 26.2467C11.6949 25.995 12.1273 25.7845 12.5776 25.6196ZM9.87522 27.7724C9.94195 27.5391 10.0597 27.3557 10.2219 27.1246C10.0391 27.0269 9.85677 26.9303 9.67448 26.8294C9.46289 26.7112 9.25239 26.5885 9.04188 26.4507C9.01638 26.8924 9.29633 27.2852 9.87522 27.7724Z" fill="#476BF0"/>
</svg>
                  </span>
                </template>
              </VTextField>


              <VBtn
                type="button"
                color="primary"
                :loading="isLoading"
                @click="savePayments"
              >
                Сохранить
              </VBtn>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Right Column: Notifications and Statistics -->
      <VCol cols="12" md="6">
        <VCard title="Уведомления">
          <VCardText>
            <div class="d-flex justify-center">
              <img
                :src="qrCodeSrc"
                alt="Telegram QR Code"
                width="150"
                height="150"
                class="cursor-pointer"
                @click="openBot"
              />
            </div>
            <p class="text-center mt-4">Отсканируйте QR-код для подключения к Telegram-боту</p>
            <div class="text-center">
              <VBtn variant="outlined" @click="openBot" color="" append-icon="ri-telegram-2-fill">Подключить</VBtn>
            </div>
          </VCardText>
        </VCard>

        <VCard title="Статистика" class="mt-6">
          <VCardText>
            <VRow>
              <VCol cols="6">
                <VCard class="text-center pa-4">
                  <VCardTitle class="justify-center" :class="{
                    'text-success': statistics.success_buybacks >= 75,
                    'text-warning': statistics.success_buybacks >= 50 && userData.success_buybacks < 75,
                    'text-error': statistics.success_buybacks < 50
                  }">{{ statistics.success_buybacks }}%</VCardTitle>
                  <VCardText>Успешных выкупов</VCardText>
                </VCard>
              </VCol>
              <VCol cols="6">
                <VCard class="text-center pa-4">
                  <VCardTitle class="justify-center"
                              :class="{
                                'text-success': statistics.cashback_paid >= 10000,
                                'text-warning': statistics.cashback_paid >= 1000 && statistics.cashback_paid < 10000,
                                'text-error': statistics.cashback_paid < 1000
                              }"
                  >{{ statistics.cashback_paid }}</VCardTitle>
                  <VCardText v-if="role === 'seller'">Кэшбэка выплаченно</VCardText>
                  <VCardText v-else>Кэшбэка полученно</VCardText>
                </VCard>
              </VCol>
              <VCol cols="6">
                <VCard class="text-center pa-4">
                  <VCardTitle class="justify-center"
                  :class="{
                    'text-success': statistics.user_rating >= 4,
                    'text-warning': statistics.user_rating >= 2 && statistics.user_rating < 3,
                    'text-error': statistics.user_rating < 2
                  }"
                  >{{ statistics.user_rating }}</VCardTitle>
                  <VCardText>Ваш рейтинг</VCardText>
                </VCard>
              </VCol>
              <VCol cols="6">
                <VCard class="text-center pa-4">
                  <VCardTitle class="justify-center"
                  :class="{
                    'text-success': statistics.average_response_time < 15,
                    'text-warning': statistics.average_response_time <= 5 && statistics.average_response_time > 15,
                    'text-error': statistics.average_response_time > 5
                  }"
                  >{{ statistics.average_response_time }} мин.</VCardTitle>
                  <VCardText>Среднее время ответа</VCardText>
                </VCard>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped lang="scss">
.user-profile-avatar {
  margin-top: -65px;
}

.details-btn {
  margin-left: 8px;
}
</style>
