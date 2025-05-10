<script setup>
import { ref } from 'vue'
import api from '@/api'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbar = useSnackbarStore()
const userData = useCookie('userData')
const isDialogVisible = ref(false)

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
const telegramLinkCookie = useCookie('telegramLink')
const qrCodeLink = ref(null)
const qrCodeSrc = ref('')

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
</script>

<template>
  <VContainer>
    <VCard>
      <VImg
        src="/src/assets/images/pages/user-profile-header-bg.png"
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
                  Дата регистрации: {{ formatDate(userData.shop?.created_at) }}
                </div>
              </div>
            </div>

            <VBtn prepend-icon="ri-user-follow-line">
              Страница на wildberries
            </VBtn>
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
                prepend-icon="ri-phone-line"
                class="mb-4"
              />
              <VTextField
                v-model="formData.inn"
                label="ИНН"
                prepend-icon="ri-file-text-line"
                class="mb-4"
                disabled
              />
              <VTextField
                v-model="formData.legal_name"
                label="Наименование юр. лица"
                prepend-icon="ri-building-line"
                class="mb-4"
                disabled
              />
              <VTextField
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
              />
            </div>
            <p class="text-center mt-4">Отсканируйте QR-код для подключения к Telegram-боту</p>
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
                  >{{ statistics.cashback_paid }}%</VCardTitle>
                  <VCardText>Кэшбэка выплаченно</VCardText>
                </VCard>
              </VCol>
              <VCol cols="6">
                <VCard class="text-center pa-4">
                  <VCardTitle class="justify-center"
                  :class="{
                    'text-success': statistics.product_rating >= 4,
                    'text-warning': statistics.product_rating >= 2 && statistics.product_rating < 3,
                    'text-error': statistics.product_rating < 2
                  }"
                  >{{ statistics.product_rating }}</VCardTitle>
                  <VCardText>Рейтинг товаров</VCardText>
                </VCard>
              </VCol>
              <VCol cols="6">
                <VCard class="text-center pa-4">
                  <VCardTitle class="justify-center"
                  :class="{
                    'text-success': statistics.total_reviews >= 15,
                    'text-warning': statistics.total_reviews >= 5 && statistics.total_reviews < 15,
                    'text-error': statistics.total_reviews < 5
                  }"
                  >{{ statistics.total_reviews }}</VCardTitle>
                  <VCardText>Оценок товаров</VCardText>
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
