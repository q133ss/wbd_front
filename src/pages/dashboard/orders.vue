<template>
  <v-container fluid class="pa-0 chat-container">
    <v-row no-gutters>
      <!-- Левая колонка: список диалогов -->
      <v-col cols="12" md="4" class="dialog-list">
        <v-card flat class="pa-4 dialog-list-card">
          <!-- Выбор статуса -->
          <v-select
            v-model="selectedStatus"
            :items="statuses"
            item-title="title"
            item-value="slug"
            label="Статус"
            density="compact"
            variant="outlined"
            class="mb-4"
            @update:modelValue="fetchChatList"
          ></v-select>
          <!-- Список диалогов -->
          <v-list class="dialog-list-items">
            <v-list-item
              v-for="chat in chatList"
              :key="chat.id"
              :class="{ 'selected-chat': selectedChat?.id === chat.id }"
              @click="selectChat(chat)"
            >
              <v-row align="center">
                <v-col cols="3">
                  <v-avatar size="60" class="dialog-avatar">
                    <v-img
                      :src="chat.ad.product.images[0] || '/placeholder.png'"
                      alt="Продукт"
                    ></v-img>
                  </v-avatar>
                </v-col>
                <v-col cols="9">
                  <v-list-item-title>{{ chat.ad.product.name }}</v-list-item-title>
                  <v-chip
                    v-if="chat.messages.some((m) => !m.is_read)"
                    color="red"
                    x-small
                    class="not-read-chip"
                  >
                    {{ chat.messages.filter((m) => !m.is_read).length }}
                  </v-chip>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Правая колонка: диалог -->
      <v-col cols="12" md="8" class="chat-dialog">
        <v-card flat v-if="selectedChat" class="chat-card">
          <!-- Заголовок чата -->
          <v-toolbar flat class="chat-toolbar">
            <v-row align="center">
              <v-col cols="2">
                <v-avatar size="40" @click="goToProduct(selectedChat.ad)">
                  <v-img
                    :src="selectedChat.ad.product.images[0] || '/placeholder.png'"
                    alt="Продукт"
                  ></v-img>
                </v-avatar>
              </v-col>
              <v-col cols="2">
                <v-avatar size="40" color="primary" @click="goToShop(selectedChat.user)">
                  <span class="white--text">{{
                      selectedChat.user.name.charAt(0).toUpperCase()
                    }}</span>
                </v-avatar>
              </v-col>
              <v-col cols="8">
                <v-toolbar-title>{{ selectedChat.ad.product.name }}</v-toolbar-title>
                <v-toolbar-subtitle>{{ selectedChat.user.name }}</v-toolbar-subtitle>
              </v-col>
            </v-row>
          </v-toolbar>

          <!-- Сообщения -->
          <v-card-text
            class="messages-container"
            ref="messagesContainer"
            @scroll="handleScroll"
          >
            <v-progress-circular
              v-if="isLoadingMore"
              indeterminate
              color="primary"
              size="24"
              class="loading-indicator"
            ></v-progress-circular>
            <v-alert
              v-if="!messages.length && !isLoadingMore"
              type="info"
              dense
              class="empty-chat-alert"
            >
              В этом чате пока нет сообщений
            </v-alert>
            <div
              v-for="message in messages"
              :key="message.id || message.tempId"
              :class="[
                'message',
                { 'message-mine': message.sender_id === userId },
                { 'message-other': message.sender_id !== userId },
                { 'message-temp': message.tempId }
              ]"
            >
              <v-chip class="message-chip" :class="message.sender_id === userId ? 'mine' : 'other'">
                {{ message.text }}
              </v-chip>
              <div class="message-time">
                {{ formatDate(message.created_at || message.updated_at) }}
              </div>
            </div>
          </v-card-text>

          <!-- Поле ввода сообщения -->
          <v-card-actions class="message-input">
            <v-text-field
              v-model="newMessage"
              label="Напишите сообщение..."
              variant="outlined"
              density="compact"
              class="message-input-field"
              @keyup.enter="sendMessage"
            ></v-text-field>
            <v-btn
              color="primary"
              class="ml-2"
              @click="sendMessage"
            >
              Отправить
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-else flat class="pa-4">
          <v-card-text>Выберите диалог для просмотра сообщений</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import Pusher from 'pusher-js';
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import { useSnackbarStore } from '@/stores/snackbar';

const snackbar = useSnackbarStore();
const router = useRouter();

const statuses = ref([]);
const selectedStatus = ref('all');
const chatList = ref([]);
const selectedChat = ref(null);
const messages = ref([]);
const newMessage = ref('');
const pusher = ref(null);
const channel = ref(null);
const messagesContainer = ref(null);
const userId = ref(useCookie('userData').value?.id || null);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  next_page_url: null,
});
const isLoadingMore = ref(false);
let tempMessageId = 0;

