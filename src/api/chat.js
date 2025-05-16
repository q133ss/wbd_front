import $api from '@/utils/api'

export default {
  async getStatusList() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/chat/status-list', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  async getChatList(status = 'all') {
    const token = useCookie('accessToken').value
    if (!token) return null

    const url = `/chat-list?status=${encodeURIComponent(status)}`

    const response = await $api(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  async sendMessage(chatId, text = '') {
    const token = useCookie('accessToken').value
    if (!token || !text) return null

    const formData = new FormData()
    formData.append('text', text)

    const response = await $api(`/chat/${chatId}/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    })

    return response
  },

  async getMessages(chatId) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/messages/${chatId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  // async approveFile(chatId, fileId) {
  //   const token = useCookie('accessToken').value
  //   if (!token) return null
  //
  //   const response = await $api(`/seller/chat/${chatId}/file/${fileId}/approve`, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   })
  //
  //   return response
  // },

  // async rejectFile(chatId, fileId) {
  //   const token = useCookie('accessToken').value
  //   if (!token) return null
  //
  //   const response = await $api(`/seller/chat/${chatId}/file/${fileId}/reject`, {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   })
  //
  //   return response
  // },

  // send_photo --- заказ сденан
  // review -- оставил отзыв
  async sendPhoto(chatId, files = [], fileType = 'send_photo') {
    const token = useCookie('accessToken').value
    if (!token || !files.length) return null

    const formData = new FormData()
    files.forEach(file => {
      formData.append('files[]', file)
    })
    formData.append('file_type', fileType)

    const response = await $api(`/chat/${chatId}/photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      },
      body: formData
    })

    return response
  }
}
