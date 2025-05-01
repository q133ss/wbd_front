import axios from 'axios';

// Это пример
// Создаём экземпляр Axios с базовыми настройками
// TODO сделать настройку только в 1 месте!!!
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default {
  /**
   * Получить список товаров со скидкой
   * @param {number} limit - Количество товаров
   * @returns {Promise} - Ответ сервера
   */
  async getDiscountedProducts(limit = 10) {
    try {
      const response = await apiClient.get('/products', {
        params: { limit, discount: true }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке товаров:', error);
      throw error;
    }
  },

  /**
   * Отправить отзыв на товар
   * @param {string} productId - ID товара
   * @param {object} review - { rating: number, text: string }
   */
  async submitReview(productId, review) {
    try {
      const response = await apiClient.post(
        `/products/${productId}/reviews`,
        review
      );
      return response.data;
    } catch (error) {
      console.error('Ошибка при отправке отзыва:', error);
      throw error;
    }
  }
};
