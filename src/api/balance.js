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
  },

  async topUpBalance(amount) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/balance', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    })

    return response
  },

  async topUpBuybacks(amount) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/balance/buybacks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    })

    return response
  },

  async getTransactions(params = {}) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const query = new URLSearchParams()

    if (params.type) query.append('type', params.type)
    if (params.ads_id) query.append('ads_id', params.ads_id)
    if (params.buyback_id) query.append('buyback_id', params.buyback_id)
    if (params.product_id) query.append('product_id', params.product_id)

    const response = await $api(`/transactions?${query.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  }
}
