import $api from '@/utils/api'

export default {
  async getTariffList() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/seller/tariff/list', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  async getTariffById(id) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/seller/tariff/get-by-id/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  }
}
