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
  },

  async sendResetCode(phone, for_seller) {
    return await $api('/password/reset/send-link', {
      method: 'POST',
      body: { phone, for_seller }, // важно: используем `body`, не `data`
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  },

  async checkResetCode(reset_token, password, password_confirmation) {
    return await $api('/password/reset', {
      method: 'POST',
      body: { reset_token, password, password_confirmation }, // заменили data → body
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  },

  async resetPassword(reset_token, for_seller, password, password_confirmation) {
    return await $api('/password/reset', {
      method: 'POST',
      body: {
        reset_token,
        for_seller,
        password,
        password_confirmation
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  },

  async registerFromTelegram({telegram_id, phone, role, chatId, first_name = null, last_name = null}){

    return await $api('/telegram/register', {
      method: 'POST',
      body: {
        telegram_id,
        phone,
        role,
        chatId,
        first_name,
        last_name
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  },

  async register(phone, name, password, password_confirmation, role_id, email = null){
      return await $api('/register/password', {
          method: 'POST',
          body: {
              phone,
              name,
              password,
              password_confirmation,
              role_id,
              email
          },
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          }
      })
  },

    async impersonate({ token }) {
        const response = await $api('/impersonation/exchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: { token },
        })
        return response
    }
}
