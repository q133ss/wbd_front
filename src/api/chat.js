import $api from '@/utils/api'

export default {
  async getStatusList() {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api('/chat/status-list', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  async getProductList() {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api('/seller/products', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
  },

  async getChatList(status = 'all') {
    const token = useCookie('accessToken').value
    if (!token) return null

    const url = `/chat-list?status=${encodeURIComponent(status)}`

    return await $api(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  async getChatListProduct(status = '') {
    const token = useCookie('accessToken').value
    if (!token) return null

    const url = `/chat-list?status=all&product_id=${encodeURIComponent(status)}`

    return await $api(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }) 
  },

  async sendMessage(chatId, text = '') {
    const token = useCookie('accessToken').value
    if (!token || !text) return null

    const formData = new FormData()

    formData.append('text', text)

    return await $api(`/chat/${chatId}/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    })
  },

  async getMessages(chatId) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api(`/messages/${chatId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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

    return await $api(`/chat/${chatId}/photo`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    })
  },

  async lastSeen(chatId) {
    const token = useCookie('accessToken').value
    if (!token) return null

    return await $api(`/chat/${chatId}/last_seen`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },
}
