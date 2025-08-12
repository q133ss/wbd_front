<template>
  <VApp>
    <VMain>
      <VContainer class="pa-0 d-flex h-100 flex-column justify-space-between">
        <Header />
        <VContainer class="px-6 py-6 mt-10 flex-grow d-flex justify-center align-center">
          <VCard
            class="mx-auto pt-6 rounded-xl mt-16"
            max-width="400"
            variant="text"
            flat
          >
            <VCardText class="d-flex flex-column text-left pa-0">
              <VAvatar
                size="48"
                color="#EBE1F8"
                class="mb-6"
              >
                <VIcon
                  size="30"
                  color="#673AB7"
                >
                  ri-chat-1-line
                </VIcon>
              </VAvatar>

              <h2 class="text-h5 font-weight-bold mb-2">
                Поделитесь контактом
              </h2>

              <p class="text-body-1 text-grey-darken-1 mb-6">
                Для продолжения регистрации в сервисе поделитесь номером телефона, привязанным к вашу аккаунту.
              </p>

              <VBtn
                color="primary"
                class="rounded-lg text-none mb-4"
                elevation="0"

                block
                height="50"
                @click="share"
              >
                <span class="font-weight-bold">Поделиться</span>
              </VBtn>
            </VCardText>
          </VCard>
        </VContainer>
        <Footer />
      </VContainer>
    </VMain>
  </VApp>
</template>

<script setup>
import api from '@/api/index.js'
import Footer from '@/pages/telegram/inc/footer.vue'
import Header from '@/pages/telegram/inc/header.vue'
import { useRoute } from "vue-router"

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()

const chatIdCookie = useCookie('chatId')
const chatId = chatIdCookie.value || (typeof route.query.chat_id === 'string' ? route.query.chat_id : null)

const role = route.query.role

const share = () => {
  const tg = window.Telegram?.WebApp
  if (!tg?.requestContact) {
    tg?.showAlert?.('Функция недоступна в этом окружении.')
    
    return
  }

  tg.requestContact((success, info) => {
    if (!success || !info || info.status !== 'sent') {
      tg.showAlert('Не удалось получить контакт.')
      console.log('НЕ УДАЛОСЬ ПОЛУЧИТЬ КОНТАКТ')
      return
    }

    const contact = info.responseUnsafe.contact
    const firstName = contact.first_name || ''
    const lastName = contact.last_name || ''
    const phone = contact.phone_number
    const userId = contact.user_id

    // const response = api.auth.registerFromTelegram(userId, phone, role, chatId, firstName, lastName)
    const response = api.auth.registerFromTelegram(
      {
        telegram_id: contact.user_id,
        phone: contact.phone_number,
        role,
        chatId,
        first_name: contact.first_name,
        last_name: contact.last_name
      })

    router.push(`/telegram/auth/complete?token=${response.token}`)
  })
}
</script>

<style scoped>
/* Specific styling to match the image precisely */
.v-app-bar {
  border-bottom: 1px solid #eee; /* Adds a subtle border at the bottom of the app bar */
}

/* Adjust button padding and icon sizing for a closer match */
.v-btn.text .v-icon {
  font-size: 20px; /* Adjust icon size if needed */
}

.v-card {
  box-shadow: none !important; /* Remove default Vuetify card shadow */
}
</style>
