<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useSnackbarStore } from '@/stores/snackbar'
import { useDisplay } from 'vuetify'
import { useRoute, useRouter } from 'vue-router'
import Pusher from 'pusher-js'
import api from '@/api/Index'

// Page metadata
definePage({ meta: { layoutWrapperClasses: 'layout-content-height-fixed', authRequired: true } })

// Dependencies
const snackbar = useSnackbarStore()
const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()

const lastSeen = ref('')

// Функция для форматирования времени
function formatLastSeen(dateString) {
  if (!dateString) return 'давно' // Если даты нет

  const now = new Date()
  const _lastSeen = new Date(dateString)
  const diffInSeconds = Math.floor((now - _lastSeen) / 1000)

  // Форматируем разницу
  if (diffInSeconds < 60) {
    return 'только что';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин назад`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${getHoursWord(diffInHours)} назад`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) {
    return 'вчера'
  }

  if (diffInDays < 7) {
    return `${diffInDays} ${getDaysWord(diffInDays)} назад`
  }

  return 'давно'
}

// Склонение слова "час"
function getHoursWord(hours) {
  if (hours % 10 === 1 && hours % 100 !== 11) return 'час'
  if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) return 'часа'
  return 'часов'
}

// Склонение слова "день"
function getDaysWord(days) {
  if (days % 10 === 1 && days % 100 !== 11) return 'день'
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня'
  return 'дней'
}

// State
const currentUser = ref(null)
const statuses = ref([])
const chatsByStatus = ref({})
const selectedStatus = ref('all')
const loadingStatuses = ref(true)
const loadingChats = ref(false)
const activeChat = ref(null)
const messages = ref([])
const chatLogPS = ref()
const messageInput = ref('')
const fileInput = ref(null)
const imageModal = ref(false)
const selectedImage = ref('')
const timer = ref('')
const timerInterval = ref(null)
const isLeftSidebarOpen = ref(true)
const isRejectVisible = ref(false)
const chatId = ref('')
const fileId = ref('')
const comment = ref('')
const reviewText = ref('')
const reviewRating = ref(null)
const reviewSend = ref(false)
const isMobile = ref(window.innerWidth < 960)

// Pusher instance
let pusher = null
let channel = null

// Utility: Buyback declension
const getBuybackDeclension = (count) => {
  const num = Math.abs(count)
  if (num % 10 === 1 && num % 100 !== 11) return 'выкуп'
  if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'выкупа'
  return 'выкупов'
}

// Composable: Chat Management
const useChat = () => {
  const fetchChats = async () => {
    loadingChats.value = true
    try {
      const response = await api.chat.getChatList(selectedStatus.value)
      chatsByStatus.value[selectedStatus.value] = response || []
    } catch (error) {
      console.error('Error fetching chats:', error)
      snackbar.notify({ text: 'Ошибка загрузки чатов', color: 'error' })
    } finally {
      loadingChats.value = false
    }
  }

  const selectStatus = async (status) => {
    selectedStatus.value = status
    if (!chatsByStatus.value[status]) await fetchChats()
  }

  const selectChat = async (chat) => {
    activeChat.value = chat
    messages.value = []
    try {
      const lastSeenResponse = await api.chat.lastSeen(chat.id)
      lastSeen.value = lastSeenResponse.seller
      console.log(lastSeenResponse)

      const response = await api.chat.getMessages(chat.id)
      messages.value = response.data || []
      setupPusher(chat.id)
      updateStatusTimer()
      scrollToBottom()
    } catch (error) {
      console.error('Error loading messages:', error)
      snackbar.notify({ text: 'Ошибка загрузки сообщений', color: 'error' })
    }
    if (smAndDown.value) isLeftSidebarOpen.value = false
  }

  return { fetchChats, selectStatus, selectChat }
}

