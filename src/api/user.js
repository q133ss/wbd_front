import $api from '@/utils/api'

export default {
  async profile() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  }
}
