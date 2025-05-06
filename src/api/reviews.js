import $api from '@/utils/api'

export default {
  async getProductReviews(productId, page = 1) {
    const response = await $api(`/product/${productId}/feedbacks/${page}`, {
      method: 'GET'
    })
    return response
  }
}
