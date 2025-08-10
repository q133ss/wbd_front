<template>
  <VApp>
    <VMain>
      <VContainer class="pa-0 d-flex h-100 flex-column justify-space-between">
        <Header />
        <VContainer class="px-6 py-6 mt-10 flex-grow">
          <VCard
            class="mx-auto pt-16 rounded-xl"
            max-width="400"
            variant="text"
            flat
          >
            <VCardText class="d-flex flex-column align-start text-left pa-0">
              <VAvatar
                size="48"
                color="#EBE1F8"
                class="mb-6"
              >
                <VIcon
                  size="30"
                  color="#673AB7"
                >
                  ri-emotion-happy-line
                </VIcon>
              </VAvatar>

              <h2 class="text-h5 font-weight-bold mb-2">
                Условия использования
              </h2>

              <p class="text-body-1 text-grey-darken-1 mb-6">
                Продолжая использование, вы даете согласие на обработку персональных
                данных. Политика обработки персональных данных, а так же оферта
                были отправлены в телеграм бот <a
                  href="https://t.me/wbd_bot"
                  target="_blank"
                  class="text-decoration-none font-weight-bold"
                  style="color: #673AB7;"
                >@wbd_bot</a>
              </p>

              <VBtn
                color="primary"
                class="rounded-lg text-none mb-4"
                elevation="0"
                block
                height="50"
                :disabled="!consentGiven"
                @click="continueAction"
              >
                <span class="font-weight-bold">Продолжить</span>
              </VBtn>
              <div class="d-flex align-start">
                <VCheckbox
                  v-model="consentGiven"
                  color="#673AB7"
                  class="mt-0 pt-0 d-flex align-start"
                  hide-details
                >
                  <template #label>
                    <span class="text-body-2 text-grey-darken-1">Даю согласие<br> На обработку персональных данных</span>
                  </template>
                </VCheckbox>
              </div>
            </VCardText>
          </VCard>
        </VContainer>
        <Footer />
      </VContainer>
    </VMain>
  </VApp>
</template>

<script setup>
import Footer from '@/pages/telegram/inc/footer.vue'
import Header from '@/pages/telegram/inc/header.vue'
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

const chatIdCookie = useCookie('chatId')
const chatId = chatIdCookie.value || (typeof route.query.chat_id === 'string' ? route.query.chat_id : null)

const role = route.query.role

const continueAction = () => {
  if (consentGiven.value) {
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
