import $api from "@/utils/api.js"

export default {
  async getBuybackById(id) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/seller/buybacks/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    return response
  },

  // Отменить заказ
  async cancelOrder(id, comment = null) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/buyback/${id}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify({
        comment: comment
      })
    })

    return response
  },

  // Подтвердить фото
  async approvePhoto(chatId, fileId) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/seller/chat/${chatId}/file/${fileId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    return response
  },

  // Отклонить фото
  async rejectPhoto(chatId, fileId, comment) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/seller/chat/${chatId}/file/${fileId}/reject`, {
      method: 'POST',
      body: {
        comment
      },
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
    })

    return response
  },

  async buybacksCount() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/seller/buybacks-count`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    return response
  },

  async sendScreen(id, file){
    const token = useCookie('accessToken').value
    if (!token) return null

    const formData = new FormData()
    formData.append('file', file)

    const response = await $api(`/seller/chat/${id}/payment/screen`, {
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