// Composable: Pusher Management
const usePusher = () => {
  const setupPusher = (chatId) => {
    if (channel) channel.unsubscribe()
    channel = pusher.subscribe(`chat-${chatId}`)
    channel.bind('MessageSent', (data) => {
      // Prevent duplicate messages
      if (!messages.value.some(msg => msg.id === data.id)) {
        messages.value.push(data)
        nextTick(() => scrollToBottom())
      }
    })
  }

  const cleanupPusher = () => {
    if (channel) channel.unsubscribe()
    if (pusher) pusher.disconnect()
  }

  return { setupPusher, cleanupPusher }
}

// Composable: Timer Management
const useTimer = () => {
  const updateStatusTimer = () => {
    if (timerInterval.value) clearInterval(timerInterval.value)
    timer.value = ''
    if (!activeChat.value) return

    const status = activeChat.value.status
    // const startTime = activeChat.value.updated_at || activeChat.value.created_at || new Date().toISOString()
    const startTime = activeChat.value.updated_at || activeChat.value.created_at
    if (!['pending', 'awaiting_receipt', 'on_confirmation'].includes(status)) return

    const start = new Date(startTime).getTime()
    if (isNaN(start)) return

    const durations = { pending: 30 * 60 * 1000, awaiting_receipt: 10 * 24 * 60 * 60 * 1000, on_confirmation: 24 * 60 * 60 * 1000 }
    const duration = durations[status]

    const update = () => {
      const remaining = start + duration - Date.now()
      if (remaining <= 0) {
        timer.value = 'Истек'
        clearInterval(timerInterval.value)
        return
      }
      const seconds = Math.floor((remaining / 1000) % 60)
      const minutes = Math.floor((remaining / (1000 * 60)) % 60)
      const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
      timer.value = days > 0 ? `${days} д ${hours} ч ${minutes} м` : hours > 0 ? `${hours} ч ${minutes} м ${seconds} с` : `${minutes} м ${seconds} с`
    }

    update()
    timerInterval.value = setInterval(update, 1000)
  }

  return { updateStatusTimer }
}

// Composable: Message Management
const useMessages = () => {
  const scrollToBottom = () => {
    nextTick(() => {
      const scrollEl = chatLogPS.value?.$el || chatLogPS.value
      if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight
    })
  }

  const sendMessage = async () => {
    if (!messageInput.value.trim() && !fileInput.value?.files?.length) return

    try {
      const formData = new FormData()
      formData.append('message', messageInput.value)
      if (fileInput.value?.files?.length) {
        Array.from(fileInput.value.files).forEach(file => formData.append('files[]', file))
      }
      await api.chat.sendMessage(activeChat.value.id, formData)
      messageInput.value = ''
      if (fileInput.value) fileInput.value.value = ''
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      snackbar.notify({
        text: error.response?._data?.message || 'Ошибка отправки сообщения или файла',
        color: 'error'
      })
    }
  }

  return { scrollToBottom, sendMessage }
}

// Composable: File Management
const useFiles = () => {
  const approveFile = async (chatIdValue, fileIdValue) => {
    try {
      const response = await api.buyback.approvePhoto(chatIdValue, fileIdValue)
      if (response.buyback) {
        activeChat.value.status = response.buyback.status
        updateStatusTimer()
      }
      if (response.message) {
        if (!messages.value.some(msg => msg.id === response.message.id)) {
          messages.value.push(response.message)
          scrollToBottom()
        }
      }
      const chat = await api.buyback.getBuybackById(chatIdValue)
      if (chat) selectChat(chat)
      snackbar.notify({ text: 'Файл подтвержден', color: 'success' })
    } catch (error) {
      console.error('Error approving file:', error)
      snackbar.notify({
        text: error.response?._data?.message || 'Ошибка подтверждения файла',
        color: 'error'
      })
    }
  }

  // Сделать отдельный route, что бы он был с комментом!
  const rejectFile = async () => {
    try {
      const response = await api.buyback.cancelOrder(chatId.value, comment.value)
      if (response.buyback) {
        activeChat.value.status = response.system_type
        updateStatusTimer()
      }
      const chat = await api.buyback.getBuybackById(chatId.value)
      if (chat) selectChat(chat)
      snackbar.notify({ text: 'Выкуп отменен', color: 'success' })
      resetForm()
    } catch (error) {
      console.error('Error rejecting file:', error)
      snackbar.notify({
        text: error.response?._data?.message || 'Ошибка отмены выкупа',
        color: 'error'
      })
    }
  }

  const openRejectModal = (chatIdValue, fileIdValue) => {
    isRejectVisible.value = true
    chatId.value = chatIdValue
    fileId.value = fileIdValue
  }

  const resetForm = () => {
    chatId.value = ''
    fileId.value = ''
    comment.value = ''
    isRejectVisible.value = false
  }

  return { approveFile, rejectFile, openRejectModal, resetForm }
}

