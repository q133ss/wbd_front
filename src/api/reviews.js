import $api from '@/utils/api'

export default {
  async getProductReviews(productId, page = 1) {
    const response = await $api(`/product/${productId}/feedbacks/${page}`, {
      method: 'GET'
    })
    return response
  },
  async storeReview(chatId, text, rating) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/chat/${chatId}/review`, {
      method: 'POST',
      body: {
        rating,
        text
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
    })

    return response
  }
}
