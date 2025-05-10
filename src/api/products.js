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
  },
  async getRelatedProducts(productId) {
    const response = await $api(`/product/related/${productId}`, {
      method: 'GET'
    })
    return response
  },

  async getSellerProducts(params = {}) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const defaultParams = {
      page: 1
    }

    const response = await $api('/seller/products', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        ...defaultParams,
        ...params
      }
    })

    return response
  },
  async stopSellerProducts(productIds) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/seller/products/stop', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_ids: productIds
      })
    })

    return response
  },
  async fetchWbProduct(article) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/wb/fetch-product/${article}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },
  async addWbProduct(article) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/wb/add-product/${article}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },
  async archiveSellerProducts(productIds) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/seller/products/archive', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_ids: productIds
      })
    })

    return response
  },
  async duplicateSellerProducts(productIds) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/seller/products/duplicate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      data: {
        product_ids: productIds
      }
    })

    return response
  }
}
