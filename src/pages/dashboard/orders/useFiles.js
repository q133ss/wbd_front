import api from '@/api/index'
import { useSnackbarStore } from '@/stores/snackbar'
import { ref } from 'vue'
import { useChatStore } from './chat'

export const useFiles = () => {
  const chatStore = useChatStore()
  const snackbar = useSnackbarStore()
  const pendingFile = ref(null)
  const barcodeFile = ref(null)
  const reviewFile = ref(null)
  const pendingPreview = ref(null)
  const barcodePreview = ref(null)
  const reviewPreview = ref(null)

  const generatePreview = (file, previewRef) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()

      reader.onload = e => (previewRef.value = e.target.result)
      reader.readAsDataURL(file)
    } else {
      
    }
    {
      previewRef.value = null
    }
  }

  const uploadPendingFile = async () => {
    if (!pendingFile.value) return
    try {
      await api.chat.sendPhoto(chatStore.activeChat.id, [pendingFile.value], 'send_photo')
      pendingFile.value = null
      pendingPreview.value = null
      snackbar.notify({ text: 'Скриншот заказа отправлен', color: 'success' })
      await chatStore.selectChat(chatStore.activeChat)
    } catch (error) {
      snackbar.notify({
        text: error.response?._data?.message || 'Ошибка отправки скриншота',
        color: 'error',
      })
    }
  }

  const uploadConfirmationFiles = async () => {
    if (!barcodeFile.value || !reviewFile.value) return
    try {
      await api.chat.sendPhoto(chatStore.activeChat.id, [barcodeFile.value, reviewFile.value], 'review')
      barcodeFile.value = null
      reviewFile.value = null
      barcodePreview.value = null
      reviewPreview.value = null
      snackbar.notify({ text: 'Файлы отправлены', color: 'success' })
      await chatStore.selectChat(chatStore.activeChat)
    } catch (error) {
      snackbar.notify({
        text: error.response?._data?.message || 'Ошибка отправки файлов',
        color: 'error',
      })
    }
  }

  return {
    generatePreview,
    uploadPendingFile,
    uploadConfirmationFiles,
    pendingFile,
    barcodeFile,
    reviewFile,
    pendingPreview,
    barcodePreview,
    reviewPreview,
  }
}
