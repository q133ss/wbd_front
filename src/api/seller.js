import $api from '@/utils/api'

export default {
  async getSellerById(sellerId) {
    const response = await $api(`/seller/${sellerId}`, {
      method: 'GET'
    })
    return response
  }
}
