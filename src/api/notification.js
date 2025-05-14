import $api from '@/utils/api'

export default {
  // Получить список всех уведомлений
  async list() {
    const token = useCookie('accessToken').value
    if (!token) return []

    const response = await $api('/notifications', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  // Отметить все уведомления как прочитанные
  async markAsRead() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/notifications', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  }
}
