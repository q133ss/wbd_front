<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()

const text = ref('Загрузка..')

onMounted(() => {
  const token = route.query.token // Получаем токен из URL

  if (token) {
    // Сохраняем токен!
    useCookie('accessToken').value = token
    fetchUserData()
  }else{
    // Токен не передан!
    text.value = 'Токен не указан, попробуйте еще раз.'
  }
})

async function fetchUserData() {
  try {
    const response = await api.profile.getUser()
  } catch (error) {
    console.error('Authentication failed:', error)
    text.value = 'Ваш токен устарел, попробуйте еще раз.'
  }
}
</script>

<template>
  <div>
    {{text}}
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
