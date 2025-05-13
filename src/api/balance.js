import $api from '@/utils/api'

export default {
  async getBalance() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/balance', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  }
}
