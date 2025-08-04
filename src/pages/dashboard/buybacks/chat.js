import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue'; 
import api from '@/api/index.js';

export const useChatStore = defineStore('chat', {
  state: () => ({
    currentUser: ref(null),
    statuses: ref([]),
    chatsByStatus: ref({}),
    selectedStatus: ref('all'),
    activeChat: ref(null),
    messages: ref([]),
    loadingChats: ref(false),
    loadingStatuses: ref(true),
    loadingMessages: ref(false),
    lastSeen: ref(''),
  }),
  actions: {
    async fetchCurrentUser() {
      try {
        this.currentUser = await api.user.profile();
      } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
    },
    async fetchStatuses() {
      this.loadingStatuses = true;
      try {
        this.statuses = (await api.chat.getStatusList()) || [];
        console.log('Statuses:', this.statuses);
      } finally {
        this.loadingStatuses = false;
      }
    },
    async fetchChats(status) {
      this.loadingChats = true;
      try {
        this.chatsByStatus[status] = (await api.chat.getChatList(status)) || [];
      } finally {
        this.loadingChats = false;
      }
    },
    async selectChat(chat) {
      this.activeChat = chat;
      this.loadingMessages = true;
      try {
        const lastSeenResponse = await api.chat.lastSeen(chat.id);
        console.log('Last seen response:', lastSeenResponse);
        this.lastSeen = lastSeenResponse.buyer || '';

        const response = await api.chat.getMessages(chat.id);
        console.log('Messages response:', response);
        if (!response?.data) {
          throw new Error('Некорректный ответ API: отсутствует data');
        }
        this.messages = response.data?.data || response.data || [];
      } catch (error) {
        console.error('Error loading messages:', error);
        throw error;
      } finally {
        this.loadingMessages = false;
      }
    },
    updateChat(chat) {
      if (this.chatsByStatus[this.selectedStatus]) {
        const chats = [...this.chatsByStatus[this.selectedStatus]]; // Создаем копию массива
        const index = chats.findIndex((c) => c.id === chat.id);
        if (index !== -1) {
          chats[index] = { ...chats[index], ...chat }; // Обновляем чат
          this.chatsByStatus[this.selectedStatus] = chats; // Присваиваем обновленный массив
        }
        // Если обновляемый чат является активным, обновляем activeChat
        if (this.activeChat?.id === chat.id) {
          this.activeChat = { ...this.activeChat, ...chat };
        }
      }
    },
    addMessage(message) {
      if (!this.messages.some((msg) => msg.id === message.id)) {
        this.messages = [...this.messages, message]; // Реактивно добавляем сообщение
      }
    },
    resetState() {
      this.currentUser = null;
      this.statuses = [];
      this.chatsByStatus = {};
      this.selectedStatus = 'all';
      this.activeChat = null;
      this.messages = [];
      this.loadingChats = false;
      this.loadingStatuses = true;
      this.loadingMessages = false;
      this.lastSeen = '';
    },
  },
});