// Composable: Review Management
const useReviews = () => {
  const submitReview = async () => {
    if (!reviewText.value.trim() || reviewRating.value == null) return
    try {
      await api.reviews.storeReview(activeChat.value.id, reviewText.value, reviewRating.value)
      reviewText.value = ''
      reviewRating.value = null
      reviewSend.value = true
      snackbar.notify({ text: 'Отзыв отправлен', color: 'success' })
      selectChat(activeChat.value)
      scrollToBottom()
    } catch (error) {
      console.error('Error submitting review:', error)
      snackbar.notify({
        text: error.response?._data?.message || 'Ошибка отправки отзыва',
        color: 'error'
      })
    }
  }

  return { submitReview }
}

// Initialize composables
const { fetchChats, selectStatus, selectChat } = useChat()
const { setupPusher, cleanupPusher } = usePusher()
const { updateStatusTimer } = useTimer()
const { scrollToBottom, sendMessage } = useMessages()
const { approveFile, rejectFile, openRejectModal, resetForm } = useFiles()
const { submitReview } = useReviews()


const statusMessages = {
  cancelled: 'Заказ отменен',
  order_expired: 'Срок для размещения заказа истек',
  pending: 'Ожидание заказа',
  awaiting_receipt: 'Ожидание получения товара',
  on_confirmation: 'На подтверждении',
  cashback_received: 'Кэшбек отправлен',
  completed: 'Заказ завершен',
  archive: 'В архиве'
}

const statusMessage = computed(() => {
  if (!activeChat.value) return ''
  let message = statusMessages[activeChat.value.status] || ''
  if (activeChat.value.status === 'cashback_received') message = message.replace('{price}', activeChat.value.price)
  return message
})

const step = computed(() => {
  if (!activeChat.value) return ''
  if(activeChat.value.status === 'pending'){
    return 1
  }else if(activeChat.value.status === 'awaiting_receipt'){
    return 2
  }else if(activeChat.value.status === 'on_confirmation'){
    return 3
  }else if (activeChat.value.status === 'cashback_received'){
    return 4
  }else if (activeChat.value.status === 'completed'){
    return 5
  }else if (activeChat.value.status === 'order_expired'){
    return 5
  }

  return ''
})

const alertType = computed(() => {
  if (!activeChat.value) return ''
  if(activeChat.value.status === 'pending'){
    return 'primary'
  }else if(activeChat.value.status === 'awaiting_receipt'){
    return 'info'
  }else if(activeChat.value.status === 'on_confirmation'){
    return 'danger'
  }else if (activeChat.value.status === 'cashback_received'){
    return 'success'
  }else if (activeChat.value.status === 'completed'){
    return 'success'
  }else if (activeChat.value.status === 'cancelled'){
    return 'secondary'
  }

  return ''
})

// Computed: UI visibility
const shouldShowChatList = computed(() => (isMobile.value && !activeChat.value) || !isMobile.value)
const shouldShowMessages = computed(() => (isMobile.value && activeChat.value) || !isMobile.value)

// Navigation
const goToUserProfile = (userId) => router.push(`/users/${userId}`)
const goToProduct = (adsId) => router.push(`/products/${adsId}`)
const openImage = (url) => {
  selectedImage.value = url || 'https://via.placeholder.com/48'
  imageModal.value = true
}
const backToChats = () => {
  activeChat.value = null
  messages.value = []
}

