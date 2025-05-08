import $api from '@/utils/api'

export default {
  async login({ phone, password, role_id }) {
    const response = await $api('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: {
        phone,
        password,
        role_id,
      },
    })
    return response
  },

  async sendCode(phone) {
    return await $api('/register/send-code', {
      method: 'POST',
      body: {phone},
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      responseType: 'json'
    })
  },

  async verifyCode({ phone, code, role_id }) {
    return await $api('/register/verify-code', {
      method: 'POST',
      body: {phone, code, role_id},
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      responseType: 'json'
    })
  },

  async completeRegistration({ name, password, password_confirmation, email = null }) {
    const token = useCookie('accessToken').value
    return await $api('/register/complete', {
      method: 'POST',
      body: {
        name,
        email,
        password,
        password_confirmation
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      responseType: 'json'
    })
  }
}
