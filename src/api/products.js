import $api from '@/utils/api'

export default {
  async getProducts(params = {}) {
    const defaultParams = {
      page: 1,
      per_page: 18
    }

    const response = await $api('/products', {
      method: 'GET',
      params: {
        ...defaultParams,
        ...params
      }
    })

    return response
  },
  async getProductById(productId) {
    const response = await $api(`/product/${productId}`, {
      method: 'GET'
    })

    return response
  }
}
