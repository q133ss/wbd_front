import $api from '@/utils/api'

export default {
  async addToFavorite(productId) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/add-to-favorite', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    return response
  },

  async getFavorites() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/favorites', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    return response
  }
}
