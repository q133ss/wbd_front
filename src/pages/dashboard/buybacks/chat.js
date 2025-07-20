import api from '@/api/index.js'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentUser: null,
    statuses: [],
    chatsByStatus: {},
    selectedStatus: 'all',
    activeChat: null,
    messages: [],
    loadingChats: false,
    loadingStatuses: true,
    loadingMessages: false,
    lastSeen: '',
  }),
  actions: {
    async fetchCurrentUser() {
      try {
        this.currentUser = await api.user.profile()
      } catch (error) {
        console.error('Error fetching user:', error)
        throw error
      }
    },
    async fetchStatuses() {
      this.loadingStatuses = true
      try {
        this.statuses = (await api.chat.getStatusList()) || []
        console.log(this.statuses)
        
      } finally {
        this.loadingStatuses = false
      }
    },
    async fetchChats(status) {
      this.loadingChats = true
      try {
        this.chatsByStatus[status] = (await api.chat.getChatList(status)) || []
      } finally {
        this.loadingChats = false
      }
    },
    async selectChat(chat) {
      this.activeChat = chat
      this.loadingMessages = true
      try {
        const lastSeenResponse = await api.chat.lastSeen(chat.id)

        console.log('Last seen response:', lastSeenResponse) // Логируем ответ
        this.lastSeen = lastSeenResponse.buyer || ''

        const response = await api.chat.getMessages(chat.id)

        console.log('Messages response:', response) // Логируем ответ
        if (!response?.data) {
          throw new Error('Некорректный ответ API: отсутствует data')
        }
        this.messages = response.data?.data || response.data || []
      } catch (error) {
        console.error('Error loading messages:', error)
        throw error
      } finally {
        this.loadingMessages = false
      }
    },
    updateChat(chat) {
      if (this.chatsByStatus[this.selectedStatus]) {
        this.chatsByStatus[this.selectedStatus] = this.chatsByStatus[
          this.selectedStatus
        ].map(c => (c.id === chat.id ? chat : c))
      }
    },
    addMessage(message) {
      if (!this.messages.some(msg => msg.id === message.id)) {
        this.messages.push(message)
      }
    },
    resetState() {
      this.currentUser = null
      this.statuses = []
      this.chatsByStatus = {}
      this.selectedStatus = 'all'
      this.activeChat = null
      this.messages = []
      this.loadingChats = false
      this.loadingStatuses = true
      this.loadingMessages = false
      this.lastSeen = ''
    },
  },
})
