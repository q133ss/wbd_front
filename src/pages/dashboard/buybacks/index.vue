<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useSnackbarStore } from '@/stores/snackbar'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import Pusher from 'pusher-js'
import api from '@/api/Index'

definePage({ meta: { layoutWrapperClasses: 'layout-content-height-fixed' } })

const snackbar = useSnackbarStore()
const { smAndDown } = useDisplay()
const router = useRouter()

// Current user
const currentUser = ref(null)

// Statuses and chats
const statuses = ref([])
const chatsByStatus = ref({})
const selectedStatus = ref('all')
const loadingStatuses = ref(true)
const loadingChats = ref(false)

// Active chat
const activeChat = ref(null)
const messages = ref([])
const chatLogPS = ref()
const messageInput = ref('')
const fileInput = ref(null)

// Image modal
const imageModal = ref(false)
const selectedImage = ref('')

// Timer
const timer = ref('')
const timerInterval = ref(null)

// Pusher
let pusher = null
let channel = null

// Declension for "выкуп"
const getBuybackDeclension = (count) => {
  const num = Math.abs(count)
  if (num % 10 === 1 && num % 100 !== 11) {
    return 'выкуп'
  } else if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) {
    return 'выкупа'
  } else {
    return 'выкупов'
  }
}

// Fetch current user and statuses
onMounted(async () => {
  try {
    currentUser.value = await api.user.profile()
    console.log('Current user:', currentUser.value)
    const response = await api.chat.getStatusList()
    statuses.value = response || []
    await fetchChats()
  } catch (error) {
    console.error('Error loading data:', error)
    snackbar.notify({
      text: 'Ошибка загрузки данных',
      color: 'error'
    })
  } finally {
    loadingStatuses.value = false
  }
})

// Fetch chats for selected status
const fetchChats = async () => {
  loadingChats.value = true
  try {
    const response = await api.chat.getChatList(selectedStatus.value)
    chatsByStatus.value[selectedStatus.value] = response || []
  } catch (error) {
    console.error('Error loading chats:', error)
    snackbar.notify({
      text: 'Ошибка загрузки чатов',
      color: 'error'
    })
  } finally {
    loadingChats.value = false
  }
}

// Select status
const selectStatus = async (status) => {
  selectedStatus.value = status
  if (!chatsByStatus.value[status]) {
    await fetchChats()
  }
}

// Select chat
const selectChat = async (chat) => {
  activeChat.value = chat
  messages.value = []
  try {
    const response = await api.chat.getMessages(chat.id)
    messages.value = response.data || []
    console.log('Active chat data:', activeChat.value)
    setupPusher(chat.id)
    updateStatusTimer()
    scrollToBottom()
  } catch (error) {
    console.error('Error loading messages:', error)
    snackbar.notify({
      text: 'Ошибка загрузки сообщений',
      color: 'error'
    })
  }
  if (smAndDown.value) {
    isLeftSidebarOpen.value = false
  }
}

// Pusher setup
const setupPusher = (chatId) => {
  if (pusher) {
    channel?.unsubscribe()
    pusher.disconnect()
  }
  pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    encrypted: true
  })
  channel = pusher.subscribe(`chat-${chatId}`)
  channel.bind('MessageSent', (data) => {
    messages.value.push(data)
    nextTick(() => scrollToBottom())
  })
}

// Cleanup Pusher
onUnmounted(() => {
  if (channel) {
    channel.unsubscribe()
  }
  if (pusher) {
    pusher.disconnect()
  }
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

// Scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    const scrollEl = chatLogPS.value?.$el || chatLogPS.value
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight
    }
  })
}

