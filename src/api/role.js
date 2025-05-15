import $api from '@/utils/api'

export default {
  async switchRole() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/role-switch', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },
}
