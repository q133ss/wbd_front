<template>
  <VApp>
    <VMain>
      <VContainer class="pa-0 d-flex h-100 flex-column justify-space-between">
        <Header />
        <VContainer class="px-6 py-6 mt-10 flex-grow">
          <div>
            <h2 class="text-lg font-weight-bold mb-6">
              Выберите роль:
            </h2>

            <VCard
              class="d-flex align-center pa-4 mb-4 rounded-2xl elevation-0"
              color="#5C2DC4"
              height="152"
              style="cursor: pointer;"
              @click="selectRole('buyer')"
            >
              <div class="text-xl font-weight-bold white--text">
                Я покупатель
              </div>
              <VSpacer />
              <VImg
                src="/images/card.png"
                alt="Shopping Basket"
                height="100"
              />
            </VCard>

            <VCard
              class="d-flex align-center pa-4 rounded-lg elevation-0"
              color="#5C2DC4"
              height="152"
              style="cursor: pointer;"
              @click="selectRole('seller')"
            >
              <div class="text-xl font-weight-bold white--text">
                Я продавец
              </div>
              <VSpacer />
              <VImg
                src="/images/monitor.png"
                alt="Website Template"
                height="100"
              />
            </VCard>
          </div>
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
import { useRoute, useRouter } from "vue-router"

definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()
const chatId = route.query.chat_id

if (!chatId) {
  alert('Ошибка, попробуйте еще раз')
  throw new Error('Ошибка, попробуйте еще раз')
}

const router = useRouter()

const selectRole = async role => {
  const response = await api.telegram.sendPolicy(chatId)

  router.push(`/telegram/auth/conditions?role=${role}&chat_id=${chatId}`)
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