// Send message (with file support)
// To send a file: Click the attachment icon, select file(s) (.jpeg, .png, .jpg, .gif), and click the send icon or press Enter.
const sendMessage = async () => {
  if (!messageInput.value.trim() && !fileInput.value?.files?.length) return

  const formData = new FormData()
  formData.append('text', messageInput.value)
  if (fileInput.value?.files?.length) {
    Array.from(fileInput.value.files).forEach(file => {
      formData.append('files[]', file)
    })
  }
  console.log('Sending FormData:', {
    text: messageInput.value,
    files: fileInput.value?.files ? Array.from(fileInput.value.files).map(f => f.name) : []
  })

  try {
    await api.chat.sendMessage(activeChat.value.id, formData)
    messageInput.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    scrollToBottom()
  } catch (error) {
    console.error('Error sending message:', error)
    snackbar.notify({
      text: error.response?._data?.message || 'Ошибка отправки файла или сообщения',
      color: 'error'
    })
  }
}

// Approve file
const approveFile = async (fileId) => {
  try {
    const response = await api.chat.approveFile(activeChat.value.id, fileId)
    if (response.buyback) {
      activeChat.value.status = response.buyback.status
      updateStatusTimer()
    }
    if (response.message) {
      messages.value.push(response.message)
      scrollToBottom()
    }
    snackbar.notify({
      text: 'Файл подтвержден',
      color: 'success'
    })
  } catch (error) {
    console.error('Error approving file:', error)
    snackbar.notify({
      text: error.response?._data?.message || 'Ошибка подтверждения файла',
      color: 'error'
    })
  }
}

// Reject file
const rejectFile = async (fileId) => {
  try {
    const response = await api.chat.rejectFile(activeChat.value.id, fileId)
    if (response.buyback) {
      activeChat.value.status = response.buyback.status
      updateStatusTimer()
    }
    if (response.message) {
      messages.value.push(response.message)
      scrollToBottom()
    }
    snackbar.notify({
      text: 'Файл отклонен',
      color: 'success'
    })
  } catch (error) {
    console.error('Error rejecting file:', error)
    snackbar.notify({
      text: error.response?._data?.message || 'Ошибка отклонения файла',
      color: 'error'
    })
  }
}

// Status message and timer
const statusMessages = {
  cancelled: 'Отменен',
  order_expired: 'Покупатель не успел сделать заказ в установленный срок',
  pending: 'Ожидание заказа',
  awaiting_receipt: 'Ожидание получения',
  on_confirmation: 'На подтверждении',
  cashback_received: 'Кэшбек в размере {price}₽ был зачислен на баланс покупателя',
  completed: 'Завершено',
  archive: 'Архив'
}

const updateStatusTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  timer.value = ''
  if (!activeChat.value) {
    console.log('Timer skipped: No active chat')
    return
  }

  const status = activeChat.value.status
  const startTime = activeChat.value.updated_at || activeChat.value.created_at || new Date().toISOString()
  console.log('Timer debug:', {
    status,
    startTime,
    updated_at: activeChat.value.updated_at,
    created_at: activeChat.value.created_at,
    timer: timer.value,
    statusMessage: statusMessages[status]
  })

  if (!['pending', 'awaiting_receipt', 'on_confirmation'].includes(status)) {
    console.log('Timer skipped: Status not timed', { status })
    return
  }

  const start = new Date(startTime).getTime()
  if (isNaN(start)) {
    console.error('Invalid start time:', startTime)
    return
  }

  let duration
  if (status === 'pending') {
    duration = 30 * 60 * 1000 // 30 minutes
  } else if (status === 'awaiting_receipt') {
    duration = 10 * 24 * 60 * 60 * 1000 // 10 days
  } else if (status === 'on_confirmation') {
    duration = 72 * 60 * 60 * 1000 // 72 hours
  }

  const update = () => {
    const now = Date.now()
    const remaining = start + duration - now
    if (remaining <= 0) {
      timer.value = 'Истек'
      clearInterval(timerInterval.value)
      console.log('Timer expired:', timer.value)
      return
    }
    const seconds = Math.floor((remaining / 1000) % 60)
    const minutes = Math.floor((remaining / (1000 * 60)) % 60)
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    if (days > 0) {
      timer.value = `${days} д ${hours} ч ${minutes} м`
    } else if (hours > 0) {
      timer.value = `${hours} ч ${minutes} м ${seconds} с`
    } else {
      timer.value = `${minutes} м ${seconds} с`
    }
    console.log('Timer updated:', timer.value)
  }

  update()
  timerInterval.value = setInterval(update, 1000)
}

