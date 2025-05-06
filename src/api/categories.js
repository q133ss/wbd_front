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
  },

  async getSubCategories(parentId, params = {}) {
    const defaultParams = {
      page: 1,
      per_page: 18
    }

    try {
      const response = await $api(`/sub-category/${parentId}`, {
        method: 'GET',
        params: {
          ...defaultParams,
          ...params
        }
      })

      return response.data || response
    } catch (error) {
      console.error(`Ошибка при получении подкатегорий для категории ${parentId}:`, error)
      return []
    }
  },

  async getCategoryProducts(categoryId, params = {}) {
    const defaultParams = {
      page: 1,
      per_page: 18
    }

    try {
      const response = await $api(`/categories/${categoryId}/products`, {
        method: 'GET',
        params: {
          ...defaultParams,
          ...params
        }
      })

      return response
    } catch (error) {
      console.error(`Ошибка при получении товаров категории ${categoryId}:`, error)
      return []
    }
  }
}
