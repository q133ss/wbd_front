import $api from '@/utils/api'

export default {
  async sendPolicy(chatId) {
    const response = await $api(`/telegram/policy/${chatId}`, {
      method: 'POST'
    })

    return response
  }
}
