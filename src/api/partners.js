import $api from '@/utils/api'

export default {
  async list(categoryId = 0) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api(`/seller/partners?category_id=${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    })
  },

  async categories() {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api(`/seller/partners/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    })
  },
}