// Обработка ошибок
const handleError = (error, errMessage = 'Произошла неизвестная ошибка') => {
  if (error.response?.status === 422) {
    const message = error.response._data.message;
    snackbar.error(message);
  } else {
    snackbar.error(errMessage);
  }
};

// Получение списка статусов
const fetchStatuses = async () => {
  try {
    const response = await api.chat.getStatusList();
    statuses.value = response;
  } catch (error) {
    console.error('Ошибка получения статусов:', error);
    handleError(error, 'Не удалось загрузить статусы');
  }
};

// Получение списка чатов
const fetchChatList = async () => {
  try {
    const response = await api.chat.getChatList(selectedStatus.value);
    chatList.value = response;
    if (chatList.value.length && !selectedChat.value) {
      selectChat(chatList.value[0]);
    }
  } catch (error) {
    console.error('Ошибка получения списка чатов:', error);
    handleError(error, 'Не удалось загрузить список чатов');
  }
};

// Выбор чата
const selectChat = async (chat) => {
  selectedChat.value = chat;
  pagination.value = { current_page: 1, last_page: 1, next_page_url: null };
  messages.value = [];
  console.log('Выбран чат, buybackId:', chat.id);
  await fetchMessages(chat.id, 1);
  subscribeToPusherChannel(chat.id);
  await scrollToBottom();
};

// Получение сообщений
const fetchMessages = async (buybackId, page = 1) => {
  try {
    const response = await api.chat.getMessages(buybackId, page);
    const newMessages = response.data || [];
    console.log('Получены сообщения:', newMessages, 'Страница:', page, 'buybackId:', buybackId);
    if (newMessages.length || page === 1) {
      messages.value = page === 1 ? newMessages : [...newMessages, ...messages.value];
    }
    pagination.value = {
      current_page: response.current_page || 1,
      last_page: response.last_page || 1,
      next_page_url: response.next_page_url || null,
    };
    console.log('Пагинация обновлена:', pagination.value);
    if (page === 1) {
      await scrollToBottom();
    }
  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    handleError(error, 'Не удалось загрузить сообщения');
  }
};

// Загрузка дополнительных сообщений
const loadMoreMessages = async () => {
  if (isLoadingMore.value || pagination.value.current_page >= pagination.value.last_page) return;
  isLoadingMore.value = true;
  try {
    const nextPage = pagination.value.current_page + 1;
    console.log('Загрузка сообщений, страница:', nextPage, 'buybackId:', selectedChat.value.id);
    await fetchMessages(selectedChat.value.id, nextPage);
  } finally {
    isLoadingMore.value = false;
  }
};

// Обработка прокрутки
const handleScroll = () => {
  if (!messagesContainer.value) {
    console.warn('Контейнер сообщений не инициализирован');
    return;
  }
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  console.log('Событие прокрутки: scrollTop=', scrollTop, 'scrollHeight=', scrollHeight, 'clientHeight=', clientHeight);
  if (scrollTop < 300 && !isLoadingMore.value && clientHeight > 0 && Number.isFinite(scrollTop)) {
    loadMoreMessages();
  }
};

// Инициализация Pusher
const initPusher = () => {
  pusher.value = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    encrypted: true,
  });
  pusher.value.connection.bind('connected', () => {
    console.log('Pusher подключен');
  });
  pusher.value.connection.bind('error', (err) => {
    console.error('Ошибка подключения Pusher:', err);
  });
};

// Подписка на канал Pusher
const subscribeToPusherChannel = (buybackId) => {
  if (channel.value) {
    channel.value.unbind_all();
    pusher.value.unsubscribe(`messages-${selectedChat.value?.id}`);
  }
  channel.value = pusher.value.subscribe(`messages-${buybackId}`);
  console.log(`Подписка на канал: messages-${buybackId}`);
  channel.value.bind('MessageSent', (data) => {
    console.log('Получено событие MessageSent:', data);
    if (data.message && !messages.value.some(msg => msg.id === data.message.id)) {
      messages.value = [...messages.value, {
        ...data.message,
        sender_id: data.message.sender_id || 0,
        created_at: data.message.created_at || data.message.updated_at || new Date().toISOString(),
        is_read: data.message.is_read || 0,
        color: data.message.color || '#7F56D9',
      }];
      scrollToBottom();
    } else {
      console.error('Некорректные или дублирующиеся данные сообщения:', data);
    }
  });
};

