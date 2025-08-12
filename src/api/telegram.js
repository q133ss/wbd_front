import $api from '@/utils/api'

export default {
  async sendPolicy(chatId) {
    const response = await $api(`/telegram/policy/${chatId}`, {
      method: 'POST'
    })

    return response
  },

  async getUser(tgID){
    const response = await $api(`/telegram/user/${tgID}`, {
      method: 'POST'
    })

    return response
  },

  async getReferralLink(){
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/get-telegram-ref`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    return response
  }
}
