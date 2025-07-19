import api from '@/api/index'
import { useSnackbarStore } from '@/stores/snackbar'
import { ref } from 'vue'
import { useChatStore } from './chat'

export const useReviews = () => {
  const chatStore = useChatStore()
  const snackbar = useSnackbarStore()
  const reviewText = ref('')
  const reviewRating = ref(null)

  const submitReview = async () => {
    if (!reviewText.value.trim() || reviewRating.value == null) return
    try {
      await api.reviews.storeReview(chatStore.activeChat.id, reviewText.value, reviewRating.value)
      reviewText.value = ''
      reviewRating.value = null
      snackbar.notify({ text: 'Отзыв отправлен', color: 'success' })
      await chatStore.selectChat(chatStore.activeChat)
    } catch (error) {
      snackbar.notify({
        text: error.response?._data?.message || 'Ошибка отправки отзыва',
        color: 'error',
      })
    }
  }

  return { submitReview, reviewText, reviewRating }
}
