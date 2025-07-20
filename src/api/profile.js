import $api from '@/utils/api'

export default {
  async updateProfile({ avatar, name, phone, email, password, password_confirmation }) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const formData = new FormData()

    if (avatar) formData.append('avatar', avatar)
    if (name) formData.append('name', name)
    if (phone) formData.append('phone', phone)
    if (email) formData.append('email', email)
    if (password) formData.append('password', password)
    if (password_confirmation) formData.append('password_confirmation', password_confirmation)

    const response = await $api('/profile', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
    return response
  },

  async getProfileStatistics() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/profile/statistic', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    return response
  },

  async getTelegramLink() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/get-telegram-link', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    return response
  },

  async savePayments(
    sbpPhone,
    sbpComment,
    sberCard,
    tbankCard,
    ozonCard,
    alfaCard,
    vtbCard,
    raiffeisenCard,
    gazprombankCard
  ) {
    const token = useCookie('accessToken').value
    if (!token) return null

    try {
      const response = await $api('/payment-methods', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sbp: sbpPhone?.replace(/\s/g, ''),
          sbp_comment: sbpComment,
          sber: sberCard?.replace(/\s/g, ''),
          tbank: tbankCard?.replace(/\s/g, ''),
          ozon: ozonCard?.replace(/\s/g, ''),
          alfa: alfaCard?.replace(/\s/g, ''),
          vtb: vtbCard?.replace(/\s/g, ''),
          raiffeisen: raiffeisenCard?.replace(/\s/g, ''),
          gazprombank: gazprombankCard?.replace(/\s/g, '')
        })
      })

      return response
    } catch (error) {
      console.error('Ошибка при сохранении платежных методов:', error)
      throw error // Пробрасываем ошибку для обработки в вызывающем коде
    }
  },

  async getPayments(){
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/payment-methods', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    return response
  },

  async getUser(){
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    return response
  }
}
