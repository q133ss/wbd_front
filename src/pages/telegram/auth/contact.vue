<template>
  <v-app>
    <v-main>
      <v-container class="pa-0">
        <Header></Header>
        <v-container class="px-6 py-6 mt-10">
          <v-card class="mx-auto pa-4 rounded-xl" max-width="400" flat>
            <v-card-text class="d-flex flex-column align-center text-left pa-0">
              <v-avatar size="64" color="#EBE1F8" class="mb-4">
                <v-icon size="40" color="#673AB7">ri-chat-1-line</v-icon>
              </v-avatar>

              <h2 class="text-h6 font-weight-bold mb-2">Поделитесь контактом</h2>

              <p class="text-body-2 text-grey-darken-1 mb-6 text-center">
                Для продолжения регистрации в сервисе поделитесь номером телефона, привязанным к вашу аккаунту.
              </p>

              <v-btn
                color="#EBE1F8"
                class="rounded-lg text-none mb-4"
                elevation="0"
                block
                height="50"
                @click="share()"
              >
                <span class="text-body-1 font-weight-bold" style="color: #673AB7;">Поделиться</span>
              </v-btn>
            </v-card-text>
          </v-card>
          <Footer></Footer>
        </v-container>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import api from '@/api/index.js'
import Header from '@/pages/telegram/inc/header.vue'
import Footer from '@/pages/telegram/inc/footer.vue'
import { useRoute } from "vue-router"

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()

const chatId = route.query.chat_id
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
      return
    }

    const contact = info.responseUnsafe.contact
    const firstName = contact.first_name || ''
    const lastName = contact.last_name || ''
    const phone = contact.phone_number
    const userId = contact.user_id

    const response = api.auth.registerFromTelegram(userId, phone, role, chatId, firstName, lastName)
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
