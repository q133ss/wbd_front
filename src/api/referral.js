import $api from '@/utils/api'

export default {
  async saveReferral(userId) {
    const response = await $api(`/referral/${userId}`, {
      method: 'POST',
      headers: {

      }
    })

    return response
  },

  async getReferralStats() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/referral', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  }
}
