<script setup>
import api from '@/api/auth'
import { nextTick } from 'vue'
import {useSnackbarStore} from "@/stores/snackbar.js";

const route = useRoute()
const router = useRouter()
const snackbar = useSnackbarStore()

const impersonate = async () => {
  try {
    const impersonation_token = route.query.impersonation_token
    const userFromQuery = route.query.user

    if (!impersonation_token || !userFromQuery) {
      snackbar.error('Отсутствует impersonation_token или user')
      return
    }

    // 1) Очистка старых токенов
    useCookie('accessToken').value = null
    useCookie('userData').value = null
    localStorage.clear() // если нужно подчистить и localStorage

    // 2) Обмен токена
    const res = await api.impersonate({ token: impersonation_token })
    const { token, user } = res

    // 3) Сохранение новых данных
    useCookie('accessToken').value = token
    useCookie('userData').value = user || userFromQuery

    // 4) Перенаправление
    await nextTick(() => {
      router.replace(route.query.to ? String(route.query.to) : '/')
    })
  } catch (error) {
    console.error(error)
    const message = error.response?.data?.message || 'Не удалось выполнить вход под пользователем'
    snackbar.error(message)
  }
}

onMounted(() => {
  impersonate()
})
</script>

<template>
<span>Загрузка...</span>
</template>

<style scoped lang="scss">

</style>