// Lifecycle: Initialize
onMounted(async () => {
  try {
    currentUser.value = await api.user.profile()
    statuses.value = (await api.chat.getStatusList()) || []
    await fetchChats()

    // Load chat by ID from query
    const chatId = route.query.chatId
    if (chatId) {
      const chat = await api.buyback.getBuybackById(chatId)
      if (chat) selectChat(chat)
      else console.warn(`Чат с id=${chatId} не найден.`)
    }

    // Initialize Pusher
    pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true
    })
    const notificationChannel = pusher.subscribe(`notification-${currentUser.value.id}`)
    notificationChannel.bind('MessageSent', async () => await fetchChats())
  } catch (error) {
    console.error('Error initializing:', error)
    snackbar.notify({ text: 'Ошибка загрузки данных', color: 'error' })
  } finally {
    loadingStatuses.value = false
  }
})

// Lifecycle: Cleanup
onUnmounted(() => {
  cleanupPusher()
  if (timerInterval.value) clearInterval(timerInterval.value)
})

const pendingScreen = ref(null)
const showUploadScreen = ref(true)
const uploadScreen = async () => {
  const response = await api.buyback.sendScreen(activeChat.value.id, pendingScreen.value);
  snackbar.notify({ text: 'Скриншот заказа отправлен', color: 'success' })
  await selectChat(activeChat.value)
  showUploadScreen.value = false
}

function openSupport() {
  // Логика перехода или вызова окна поддержки
  router.push('/dashboard/support')
}

function cancelOrder() {
  isRejectVisible.value = true
}
</script>

