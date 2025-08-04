import api from '@/api/index'
import { useSnackbarStore } from '@/stores/snackbar'
import { useChatStore } from './chat'

export const useOrders = () => {
  const chatStore = useChatStore()
  const snackbar = useSnackbarStore()

  const cancelOrder = async () => {
    try {
      await api.buyback.cancelOrder(chatStore.activeChat.id)
      chatStore.activeChat.status = 'cancelled'
      snackbar.notify({ text: 'Заказ отменен', color: 'success' })
    } catch (error) {
      snackbar.notify({
        text: error.response?._data?.message || 'Ошибка отмены заказа',
        color: 'error',
      })
    }
  }

  const acceptPayment = async (chatId, buybackId) => {
    if (!chatId || !buybackId) return

    try {     
      console.log('2222222222')
      await api.buyback.acceptPayment(chatId, buybackId)

      snackbar.notify({ text: 'Платеж принят', color: 'success' })
      await chatStore.selectChat(chatStore.activeChat)
    } catch (error) {
      snackbar.notify({
        text: error.response?._data?.message || 'Ошибка при принятии платежа',
        color: 'error',
      })
    }
  }



  return { cancelOrder, acceptPayment }
}