// Computed status message
const statusMessage = computed(() => {
  if (!activeChat.value) return ''
  const status = activeChat.value.status
  let message = statusMessages[status] || ''
  if (status === 'cashback_received') {
    message = message.replace('{price}', activeChat.value.price)
  }
  return message
})

// Open image modal (for message files only)
const openImage = (url) => {
  selectedImage.value = url || 'https://via.placeholder.com/48'
  imageModal.value = true
}

// Redirect to user profile
const goToUserProfile = (userId) => {
  router.push(`/users/${userId}`)
}

// Redirect to product page
const goToProduct = (adsId) => {
  router.push(`/products/${adsId}`)
}

// Left sidebar state
const isLeftSidebarOpen = ref(true)
</script>

<template>
  <div class="chats-container">
    <div class="content-wrapper">
      <h1 class="text-h4 mb-2">Чаты</h1>
      <p class="text-body-1 mb-8">Общайтесь с покупателями и управляйте заказами</p>

      <v-row>
        <!-- Left Sidebar: Status Dropdown and Chats -->
        <v-col cols="12" md="4">
          <v-card class="chat-list-sidebar pa-4" min-height="600">
            <h2 class="text-h6 mb-4">Чаты</h2>
            <v-select
              v-model="selectedStatus"
              :items="statuses"
              item-title="title"
              item-value="slug"
              label="Статус"
              variant="outlined"
              density="compact"
              @update:model-value="selectStatus"
            >
              <template v-slot:selection="{ item }">
                <span>{{ item.title }}</span>
                <v-badge
                  v-if="item.raw.not_read"
                  :content="item.raw.not_read"
                  color="error"
                  inline
                  class="ml-2"
                />
              </template>
            </v-select>
            <v-divider class="my-4" />
            <v-progress-circular
              v-if="loadingChats"
              indeterminate
              color="primary"
              class="d-block mx-auto"
            />
            <v-list v-else>
              <v-list-item
                v-for="chat in chatsByStatus[selectedStatus] || []"
                :key="chat.id"
                :class="{ 'bg-light-primary': activeChat?.id === chat.id }"
                @click="selectChat(chat)"
              >
                <v-list-item-title>
                  {{ chat.ad.name }}
                  <v-badge
                    v-if="chat.messages.some(m => !m.is_read && m.whoSend === 'buyer')"
                    content="!"
                    color="error"
                    inline
                  />
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ chat.user.name }} ({{ statusMessages[chat.status] || chat.status }})
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Main Content: Active Chat -->
        <v-col cols="12" md="8">
          <v-card class="chat-content pa-6" min-height="600">
            <div v-if="activeChat" class="d-flex flex-column h-100">
              <!-- Chat Header -->
              <div class="chat-header mb-4">
                <div class="d-flex align-center mb-2">
                  <v-avatar size="48" class="mr-2 cursor-pointer" @click="goToUserProfile(activeChat.user.id)">
                    <v-img
                      v-if="activeChat.user.avatar"
                      :src="activeChat.user.avatar"
                      :alt="activeChat.user.name"
                    />
                    <span v-else>{{ activeChat.user.name[0] }}</span>
                  </v-avatar>
                  <v-avatar size="48" class="mr-2 cursor-pointer" @click="goToProduct(activeChat.ad.id)">
                    <v-img
                      :src="activeChat.ad.product.images[0] || 'https://via.placeholder.com/48'"
                      :alt="activeChat.ad.name"
                    />
                  </v-avatar>
                  <div>
                    <h3 class="text-h6">{{ activeChat.user.name }}</h3>
                    <p class="text-body-2">{{ activeChat.ad.name }}</p>
                  </div>
                </div>
                <v-alert
                  :type="['cancelled', 'order_expired'].includes(activeChat.status) ? 'error' : 'info'"
                  class="status-alert"
                >
                  {{ statusMessage }}
                  <span v-if="timer" class="timer ml-2">{{ timer }}</span>
                  <span v-else-if="activeChat.status === 'pending'" class="timer ml-2 text-warning">
                    Ожидание таймера...
                  </span>
                </v-alert>
              </div>

              <!-- Chat Log or No Messages -->
              <div class="flex-grow-1 d-flex flex-column">
                <PerfectScrollbar
                  v-if="messages.length"
                  ref="chatLogPS"
                  tag="ul"
                  :options="{ wheelPropagation: false }"
                  class="flex-grow-1 chat-log"
                >
                  <li
                    v-for="message in messages"
                    :key="message.id"
                    :class="{
                      'd-flex flex-column align-end': message.sender_id === currentUser?.id,
                      'd-flex flex-column align-start': message.sender_id !== currentUser?.id
                    }"
                    class="mb-4"
                  >
                    <div
                      :style="{
                        backgroundColor: message.sender_id === currentUser?.id ? message.color : '#f5f5f5',
                        color: message.sender_id === currentUser?.id ? 'white' : 'black',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        maxWidth: '70%'
                      }"
                    >
                      <span v-if="message.text">{{ message.text }}</span>
                      <v-img
                        v-if="message.file"
                        :src="message.file"
                        max-width="200"
                        class="mt-2 cursor-pointer"
                        @click="openImage(message.file)"
                      />
                      <div
                        v-if="message.file && message.whoSend === 'buyer' && activeChat.status === 'on_confirmation'"
                        class="mt-2"
                      >
                        <v-btn
                          color="success"
                          size="small"
                          class="mr-2"
                          @click="approveFile(message.id)"
                        >
                          Подтвердить
                        </v-btn>
                        <v-btn
                          color="error"
                          size="small"
                          @click="rejectFile(message.id)"
                        >
                          Отклонить
                        </v-btn>
                      </div>
                    </div>
                    <span class="text-caption text-disabled mt-1">
                      {{ new Date(message.created_at).toLocaleTimeString('ru-RU') }}
                    </span>
                  </li>
                </PerfectScrollbar>
                <div v-else class="flex-grow-1 d-flex align-center justify-center">
                  <p class="text-disabled">Нет сообщений</p>
                </div>

                <!-- Message Input -->
                <v-form @submit.prevent="sendMessage" class="mt-4">
                  <v-text-field
                    v-model="messageInput"
                    placeholder="Введите сообщение..."
                    variant="solo"
                    density="default"
                    append-inner-icon="ri-send-plane-line"
                    @click:append-inner="sendMessage"
                  >
                    <template #prepend-inner>
                      <v-tooltip text="Прикрепить файл (.jpeg, .png, .jpg, .gif)">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            icon
                            size="small"
                            v-bind="props"
                            @click="fileInput.click()"
                          >
                            <v-icon icon="ri-attachment-2" />
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".jpeg,.png,.jpg,.gif"
                    multiple
                    hidden
                  />
                </v-form>
              </div>
            </div>
            <div v-else class="d-flex h-100 align-center justify-center flex-column">
              <v-avatar size="98" variant="tonal" color="primary" class="mb-4">
                <v-icon size="50" icon="ri-wechat-line" />
              </v-avatar>
              <p class="text-center text-disabled">
                Выберите чат для начала общения
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Image Modal (for message files only) -->
      <v-dialog v-model="imageModal" max-width="800">
        <v-card>
          <v-img :src="selectedImage" contain max-height="600" />
          <v-card-actions>
            <v-spacer />
            <v-btn color="secondary" @click="imageModal = false">Закрыть</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chats-container {
  padding: 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.chat-list-sidebar {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chat-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.chat-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}

.status-alert {
  font-size: 0.875rem;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.timer {
  font-weight: 500;
  color: #d81b60;
}

.text-warning {
  color: #ff9800;
}

.chat-log {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

.bg-light-primary {
  background-color: rgba(25, 118, 210, 0.1);
}

.bg-primary {
  background-color: #1976d2 !important;
}
</style>
