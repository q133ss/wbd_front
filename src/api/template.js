import $api from '@/utils/api'

export default {
  async getAllTemplates() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/template', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  async getTemplateByType(type) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const allowedTypes = ['order_conditions', 'redemption_instructions', 'review_criteria']
    if (!allowedTypes.includes(type)) {
      throw new Error('Invalid template type')
    }

    const response = await $api(`/template/${type}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  async updateTemplate(type, data) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const allowedTypes = ['order_conditions', 'redemption_instructions', 'review_criteria']
    if (!allowedTypes.includes(type)) {
      throw new Error('Invalid template type')
    }

    const response = await $api(`/template/${type}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    return response
  }
}
