import $api from '@/utils/api'

export default {
  async getBalance() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/balance', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  async topUpBalance(amount) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api('/balance', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    })

    return response
  },

  async topUpBuybacks(id) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/balance/buybacks/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    return response
  },

  async getTransactions(params = {}) {
    const token = useCookie('accessToken').value
    if (!token) return null

    const query = new URLSearchParams()

    if (params.type) query.append('type', params.type)
    if (params.ads_id) query.append('ads_id', params.ads_id)
    if (params.buyback_id) query.append('buyback_id', params.buyback_id)
    if (params.product_id) query.append('product_id', params.product_id)

    const response = await $api(`/transactions?${query.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },

  async withdraw(amount, card_number) {
    console.log(amount)
    console.log(typeof amount)
    const token = useCookie('accessToken').value;
    if (!token) return null;

    // Жёсткое преобразование типов
    const numericAmount = parseFloat(amount);
    const cleanCardNumber = String(card_number).replace(/\D/g, '');

    // Расширенная валидация
    if (isNaN(numericAmount) || !isFinite(numericAmount)) {
      throw new Error('Сумма должна быть числом');
    }

    if (numericAmount <= 0) {
      throw new Error('Сумма должна быть положительной');
    }

    if (!/^\d{16}$/.test(cleanCardNumber)) {
      throw new Error('Номер карты должен содержать 16 цифр');
    }

    // Формируем тело запроса
    const requestData = {
      amount: numericAmount,
      card_number: cleanCardNumber
    };

    // Отправка запроса с обработкой ошибок
    try {
      const response = await $api('/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      return response;
    } catch (error) {
      console.error('Ошибка запроса:', error);
      throw error;
    }
  },

  async getBalaceOnly() {
    const token = useCookie('accessToken').value
    if (!token) return null

    const response = await $api(`/balance/only`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    return response
  },
}
