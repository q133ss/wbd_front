<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()

onMounted(() => {
  const token = route.query.token // Получаем токен из URL

  if (token) {
    // Сохраняем токен!
    useCookie('accessToken').value = token
    fetchUserData()
  }
})

async function fetchUserData() {
  try {
    const response = await api.profile.getUser()
    console.log(response)
    alert('Авторизован:' + response.name)
  } catch (error) {
    console.error('Authentication failed:', error)
    alert('Не авторизован!')
    // Обработка ошибки аутентификации
  }
}
</script>

<template>
  <div>
    <div v-if="route.query.token" class="auth-message">
      Processing authentication...
    </div>
    <!-- Остальной контент вашего компонента -->
  </div>
</template>

<style scoped lang="scss">
.auth-message {
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}
</style>