<template>
  <div class="chats-container">
    <div class="content-wrapper">
      <v-row>
        <!-- Left Sidebar: Status Dropdown and Chats -->
        <v-col cols="12" md="4" v-if="shouldShowChatList">
          <v-card class="chat-list-sidebar pa-4" min-height="80vh">
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
                class="border-b-sm d-flex"
                @click="selectChat(chat)"
              >
                <template v-slot:prepend>
                  <v-avatar size="50" class="mr-2">
                    <v-img :src="chat?.ad?.product?.images[0] || 'https://via.placeholder.com/50'" />
                  </v-avatar>
                </template>
                <v-list-item-title>
                  {{ chat?.user?.name }} ({{ statusMessages[chat.status] || chat.status }})
                  <v-badge
                    v-if="chat.messages.some(m => !m.is_read && m.whoSend === 'buyer')"
                    content="!"
                    color="error"
                    inline
                  />
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ chat?.ad?.product?.name }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <!-- Main Content: Active Chat -->
        <v-col class="messages-block" v-if="shouldShowMessages" cols="12" md="8">
          <v-btn
            v-if="shouldShowMessages && isMobile"
            size="small"
            @click="backToChats"
            variant="outlined"
            class="mb-3 back-btn"
            prepend-icon="ri-arrow-left-line"
          >
            Вернуться назад
          </v-btn>
          <v-card class="chat-content pa-6" min-height="80vh">
            <div v-if="activeChat" class="d-flex flex-column h-100">
              <!-- Chat Header -->
              <div class="chat-header mb-4">
                <div class="d-flex justify-between align-center mb-2">
                  <div class="d-flex align-center">
                    <v-avatar size="48" class="mr-2 cursor-pointer" color="primary" @click="goToUserProfile(activeChat.user.id)">
                      <v-img v-if="activeChat.user.avatar" :src="activeChat.user.avatar" :alt="activeChat.user.name" />
                      <span v-else>{{ activeChat.user.name[0] }}</span>
                    </v-avatar>
                    <v-avatar size="48" class="mr-2 cursor-pointer" @click="goToProduct(activeChat.ad.id)" style="position: relative; left: -20px;">
                      <v-img :src="activeChat.ad.product.images[0] || 'https://via.placeholder.com/48'" :alt="activeChat.ad.name" />
                    </v-avatar>
                    <div>
                      <h3 class="text-h6">{{ activeChat.ad.product.name }}</h3>
                      <p class="text-body-2">{{ activeChat.user.name }}</p>
                      <span class="text-body-2 text-secondary">Был в сети {{formatLastSeen(lastSeen)}}</span>
                    </div>
                  </div>
                  <v-menu offset-y>
                    <template #activator="{ props }">
                      <v-btn type="info" variant="outlined" icon v-bind="props">
                        <v-icon>ri-more-fill</v-icon>
                      </v-btn>
                    </template>

                    <v-list>
                      <v-list-item @click="openSupport">
                        <v-list-item-title>Поддержка</v-list-item-title>
                      </v-list-item>

                      <v-list-item @click="cancelOrder">
                        <v-list-item-title>Отменить заказ</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <v-alert
                  :type="alertType"
                  class="status-alert" :icon="false"
                >
                  {{ statusMessage }}
                  <span v-if="timer" class="timer ml-2">{{ timer }}</span>
                  <span v-else-if="activeChat.status === 'pending'" class="timer ml-2 text-warning">
                    Ожидание таймера...
                  </span>
                </v-alert>
              </div>

              <!-- Chat Log -->
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
                    :key="`msg-${message.id}-${message.created_at}`"
                    :class="{
                      'd-flex flex-column align-end': message.sender_id === currentUser?.id,
                      'd-flex flex-column align-start': message.sender_id !== currentUser?.id
                    }"
                    class="mb-4"
                  >
                     <span class="w-100 text-caption text-center text-disabled mb-2" v-if="message.hide_for != 'seller'">
                        {{
                         new Date(message.created_at).toLocaleDateString('ru-RU', {
                           day: '2-digit',
                           month: '2-digit',
                           year: 'numeric'
                         })
                       }} в {{
                         new Date(message.created_at).toLocaleTimeString('ru-RU', {
                           hour: '2-digit',
                           minute: '2-digit'
                         })
                       }}
                      </span>

                    <div v-if="message.type != 'system' && message.system_type != 'success' && message.hide_for != 'seller'">
                      <span v-if="activeChat.ad.user_id != message.sender_id">{{activeChat.user?.name}}</span>
                      <span v-else>Вы</span>
                    </div>


                    <div v-if="message.type == 'system' && message.system_type == 'success' && message.hide_for != 'seller'" class="w-100 text-center d-flex justify-center">
                      <div class="success-msg">
                        {{message.text}}
                      </div>
                    </div>

                    <div v-else-if="message.type == 'system' && message.system_type == 'info' && message.hide_for != 'seller'" class="w-100 text-center d-flex justify-center">
                      <div class="info-msg">
                        {{message.text}}
                      </div>
                    </div>

                    <div v-else-if="message.type == 'system' && message.system_type == 'cancel' && message.hide_for != 'seller'" class="w-100 text-center d-flex justify-center">
                      <div class="cancel-msg">
                        {{message.text}}
                      </div>
                    </div>

                    <div
                      v-else-if="message.hide_for != 'seller'"
                      :style="{
                        backgroundColor: message.sender_id === currentUser?.id ? message.color || '#1976d2' : '#f5f5f5',
                        color: message.sender_id === currentUser?.id ? 'white' : 'black',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        maxWidth: '70%'
                      }"
                    >
                      <template v-if="message.system_type === 'review' && message.type === 'system' && activeChat.has_review_by_seller && activeChat.has_review_by_buyer">
                        <v-rating
                          v-model="message.color"
                          length="5"
                          size="32"
                          readonly
                          color="yellow darken-3"
                          background-color="grey lighten-2"
                          class="mb-4"
                          aria-label="Рейтинг"
                        />
                        <br>
                        {{message.text}}
                      </template>

                      <span v-if="message.text && message.system_type !== 'review' && message.type !== 'system'" v-html="message.text.replace(/\n/g, '<br>')"></span>
                      <template v-if="message.type === 'image'">
                        <span v-if="message.system_type === 'send_photo'">Заказ сделан</span>
                        <span v-if="message.system_type === 'review' && message.type === 'system' && activeChat.has_review_by_seller && activeChat.has_review_by_buyer">
                          {{ message.sender_id === currentUser.id ? 'Вы оставили отзыв' : 'Покупатель оставил отзыв' }}
                        </span>
                        <!-- Handle multiple files -->
                        <div v-for="(file, index) in message.files || (message.file ? [message.file] : [])" :key="`file-${message.id}-${index}`">
                          <v-img
                            :src="file.src || 'https://via.placeholder.com/50'"
                            max-width="200"
                            class="mt-2 cursor-pointer rounded"
                            @click="openImage(file.src)"
                            @error="console.error('Failed to load image:', file.src)"
                          />
                          <span v-if="file.status == null && activeChat.status === 'cashback_received'" class="mt-2 d-block">
                            Скриншот
                          </span>
                          <v-row v-else-if="file.status == null && activeChat.status !== 'cashback_received && ' && index === (message.files || (message.file ? [message.file] : [])).length - 1"  no-gutters class="mt-2">
                            <v-col>
                              <v-btn v-if="activeChat.status !== 'cancelled' && message.sender_id !== currentUser?.id" color="secondary" variant="outlined" @click="openRejectModal(message.buyback_id, file.id)" class="ml-2">Отклонить</v-btn>
                              <span v-else>Выкуп отменен</span>
                            </v-col>
                          </v-row>
                        </div>
                      </template>

                      <template v-else-if="activeChat.has_review_by_seller && !activeChat.has_review_by_buyer" class="success-msg">
                        <span>Покупатель еще не оставил отзыв о вас. Мы сообщим вам сразу же как покупатель напишет отзыв </span>
                      </template>

                      <template v-else-if="!activeChat.has_review_by_seller && activeChat.has_review_by_buyer" class="success-msg">
                        <span>Покупатель оставил о вас отзыв. Оставьте отзыв о покупателе, чтобы увидеть его отзыв </span>
                      </template>
                    </div>
                  </li>

                  <div v-if="activeChat.status === 'on_confirmation' && showUploadScreen" class="mt-4">
                    <v-card class="pa-4 mb-4" elevation="2" rounded="lg">
                      <v-card-title class="text-h6 d-flex align-center">
                        <v-icon icon="ri-image-line" class="mr-2" />
                        Загрузите скриншот перевода
                      </v-card-title>
                      <v-card-text>
                        <p class="text-body-2 mb-4">Загрузите скриншот перевода средств по указанным реквизитам</p>
                        <v-file-input
                          label="Выберите скриншот"
                          accept=".jpeg,.png,.jpg,.gif"
                          v-model="pendingScreen"
                          variant="outlined"
                          density="compact"
                          show-size
                          prepend-icon="ri-upload-cloud-line"
                          class="mb-4"
                          aria-label="Загрузить скриншот заказа"
                        />
                        <v-img v-if="pendingScreen" :src="pendingScreen" max-width="100" class="mb-4 rounded" cover />
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="primary" :disabled="!pendingScreen" @click="uploadScreen" class="px-4" rounded>Отправить</v-btn>
                        <v-btn color="error" @click="rejectFile" variant="outlined" class="px-4" rounded>Отменить заказ</v-btn>
                      </v-card-actions>
                    </v-card>
                  </div>

                  <!-- Review Form -->
                  <div
                    v-if="activeChat.status === 'cashback_received' && !activeChat.has_review_by_seller && !reviewSend"
                    class="mt-4"
                  >
                    <v-card class="pa-4" elevation="2" rounded="lg">
                      <v-card-title class="text-h6 d-flex align-center">
                        <v-icon icon="ri-star-line" class="mr-2" />
                        Оставьте отзыв
                      </v-card-title>
                      <v-card-text>
                        <p class="text-body-2 mb-4">Оставьте отзыв о покупателе, чтобы увидеть его отзыв о вас.</p>
                        <v-rating
                          v-model="reviewRating"
                          length="5"
                          size="32"
                          color="yellow darken-3"
                          background-color="grey lighten-2"
                          class="mb-4"
                          aria-label="Выберите рейтинг"
                        />
                        <v-textarea
                          v-model="reviewText"
                          label="Ваш отзыв"
                          variant="outlined"
                          density="compact"
                          class="mb-4"
                          aria-label="Оставить отзыв о покупателе"
                        />
                      </v-card-text>
                      <v-card-actions>
                        <v-btn
                          color="primary"
                          :disabled="!reviewText.trim() || reviewRating == null"
                          @click="submitReview"
                          class="px-4"
                          rounded
                        >
                          Отправить отзыв
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </div>
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
                          <v-btn icon size="small" v-bind="props" @click="fileInput.click()">
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
                    @change="sendMessage"
                  />
                </v-form>
              </div>
            </div>
            <div v-else class="d-flex h-100 align-center justify-center flex-column">
              <v-avatar size="98" variant="tonal" color="primary" class="mb-4">
                <v-icon size="50" icon="ri-wechat-line" />
              </v-avatar>
              <p class="text-center text-disabled">Выберите чат для начала общения</p>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Image Modal -->
      <v-dialog v-model="imageModal" max-width="800">
        <v-card>
          <v-img :src="selectedImage" contain max-height="600" />
          <v-card-actions>
            <v-spacer />
            <v-btn color="secondary" @click="imageModal = false">Закрыть</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Reject Modal -->
      <v-dialog v-model="isRejectVisible" max-width="500">
        <v-card title="Отклонение подтверждения">
          <v-card-text>
            <span>
              Пожалуйста, напишите комментарий к вашему решению, чтобы покупатель смог исправить ошибки.
              <br><br>
