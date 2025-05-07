import $api from '@/utils/api'

export default {
  async addToFavorite(productId) {
    const response = await $api('/add-to-favorite', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response
  }
}
