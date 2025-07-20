<template>
  <v-app>
    <v-main>
      <v-container class="pa-0">
        <Header></Header>
        <v-container class="px-6 py-6 mt-10">
          <v-card class="mx-auto pa-4 rounded-xl" max-width="400" flat>
            <v-card-text class="d-flex flex-column align-center text-left pa-0">
              <v-avatar size="64" color="#EBE1F8" class="mb-4">
                <v-icon size="40" color="#673AB7">
                  ri-emotion-happy-line
                </v-icon>
              </v-avatar>

              <h2 class="text-h6 font-weight-bold mb-2">Условия использования</h2>

              <p class="text-body-2 text-grey-darken-1 mb-6 text-center">
                Продолжая использование, вы даете согласие на обработку персональных
                данных. Политика обработки персональных данных, а так же оферта
                были отправлены в телеграм бот <a href="https://t.me/wbd_bot" target="_blank" class="text-decoration-none font-weight-bold" style="color: #673AB7;">@wbd_bot</a>
              </p>

              <v-btn
                color="#EBE1F8"
                class="rounded-lg text-none mb-4"
                elevation="0"
                block
                height="50"
                @click="continueAction"
                :disabled="!consentGiven"
              >
                <span class="text-body-1 font-weight-bold" style="color: #673AB7;">Продолжить</span>
              </v-btn>

              <v-checkbox
                v-model="consentGiven"
                color="#673AB7"
                class="mt-0 pt-0"
                hide-details
              >
                <template v-slot:label>
                  <span class="text-body-2 text-grey-darken-1">Даю согласие<br> На обработку персональных данных</span>
                </template>
              </v-checkbox>
            </v-card-text>
          </v-card>
          <Footer></Footer>
        </v-container>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import Header from '@/pages/telegram/inc/header.vue'
import Footer from '@/pages/telegram/inc/footer.vue'
import { useRoute, useRouter } from "vue-router"

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const consentGiven = ref(false)
const route = useRoute()
const router = useRouter()

const chatId = route.query.chat_id
const role = route.query.role

const continueAction = () => {
  if (consentGiven) {
    router.push(`/telegram/auth/contact?role=${role}&chat_id=${chatId}`)
  } else {
    console.log('User has not given consent.')
  }
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
