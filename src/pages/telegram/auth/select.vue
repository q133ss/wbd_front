<template>
  <v-app>
    <v-main>
      <v-container class="pa-0">
        <Header></Header>
        <v-container class="px-6 py-6 mt-10">
          <h2 class="text-h5 font-weight-bold mb-6">Выберите роль:</h2>

          <v-card
            class="d-flex align-center pa-4 mb-4 rounded-lg elevation-0"
            color="#5C2DC4"
            height="150"
            @click="selectRole('buyer')"
            style="cursor: pointer;"
          >
            <div class="text-h6 font-weight-bold white--text">Я покупатель</div>
            <v-spacer></v-spacer>
            <img
              src="https://placehold.co/120x100?text=Корзина"
              alt="Shopping Basket"
              height="100"
              width="120"
            />
          </v-card>

          <v-card
            class="d-flex align-center pa-4 rounded-lg elevation-0"
            color="#5C2DC4"
            height="150"
            @click="selectRole('seller')"
            style="cursor: pointer;"
          >
            <div class="text-h6 font-weight-bold white--text">Я продавец</div>
            <v-spacer></v-spacer>
            <img
              src="https://placehold.co/120x100/A370F2/ffffff?text=Монитор"
              alt="Website Template"
              height="100"
              width="120"
            />
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

const selectRole = async (role) => {
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
