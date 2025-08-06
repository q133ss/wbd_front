<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'

const route = useRoute()
const text = ref('Загрузка...')
const router = useRouter()

onMounted(async () => {
  const chatId = route.query.chat_id // Получаем токен из URL

  try{
    if (chatId) {
      // Сохраняем чат ид!
      useCookie('chatId').value = chatId

      try{
        const response = await api.telegram.getUser(chatId)

        if (response && response.user) {
          useCookie('accessToken').value = response.token
          useCookie('userData').value = response.user
          await nextTick(() => {
            window.location.href = route.query.to ? String(route.query.to) : '/'
          })
        }
      }catch (e) {
        if(e.response && e.response.status === 404) {
          router.push('/telegram/auth/select?chat_id=' + chatId)
        }
      }
    }else{
      text.value = 'Не удалось получить ID чата, попробуйте еще раз.'
    }
  }catch (err){
    text.value = 'Произошла ошибка, попробуйте еще раз.'
  }

})
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
