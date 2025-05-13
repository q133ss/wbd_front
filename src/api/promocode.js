import $api from '@/utils/api'

export default {
  async applyPromocode(promocode) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/seller/promocode/apply', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ promocode })
    })

    return response
  }
}
