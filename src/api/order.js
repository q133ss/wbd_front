import $api from '@/utils/api'

export default {
  async createOrder(productId) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api(`/buyer/create-order/${productId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  },
}
