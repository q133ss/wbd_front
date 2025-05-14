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

  async sendMessage(chatId, { text = '', files = [] }) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const formData = new FormData()
    if (text) formData.append('text', text)
    if (files && files.length > 0) {
      files.forEach(file => formData.append('files[]', file))
    }

    const response = await $api(`/chat/${chatId}/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
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

  async approveFile(chatId, fileId) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/seller/chat/${chatId}/file/${fileId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  async rejectFile(chatId, fileId) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/seller/chat/${chatId}/file/${fileId}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  }
}
