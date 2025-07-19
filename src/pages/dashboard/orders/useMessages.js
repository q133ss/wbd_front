import api from '@/api/index'
import { useSnackbarStore } from '@/stores/snackbar'
import { debounce } from 'lodash'
import { ref } from 'vue'
import { useChatStore } from './chat'

export const useMessages = () => {
  const chatStore = useChatStore()
  const snackbar = useSnackbarStore()
  const sendingMessage = ref(false)
  const messageInput = ref('')
  const fileInput = ref(null)

  const sendMessage = debounce(async () => {
    if (!messageInput.value.trim() && !fileInput.value?.files?.length) return
    sendingMessage.value = true

    try {
      const formData = new FormData()

      formData.append('message', messageInput.value)
      if (fileInput.value?.files?.length) formData.append('file', fileInput.value.files[0])

      const response = await api.chat.sendMessage(chatStore.activeChat.id, messageInput.value, formData)

      console.log('API sendMessage response:', response) // Логируем ответ API

      // Проверяем наличие response и его структуры
      if (!response) {
        throw new Error('Некорректный ответ API: ответ пустой')
      }

      // Предполагаем, что данные могут быть в response или response.data
      const messageData = response.data?.message || response.message || response
      if (!messageData?.id) {
        throw new Error('Некорректный ответ API: отсутствует id')
      }

      const newMessage = {
        id: messageData.id,
        sender_id: messageData.sender_id || chatStore.currentUser.id,
        text: messageData.text || messageInput.value,
        type: messageData.type || (fileInput.value?.files?.length ? 'image' : 'text'),
        files: messageData.files || (fileInput.value?.files?.length ? [{ src: URL.createObjectURL(fileInput.value.files[0]) }] : []),
        created_at: messageData.created_at || new Date().toISOString(),
        is_read: messageData.is_read || false,
      }

      chatStore.addMessage(newMessage)

      messageInput.value = ''
      if (fileInput.value) fileInput.value.value = ''

      // snackbar.notify({ text: 'Сообщение отправлено', color: 'success' })
    } catch (error) {
      console.error('Error sending message:', error)
      snackbar.notify({
        text: error.response?.data?.message || error.message || 'Ошибка отправки сообщения',
        color: 'error',
      })
    } finally {
      sendingMessage.value = false
    }
  }, 300)

  return { sendMessage, messageInput, fileInput, sendingMessage }
}