// Отправка сообщения
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value) {
    snackbar.error('Введите сообщение и выберите чат');
    return;
  }
  const token = useCookie('accessToken').value;
  if (!token) {
    snackbar.error('Пользователь не авторизован');
    console.error('Отсутствует токен доступа');
    return;
  }
  if (!userId.value) {
    snackbar.error('Пользователь не определен');
    console.error('Отсутствует ID пользователя');
    return;
  }

  // Добавление временного сообщения
  const tempId = `temp-${tempMessageId++}`;
  const tempMessage = {
    tempId,
    text: newMessage.value,
    sender_id: userId.value,
    buyback_id: selectedChat.value.id,
    type: 'text',
    is_read: 0,
    color: '#7F56D9',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  messages.value = [...messages.value, tempMessage];
  console.log('Добавлено временное сообщение:', tempMessage);
  await scrollToBottom();
  const localNewMessage = newMessage.value;
  newMessage.value = '';

  // Отправка на сервер
  try {
    const response = await api.chat.sendMessage(selectedChat.value.id, localNewMessage);
    console.log('Ответ отправки сообщения:', response);
    // Замена временного сообщения
    messages.value = messages.value.filter(msg => msg.tempId !== tempId);
    if (response?.id) {
      messages.value = [...messages.value, response];
      console.log('Добавлено серверное сообщение:', response);
      await scrollToBottom();
    }
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    messages.value = messages.value.filter(msg => msg.tempId !== tempId);
    handleError(error, 'Не удалось отправить сообщение');
  }
};

// Прокрутка вниз
const scrollToBottom = async () => {
  if (!messagesContainer.value) {
    console.warn('Контейнер сообщений не инициализирован');
    return;
  }
  console.log('Контейнер сообщений:', messagesContainer.value);
  let attempts = 0;
  const maxAttempts = 3;
  const tryScroll = () => {
    const { scrollHeight, clientHeight } = messagesContainer.value;
    if (scrollHeight && clientHeight && Number.isFinite(scrollHeight)) {
      messagesContainer.value.scrollTop = scrollHeight - clientHeight;
      console.log('Прокручено вниз: scrollHeight=', scrollHeight, 'clientHeight=', clientHeight, 'scrollTop=', messagesContainer.value.scrollTop);
    } else {
      console.warn('Некорректные размеры контейнера: scrollHeight=', scrollHeight, 'clientHeight=', clientHeight);
      if (attempts < maxAttempts) {
        attempts++;
        setTimeout(tryScroll, 200);
      }
    }
  };
  await nextTick();
  setTimeout(tryScroll, 100);
};

// Форматирование даты
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ru-RU');
};

// Переход к продукту
const goToProduct = (ad) => {
  router.push(`/products/${ad.id}`);
};

// Переход к магазину
const goToShop = (user) => {
  router.push(`/shops/${user.id}`);
};

onMounted(async () => {
  await fetchStatuses();
  await fetchChatList();
  initPusher();
});

onBeforeUnmount(() => {
  if (channel.value) {
    channel.value.unbind_all();
    pusher.value.unsubscribe(`messages-${selectedChat.value?.id}`);
  }
  if (pusher.value) {
    pusher.value.disconnect();
  }
});

definePage({
  meta: {
    layout: 'default',
    authRequired: true,
  },
});
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow: hidden;
}

.dialog-list {
  height: calc(100vh - 64px);
  overflow-y: auto;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
}

.dialog-list-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.dialog-list-items {
  padding: 8px;
}

.dialog-avatar {
  transition: transform 0.2s;
}

.dialog-avatar:hover {
  transform: scale(1.05);
}

.selected-chat .dialog-avatar {
  border: 2px solid #7F56D9;
}

.not-read-chip {
  position: absolute;
  top: 0;
  right: 0;
}

.chat-dialog {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
}

.chat-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.chat-toolbar {
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #f5f5f5, #ffffff);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
  padding-bottom: 80px;
  min-height: 200px;
}

.loading-indicator {
  margin: 16px auto;
}

.empty-chat-alert {
  margin: 16px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  transition: background-color 0.2s;
}

.message:hover {
  background-color: #f9f9f9;
}

.message-mine {
  align-self: flex-end;
}

.message-other {
  align-self: flex-start;
}

.message-temp .message-chip {
  opacity: 0.7;
}

.message-chip {
  border-radius: 20px;
  padding: 10px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-chip.mine {
  background: linear-gradient(135deg, #7F56D9, #9b59b6);
  color: white;
}

.message-chip.other {
  background: linear-gradient(135deg, #e0e0e0, #ffffff);
  color: black;
}

.message-time {
  font-size: 12px;
  color: #757575;
  margin-top: 4px;
  align-self: flex-end;
}

.message-input {
  position: fixed;
  bottom: 0;
  left: 33.33%;
  width: 66.67%;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  padding: 16px;
  display: flex;
  align-items: center;
  z-index: 10;
}

.message-input-field {
  background-color: #f5f5f5;
  border-radius: 20px;
  flex: 1;
  margin-right: 8px;
}
</style>
