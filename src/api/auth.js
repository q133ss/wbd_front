import $api from '@/utils/api'

export default {
  async login({ phone, password, role_id }) {
    const response = await $api('/login', {
      method: 'POST',
      body: {
        phone,
        password,
        role_id,
      },
    })
    return response
  },
}
