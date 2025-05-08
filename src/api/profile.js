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
  }
}