Заказ будет отменен, а выкуп возвращен на баланс объявления
            </span>
            <v-textarea class="mt-5" label="Комментарий" v-model="comment" placeholder="Укажите причину" variant="outlined" />
            <v-btn color="error" @click="rejectFile" class="w-100 mt-4">Отклонить</v-btn>
            <v-btn color="secondary" variant="outlined" @click="resetForm()" class="w-100 mt-2">Назад</v-btn>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<style>
.layout-page-content {
  overflow: visible !important;
}

@media screen and (max-width: 960px) {
  .layout-page-content {
    margin-top: -30px;
  }
  html {
    overflow: hidden !important;
  }
}

.footer {
  display: none;
}
</style>

<style scoped lang="scss">
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.chat-list-sidebar,
.chat-content {
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
  justify-content: center;
}

.text-warning {
  color: #ff9800;
}

.chat-log {
  max-height: 50vh;
  overflow-y: auto;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

.bg-light-primary {
  background-color: rgba(25, 118, 210, 0.1);
}

.chats-container {
  overflow-y: hidden !important;
}

@media screen and (max-width: 960px) {
  .chats-container {
    overflow-x: auto !important;
  }
  .content-wrapper {
    overflow: hidden;
  }
  .chat-content {
    padding-top: 10px !important;
    min-height: 85vh !important;
  }
  .chat-list-sidebar {
    min-height: 91vh !important;
  }
  .chat-log {
    min-height: 60vh !important;
  }
}

@media screen and (max-width: 600px){
  .back-btn{
    margin-top: 30px;
    margin-left: 20px;
  }
}

.msg-alert-text{
  color: #000;
  padding: 5px;
}

.success-msg{
  background: #D1FADF;
  padding: 10px 35px;
  border-radius: 15px;
  margin-bottom: 30px;
  color: #000000cc!important;
}

.info-msg{
  background: #D1D7FA;
  border-radius: 15px;
  color: #000000!important;
  max-width: 70%;
  padding: 10px 35px;
}

.cancel-msg{
  background: #FEE4E2;
  border-radius: 15px;
  color: #000000!important;
  max-width: 70%;
  padding: 10px 35px;
}
.justify-between{
  justify-content: space-between;
}
</style>

<style>
.status-alert .v-alert__content{
  background: #fff;
  border-radius: 30px;
  padding: 5px;
  color: #000;
}
</style>
