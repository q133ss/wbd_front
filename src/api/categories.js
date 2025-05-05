import $api from '@/utils/api'

export default {
  async getCategories(params = {}) {
    const defaultParams = {
      page: 1,
      per_page: 18
    }

    try {
      const response = await $api('/category', {
        method: 'GET',
        params: {
          ...defaultParams,
          ...params
        }
      })

      return response.data || response
    } catch (error) {
      console.error('Ошибка в getCategories:', error)
      return []
    }
  }
}
