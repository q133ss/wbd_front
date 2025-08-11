import api from '@/api/index.js'
import { useSnackbarStore } from '@/stores/snackbar'
import Pusher from 'pusher-js'
import { nextTick, ref } from 'vue'
import { useChatStore } from './chat'

export const useChat = (chatLogPS, updateStatusTimer) => {
  const chatStore = useChatStore()
  const snackbar = useSnackbarStore()
  const pusherInstance = ref(null)
  let channel = null

  const initializePusher = () => {
    if (!pusherInstance.value) {
      pusherInstance.value = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        encrypted: true,
      })
      pusherInstance.value.connection.bind('error', err => {
        console.error('Pusher connection error:', err)
      })
    }
  }

  const setupPusher = chatId => {
    initializePusher()
    if (channel) channel.unsubscribe()
    channel = pusherInstance.value.subscribe(`chat-${chatId}`)
    channel.bind('MessageSent', async data => {
      const normalizedMessage = {
        id: data.id || `temp-${Date.now()}`,
        sender_id: data.sender_id,
        text: data.text,
        type: data.type || 'text',
        files: data.files || (data.file ? [data.file] : []),
        created_at: data.created_at || new Date().toISOString(),
        is_read: data.is_read || false,
      }

      if (!chatStore.messages.some(msg => msg.id === normalizedMessage.id)) {
        chatStore.addMessage(normalizedMessage)
        if (normalizedMessage.type === 'system') await refreshChat(chatId)
        await nextTick()
        scrollToBottom()
      }
    })
  }

  const setupNotificationChannel = () => {
    initializePusher()

    if (!chatStore.currentUser?.id) return

    const notificationChannel = pusherInstance.value.subscribe(
      `notification-${chatStore.currentUser.id}`,
    )

    notificationChannel.bind('MessageSent', async data => {
      try {
        await refreshChat(data.chatId)

        if (chatStore.activeChat?.id === data.chatId) {
          await chatStore.selectChat(chatStore.activeChat)
          await nextTick()
          scrollToBottom()
        }
      } catch (error) {
        console.error('Ошибка обновления чата по уведомлению:', error)
      }
    })
  }


  const cleanupPusher = () => {
    if (channel) channel.unsubscribe()
    if (pusherInstance.value) pusherInstance.value.disconnect()
    pusherInstance.value = null
  }

  const fetchChats = async status => {
    try {
      await chatStore.fetchChats(status)
    } catch (error) {
      console.error('Error fetching chats:', error)
      snackbar.notify({ text: 'Ошибка загрузки чатов', color: 'error' })
    }
  }

  const selectStatus = async status => {
    chatStore.selectedStatus = status
    if (!chatStore.chatsByStatus[status]) await fetchChats(status)
  }

  const selectChat = async chat => {
    try {
      await chatStore.selectChat(chat)
      setupPusher(chat.id)
      updateStatusTimer()
      await nextTick()
      scrollToBottom()
    } catch (error) {
      console.error('Error selecting chat:', error)
      snackbar.notify({
        text: error.response?.data?.message || 'Ошибка загрузки сообщений',
        color: 'error',
      })
    }
  }

  const refreshChat = async chatId => {
    try {
      const chat = await api.buyback.getBuybackById(chatId)
      if (chat) {
        chatStore.updateChat(chat)
        if (chatStore.activeChat?.id === chatId) {
          chatStore.activeChat = { ...chat } 
          await chatStore.selectChat(chat) 
        }
      }
    } catch (error) {
      console.error('Error refreshing chat:', error)
    }
  }

  const scrollToBottom = async () => {
    await nextTick()
    if (!chatLogPS.value) {
      console.warn('chatLogPS is not defined')
      
      return
    }
    const scrollEl = chatLogPS.value?.$el || chatLogPS.value
    if (scrollEl) {
      console.log('Scrolling to bottom, scrollHeight:', scrollEl.scrollHeight)
      scrollEl.scrollTop = scrollEl.scrollHeight
    } else {
      console.warn('scrollEl is not defined')
    }
  }

  return {
    fetchChats,
    selectStatus,
    selectChat,
    setupPusher,
    setupNotificationChannel,
    cleanupPusher,
    scrollToBottom,
  }
}
