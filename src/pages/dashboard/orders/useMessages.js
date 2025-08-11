import $api from '@/utils/api'
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
    if (!chatStore.activeChat) {
      snackbar.notify({ text: 'Чат не выбран', color: 'error' })

      return
    }

    if (!messageInput.value.trim() && !fileInput.value?.files?.length) {
      snackbar.notify({ text: 'Введите сообщение или выберите файл', color: 'error' })

      return
    }

    sendingMessage.value = true

    try {
      const token = useCookie('accessToken').value
      if (!token) {
        throw new Error('Токен авторизации отсутствует')
      }

      const formData = new FormData()

      // Добавляем текст, если он есть
      if (messageInput.value.trim()) {
        formData.append('text', messageInput.value)
      }

      // Добавляем файлы, если они выбраны
      if (fileInput.value?.files?.length) {
        Array.from(fileInput.value.files).forEach(file => {
          formData.append('files[]', file)
        })
      }

      const response = await $api(`/chat/${chatStore.activeChat.id}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      })

      console.log('API response:', response)

      if (!response) {
        throw new Error('Некорректный ответ API: ответ пустой')
      }

      const messageData = response.data?.message || response.message || response
      if (!messageData?.id) {
        throw new Error('Некорректный ответ API: отсутствует id')
      }

      const newMessage = {
        id: messageData.id,
        sender_id: messageData.sender_id || chatStore.currentUser.id,
        text: messageData.text || messageInput.value,
        type: fileInput.value?.files?.length ? 'image' : 'text',
        files: messageData.files || (fileInput.value?.files?.length ? Array.from(fileInput.value.files).map(file => ({ src: URL.createObjectURL(file) })) : []),
        created_at: messageData.created_at || new Date().toISOString(),
        is_read: messageData.is_read || false,
      }

      chatStore.addMessage(newMessage)
      messageInput.value = ''
      if (fileInput.value) fileInput.value.value = ''
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
