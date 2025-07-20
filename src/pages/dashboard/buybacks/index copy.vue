<script setup>
import api from '@/api/index.js'
import { useSnackbarStore } from '@/stores/snackbar.js'
import Pusher from 'pusher-js'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useDisplay } from 'vuetify'

definePage({ meta: { layoutWrapperClasses: 'layout-content-height-fixed', authRequired: true } })

const snackbar = useSnackbarStore()
const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()

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
const pendingFile = ref(null)
const barcodeFile = ref(null)
const reviewFile = ref(null)
const reviewText = ref('')
const pendingPreview = ref(null)
const barcodePreview = ref(null)
const reviewPreview = ref(null)
const imageModal = ref(false)
const selectedImage = ref('')
const timer = ref('')
const timerInterval = ref(null)
const isLeftSidebarOpen = ref(true)
const isMobile = ref(window.innerWidth < 960)
const showBarcode = ref(false)
const showOrderForm = ref(false)
const orderSend = ref(false)
const receiptSent = ref(false)
const reviewRating = ref(null)
const sendReview = ref(false)
const confirmModal = ref(false)
const cancelItem = ref(false)

let pusher = null
let channel = null

const lastSeen = ref('')

// Функция для форматирования времени
function formatLastSeen(dateString) {
  if (!dateString) return 'давно' // Если даты нет

  const now = new Date()
  const lastSeen = new Date(dateString)
  const diffInSeconds = Math.floor((now - lastSeen) / 1000)

  // Форматируем разницу
  if (diffInSeconds < 60) {
    return 'только что'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} мин`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} ${getHoursWord(diffInHours)}`
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

///
function formatDate(input) {
  if (!input) return ''

  const date = new Date(input)
  if (isNaN(date)) return 'Неверная дата'

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const diffDays = Math.floor((today - target) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'вчера'
  } else {
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
}

const getBuybackDeclension = count => {
  const num = Math.abs(count)
  if (num % 10 === 1 && num % 100 !== 11) return 'выкуп'
  if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'выкупа'
  
  return 'выкупов'
}

const useChat = () => {
  const fetchChats = async () => {
    loadingChats.value = true
    try {
      chatsByStatus.value[selectedStatus.value] = (await api.chat.getChatList(selectedStatus.value)) || []
    } catch (error) {
      console.error('Error fetching chats:', error)
      snackbar.notify({ text: 'Ошибка загрузки чатов', color: 'error' })
    } finally {
      loadingChats.value = false
    }
  }

  const selectStatus = async status => {
    selectedStatus.value = status
    if (!chatsByStatus.value[status]) await fetchChats()
  }

  const selectChat = async chat => {
    activeChat.value = chat
    messages.value = []
    try {
      const lastSeenResponse = await api.chat.lastSeen(chat.id)

      lastSeen.value = lastSeenResponse.buyer

      const response = await api.chat.getMessages(chat.id)

      messages.value = response.data?.data || response.data || []
      setupPusher(chat.id)
      updateStatusTimer()
      scrollToBottom()
      console.log(activeChat.value.messages.filter(m => m.type === 'image'))
    } catch (error) {
      console.error('Error loading messages:', error)
      snackbar.notify({ text: 'Ошибка загрузки сообщений', color: 'error' })
    }
    if (smAndDown.value) isLeftSidebarOpen.value = false
  }

  return { fetchChats, selectStatus, selectChat }
}

const usePusher = () => {
  const setupPusher = chatId => {
    if (pusher) {
      channel?.unsubscribe()
      pusher.disconnect()
    }
    pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true,
    })
    channel = pusher.subscribe(`chat-${chatId}`)
    channel.bind('MessageSent', data => {
      const normalizedMessage = {
        ...data,
        files: data.files || (data.file ? [data.file] : []),
        type: data.type || 'text',
      }

      if (!messages.value.some(msg => msg.id === normalizedMessage.id)) {
        messages.value.push(normalizedMessage)
        if (normalizedMessage.type === 'system') refreshChat(chatId)
        nextTick(() => scrollToBottom())
      }
    })

    const notificationChannel = pusher.subscribe(`notification-${currentUser.value.id}`)

    notificationChannel.bind('MessageSent', () => refreshChat(chatId))
  }

  const refreshChat = async chatId => {
    try {
      const chat = await api.buyback.getBuybackById(chatId)
      if (chat) {
        selectChat(chat)
        showBarcode.value = chat.status === 'awaiting_receipt' && !chat.is_review_photo_sent
        showOrderForm.value = chat.status === 'pending' && !chat.is_order_photo_sent
      }
    } catch (error) {
      console.error('Error refreshing chat:', error)
    }
  }

  const cleanupPusher = () => {
    channel?.unsubscribe()
    pusher?.disconnect()
  }

  return { setupPusher, cleanupPusher }
}

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
      if (fileInput.value?.files?.length) formData.append('file', fileInput.value.files[0])
      await api.chat.sendMessage(activeChat.value.id, messageInput.value, formData)
      messageInput.value = ''
      fileInput.value && (fileInput.value.value = '')
      await selectChat(activeChat.value)
    } catch (error) {
      console.error('Error sending message:', error)
      snackbar.notify({ text: error.response?._data?.message || 'Ошибка отправки сообщения', color: 'error' })
    }
  }

  return { scrollToBottom, sendMessage }
}

const useFiles = () => {
  const generatePreview = (file, previewRef) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()

      reader.onload = e => (previewRef.value = e.target.result)
      reader.readAsDataURL(file)
    } else {
      previewRef.value = null
    }
  }

  const uploadPendingFile = async () => {
    if (!pendingFile.value) return
    confirmModal.value = false
    try {      
      await api.chat.sendPhoto(activeChat.value.id, [pendingFile.value], 'send_photo')
      pendingFile.value = null
      pendingPreview.value = null
      orderSend.value = true
      snackbar.notify({ text: 'Скриншот заказа отправлен', color: 'success' })
      await selectChat(activeChat.value)      
    } catch (error) {
      console.error('Error uploading pending file:', error)
      snackbar.notify({ text: error.response?._data?.message || 'Ошибка отправки скриншота', color: 'error' })
    }
  }

  const uploadConfirmationFiles = async () => {
    if (!barcodeFile.value || !reviewFile.value) return

    try {
      await api.chat.sendPhoto(activeChat.value.id, [barcodeFile.value, reviewFile.value], 'review')
      barcodeFile.value = null
      reviewFile.value = null
      barcodePreview.value = null
      reviewPreview.value = null
      receiptSent.value = true
      showBarcode.value = false
      snackbar.notify({ text: 'Файлы отправлены', color: 'success' })
      await selectChat(activeChat.value)
    } catch (error) {
      console.error('Error uploading confirmation files:', error)
      snackbar.notify({ text: error.response?._data?.message || 'Ошибка отправки файлов', color: 'error' })
    }
  }

  return { generatePreview, uploadPendingFile, uploadConfirmationFiles }
}

const useReviews = () => {
  const submitReview = async () => {
    if (!reviewText.value.trim() || reviewRating.value == null) return

    try {
      await api.reviews.storeReview(activeChat.value.id, reviewText.value, reviewRating.value)
      reviewText.value = ''
      reviewRating.value = null
      sendReview.value = true
      snackbar.notify({ text: 'Отзыв отправлен', color: 'success' })
      await selectChat(activeChat.value)
      scrollToBottom()
    } catch (error) {
      console.error('Error submitting review:', error)
      snackbar.notify({ text: error.response?._data?.message || 'Ошибка отправки отзыва', color: 'error' })
    }
  }

  return { submitReview }
}

const useOrders = () => {
  const cancelOrder = async () => {
    cancelItem.value = false
    try {      
      await api.buyback.cancelOrder(activeChat.value.id)
      activeChat.value.status = 'cancelled'
      updateStatusTimer()
      snackbar.notify({ text: 'Заказ отменен', color: 'success' })
    } catch (error) {
      console.error('Error canceling order:', error)
      snackbar.notify({ text: error.response?._data?.message || 'Ошибка отмены заказа', color: 'error' })
    }
  }

  return { cancelOrder }
}

const { fetchChats, selectStatus, selectChat } = useChat()
const { setupPusher, cleanupPusher } = usePusher()
const { updateStatusTimer } = useTimer()
const { scrollToBottom, sendMessage } = useMessages()
const { generatePreview, uploadPendingFile, uploadConfirmationFiles } = useFiles()
const { submitReview } = useReviews()
const { cancelOrder } = useOrders()

const statusMessages = {
  cancelled: 'Заказ отменен',
  order_expired: 'Срок для размещения заказа истек',
  pending: 'Ожидание заказа',
  awaiting_receipt: 'Ожидание получения товара',
  on_confirmation: 'На подтверждении',
  cashback_received: 'Отправка кэшбека',
  completed: 'Заказ завершен',
  archive: 'В архиве',
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
  }else if (activeChat.value.status === 'cancelled'){
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

const shouldShowChatList = computed(() => (isMobile.value && !activeChat.value) || !isMobile.value)
const shouldShowMessages = computed(() => (isMobile.value && activeChat.value) || !isMobile.value)

const openImage = url => {
  selectedImage.value = url || 'https://via.placeholder.com/48'
  imageModal.value = true
}

const goToUserProfile = userId => router.push(`/users/${userId}`)
const goToProduct = adsId => router.push(`/products/${adsId}`)

const backToChats = () => {
  activeChat.value = null
  messages.value = []
}

onMounted(async () => {
  try {
    currentUser.value = await api.user.profile()
    statuses.value = (await api.chat.getStatusList()) || []
    await fetchChats()

    const chatId = route.query.chatId
    if (chatId) {
      const chat = await api.buyback.getBuybackById(chatId)
      if (chat) selectChat(chat)
    }
  } catch (error) {
    console.error('Error initializing:', error)
    snackbar.notify({ text: 'Ошибка загрузки данных', color: 'error' })
  } finally {
    loadingStatuses.value = false
  }
})

onUnmounted(() => {
  cleanupPusher()
  if (timerInterval.value) clearInterval(timerInterval.value)
})

function openSupport() {
  // Логика перехода или вызова окна поддержки
  router.push('/dashboard/support')
}

function cancelBuyback() {
  cancelOrder()
  selectChat(activeChat.value)
}


console.log(activeChat.value)
</script>

<template>
  <div class="chats-container">
    <div class="content-wrapper">
      <VRow class="chat-row">
        <VCol
          v-if="shouldShowChatList"
          cols="12"
          md="4"
        >
          <VCard
            class="chat-list-sidebar pa-4 px-2"
            height="80vh"
          >
            <h2 class="text-h6 mb-4 px-2">
              Чаты
            </h2>
            <VSelect
              v-model="selectedStatus"
              :items="statuses"
              item-title="title"
              item-value="slug"
              label="Статус"
              variant="outlined"
              density="compact"
              class="px-2"
              @update:model-value="selectStatus"
            >
              <template #selection="{ item }">
                <span>{{ item.title }}</span>
                <VBadge
                  v-if="item.raw.not_read"
                  :content="item.raw.not_read"
                  color="error"
                  inline
                  class="ml-2"
                />
              </template>
            </VSelect>
            <VDivider class="my-4 mx-2" />
            <VProgressCircular
              v-if="loadingChats"
              indeterminate
              color="primary"
              class="d-block mx-auto"
            />
            <PerfectScrollbar
              v-else
              tag="ul"
              class="pt-0 chat-list pb-5"
            >
              <VListItem
                v-for="chat in chatsByStatus[selectedStatus] || []"
                :key="chat.id"
                :class="{ 'bg-primary': activeChat?.id === chat.id }"
                class="py-3 px-2 rounded"
                @click="selectChat(chat)"
              >
                <template #prepend>
                  <VAvatar
                    size="48"
                    class="mr-1"
                  >
                    <VImg :src="chat?.ad?.product?.images[0] || 'https://via.placeholder.com/50'" />
                  </VAvatar>
                </template>
                <VListItemTitle class="mb-1">
                  <div class="d-flex justify-space-between align-center w-100 gap-3">
                    <span class="text-truncate">
                      {{ chat.ad.product.name }} ({{ statusMessages[chat.status] || chat.status }})
                      <VBadge
                        v-if="chat.messages.some(m => !m.is_read && m.whoSend === 'seller')"
                        content="!"
                        color="error"
                        inline
                      />
                    </span>
                    <span class="text-caption text-no-wrap">{{ formatDate(chat.messages.at(-1).created_at) }}</span>
                  </div>
                </VListItemTitle>
                <VListItemSubtitle>
                  <div class="d-flex justify-space-between align-center w-100">
                    <span
                      class="text-truncate mr-2"
                      style="flex: 1 1 auto; overflow: hidden;"
                    >
                      {{ chat.messages.at(-1)?.text.replace(/<br\s*\/?>/gi, '   ') }}
                    </span>
                    <VBadge
                      v-if="chat.unread_messages_count"
                      inline
                      :content="chat.unread_messages_count"
                      color="primary"
                      overlap
                      :size="16"
                      class="flex-shrink-0"
                    />
                  </div>
                </VListItemSubtitle>
              </VListItem>
            </PerfectScrollbar>
          </VCard>
        </VCol>

        <VCol
          v-if="shouldShowMessages"
          cols="12"
          md="8"
          class="active-chat-block"
        >
          <VCard
            class="chat-content pa-6"
            min-height="calc(100vh - 20%)"
          >
            <div
              v-if="activeChat"
              class="d-flex flex-column h-100"
            >
              <div class="chat-header mb-4">
                <div class="d-flex align-center justify-between mb-2">
                  <div class="d-flex align-center">
                    <VBtn
                      v-if="shouldShowMessages && isMobile"
                      icon
                      size="24"
                      style="background-color: transparent !important; box-shadow: none"
                      class="back-btn mr-2"
                      @click="backToChats"
                    >
                      <VIcon
                        icon="ri-arrow-left-s-line"
                        :color="$vuetify.theme.current.colors['on-surface']"
                        size="large"
                      />
                    </VBtn>
                    <VAvatar
                      size="48"
                      class="mr-2 cursor-pointer"
                      color="primary"
                      @click="goToUserProfile(activeChat.user.id)"
                    >
                      <VImg
                        v-if="activeChat.user.avatar"
                        :src="activeChat.user.avatar"
                        :alt="activeChat.user.name"
                      />
                      <span v-else>{{ activeChat.user.name[0] }}</span>
                    </VAvatar>
                    <VAvatar
                      size="48"
                      class="cursor-pointer"
                      style="position: relative; left: -20px;"
                      @click="goToProduct(activeChat.ad.id)"
                    >
                      <VImg
                        :src="activeChat.ad.product.images[0] || 'https://via.placeholder.com/48'"
                        :alt="activeChat.ad.name"
                      />
                    </VAvatar>
                    <div>
                      <span
                        class="text-body-2 text-secondary"
                        style="font-size: 12px"
                      >Оффлайн: {{ formatLastSeen(lastSeen) }}</span>
                      <div class="d-flex align-center gap-1">
                        <h3 class="text-h6 font-weight-bold mb-0">
                          {{ activeChat.user?.name }}
                        </h3>
                        <div class="d-flex align-center">
                          <VIcon
                            icon="ri-star-s-fill"
                            size="15"
                            color="#FF9900"
                            class="mr-1"
                          />
                          <span style="font-size: 12px; line-height: 1;">{{ activeChat.user.rating }}</span>
                        </div>
                      </div>

                      <p
                        style="font-size: 12px"
                        class="ma-0"
                      >
                        {{ activeChat.ad.product.name }}
                      </p>
                    </div>
                  </div>
                  <VMenu offset-y>
                    <template #activator="{ props }">
                      <VBtn
                        type="info"
                        variant="outlined"
                        icon
                        v-bind="props"
                      >
                        <VIcon>ri-more-fill</VIcon>
                      </VBtn>
                    </template>

                    <VList>
                      <VListItem @click="openSupport">
                        <VListItemTitle>Поддержка</VListItemTitle>
                      </VListItem>

                      <VListItem @click="cancelBuyback">
                        <VListItemTitle>Отменить заказ</VListItemTitle>
                      </VListItem>
                    </VList>
                  </VMenu>
                </div>
                <VAlert
                  :type="alertType"
                  class="status-alert"
                  :icon="false"
                >
                  <span class="msg-alert-text">
                    Шаг {{ step }}/5 - {{ statusMessage }}
                    <span
                      v-if="timer"
                      class="timer ml-2"
                    >{{ timer }}</span>
                    <span
                      v-else-if="activeChat.status === 'pending'"
                      class="timer ml-2 text-warning"
                    >Ожидание таймера...</span>
                  </span>
                </VAlert>
              </div>

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
                    <span
                      v-if="message.hide_for != 'user'"
                      class="w-100 text-caption text-center text-disabled mb-2"
                    >
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

                    <div v-if="message.type != 'system' && message.system_type != 'success' && message.hide_for != 'user'">
                      <span v-if="activeChat.ad.user_id == message.sender_id">{{ activeChat.ad?.shop?.wb_name }}</span>
                      <span v-else>Вы</span>
                    </div>


                    <div
                      v-if="message.type == 'system' && message.system_type == 'success' && message.hide_for != 'user'"
                      class="w-100 text-center d-flex justify-center"
                    >
                      <div class="success-msg">
                        {{ message.text }}
                      </div>
                    </div>

                    <div
                      v-else-if="message.type == 'system' && message.system_type == 'info' && message.hide_for != 'user'"
                      class="w-100 text-center d-flex justify-center"
                    >
                      <div class="info-msg">
                        {{ message.text }}
                      </div>
                    </div>

                    <!--                    old below -->

                    <div
                      v-else-if="message.hide_for != 'user'"
                      :style="{
                        backgroundColor: message.sender_id === currentUser?.id ? message.color || '#1976d2' : '#f5f5f5',
                        color: message.sender_id === currentUser?.id ? 'white' : 'black',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        maxWidth: '70%'
                      }"
                    >
                      <template v-if="message.type === 'image'">
                        <span v-if="message.system_type === 'send_photo' || message.system_type === 'review'">Скриншот</span>
                        <div
                          v-for="(file, index) in message.files || (message.file ? [message.file] : [])"
                          :key="`file-${message.id}-${index}`"
                        >
                          <VImg
                            :src="file.src || 'https://via.placeholder.com/50'"
                            max-width="200"
                            class="mt-2 cursor-pointer rounded"
                            @click="openImage(file.src)"
                            @error="console.error('Failed to load image:', file.src)"
                          />
                        </div>
                      </template>
                      <span
                        v-if="message.text && message.system_type !== 'review'"
                        v-html="message.text.replace(/\n/g, '<br>')"
                      />
                      <template v-else-if="message.system_type === 'review' && message.type === 'system' && activeChat.has_review_by_seller && activeChat.has_review_by_buyer">
                        <VRating
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
                        <span>{{ message.text }}</span>
                      </template>

                      <template
                        v-else-if="!activeChat.has_review_by_seller && activeChat.has_review_by_buyer"
                        class="success-msg"
                      >
                        <span>Продавец еще не оставил отзыв о вас. Мы сообщим вам сразу же как продавец напишет отзыв </span>
                      </template>

                      <template
                        v-else-if="activeChat.has_review_by_seller && !activeChat.has_review_by_buyer"
                        class="success-msg"
                      >
                        <span>Продавец оставил о вас отзыв. Оставьте отзыв о продавце, чтобы увидеть его отзыв </span>
                      </template>
                    </div>
                  </li>

                  <div
                    v-if="activeChat.status === 'cashback_received' && !activeChat.has_review_by_buyer && !sendReview"
                    class="mt-4"
                  >
                    <VCard
                      class="pa-4 mb-4"
                      elevation="2"
                      rounded="lg"
                    >
                      <VCardTitle class="text-h6 d-flex align-center">
                        <VIcon
                          icon="ri-star-line"
                          class="mr-2"
                        />
                        Оставьте отзыв
                      </VCardTitle>
                      <VCardText>
                        <p class="text-body-2 mb-4">
                          Оставьте отзыв о продавце, чтобы увидеть отзыв продавца о вас.
                        </p>
                        <VRating
                          v-model="reviewRating"
                          length="5"
                          size="32"
                          color="yellow darken-3"
                          background-color="grey lighten-2"
                          class="mb-4"
                          aria-label="Выберите рейтинг"
                        />
                        <VTextarea
                          v-model="reviewText"
                          label="Ваш отзыв"
                          variant="outlined"
                          density="compact"
                          class="mb-4"
                          aria-label="Оставить отзыв о заказе"
                        />
                      </VCardText>
                      <VCardActions>
                        <VBtn
                          color="primary"
                          :disabled="!reviewText.trim() || reviewRating == null"
                          class="px-4"
                          rounded
                          @click="submitReview"
                        >
                          Отправить отзыв
                        </VBtn>
                      </VCardActions>
                    </VCard>
                  </div>

                  <div
                    v-if="(activeChat.status === 'pending' && !activeChat.is_order_photo_sent && !orderSend) || showOrderForm"
                    class="mt-4"
                  >
                    <VCard
                      class="border border-dashed"
                      :class="$vuetify.display.mdAndUp ? 'pa-8' : 'pa-4'"
                      elevation="0"
                      rounded="lg"
                    >
                      <VCardTitle
                        class="text-h6 text-center text-pre-wrap pa-0 pb-3"
                        style="line-height: 1.4;"
                      >
                        Загрузите скриншот из кабинета Wildberries, на котором видно, что вы заказали этот товар.
                      </VCardTitle>

                      <VCardText class="pa-0 mx-6">
                        <VFileInput
                          v-model="pendingFile"
                          :label="pendingFile ? '' : 'Загрузить'"
                          accept=".jpeg,.png,.jpg,.gif"
                          variant="outlined"
                          density="compact"
                          show-size
                          size="large"
                          prepend-icon=""
                          :prepend-inner-icon="pendingFile ? 'ri-file-3-line' : 'ri-upload-cloud-2-line'"
                          :class="{
                            'mb-4': pendingFile,
                            'overflow-hidden': !$vuetify.display.mdAndUp
                          }"
                          class="text-ellipse "
                           
                          aria-label="Загрузить скриншот заказа"
                          @update:model-value="generatePreview(pendingFile, pendingPreview)"
                        />                        
                        <VImg
                          v-if="pendingPreview"
                          :src="pendingPreview"
                          max-width="100"
                          class="mb-4 rounded"
                          cover
                        />

                        <VCardActions class="pa-0">
                          <VBtn
                            v-if="pendingFile"
                            variant="flat"
                            color="primary"
                            block
                            size="large"
                            rounded
                            @click="confirmModal = true"
                          >
                            Отправить
                          </VBtn>
                        </VCardActions>
                      </VCardText>
                    </VCard>

                    <div class="d-flex justify-center mt-3">
                      <p
                        class="cursor-pointer"
                        style="color: rgb(var(--v-theme-on-surface))"
                        @click="cancelItem = true"
                      >
                        Отменить заказ
                      </p>
                    </div>
                  </div>


                  <div
                    v-if="(activeChat.status === 'awaiting_receipt' && !activeChat.is_review_photo_sent && !receiptSent) || showBarcode"
                    class="mt-4"
                  >
                    <VCard
                      class="pa-4 mb-4"
                      elevation="2"
                      rounded="lg"
                    >
                      <VCardTitle class="text-h6 d-flex align-center">
                        <VIcon
                          icon="ri-barcode-line"
                          class="mr-2"
                        />
                        Загрузите фото штрихкода
                      </VCardTitle>
                      <VCardText>
                        <p class="text-body-2 mb-4">
                          Загрузите фото, на котором видно, как вы порезали штрихкод
                        </p>
                        <VFileInput
                          v-model="barcodeFile"
                          label="Выберите фото штрихкода"
                          accept=".jpeg,.png,.jpg,.gif"
                          variant="outlined"
                          density="compact"
                          show-size
                          prepend-icon="ri-upload-cloud-line"
                          class="mb-4"
                          aria-label="Загрузить фото штрихкода"
                          @update:model-value="generatePreview(barcodeFile, barcodePreview)"
                        />
                        <VImg
                          v-if="barcodePreview"
                          :src="barcodePreview"
                          max-width="100"
                          class="mb-4 rounded"
                          cover
                        />
                      </VCardText>
                    </VCard>
                    <VCard
                      class="pa-4 mb-4"
                      elevation="2"
                      rounded="lg"
                    >
                      <VCardTitle class="text-h6 d-flex align-center">
                        <VIcon
                          icon="ri-star-line"
                          class="mr-2"
                        />
                        Загрузите скриншот отзыва
                      </VCardTitle>
                      <VCardText>
                        <p class="text-body-2 mb-4">
                          Загрузите скриншот, где видно, что вы оставили отзыв
                        </p>
                        <VFileInput
                          v-model="reviewFile"
                          label="Выберите скриншот отзыва"
                          accept=".jpeg,.png,.jpg,.gif"
                          variant="outlined"
                          density="compact"
                          show-size
                          prepend-icon="ri-upload-cloud-line"
                          class="mb-4"
                          aria-label="Загрузить скриншот отзыва"
                          @update:model-value="generatePreview(reviewFile, reviewPreview)"
                        />
                        <VImg
                          v-if="reviewPreview"
                          :src="reviewPreview"
                          max-width="100"
                          class="mb-4 rounded"
                          cover
                        />
                      </VCardText>
                      <VCardActions>
                        <VBtn
                          color="primary"
                          :disabled="!barcodeFile || !reviewFile"
                          class="px-4"
                          variant="flat"
                          rounded
                          @click="uploadConfirmationFiles"
                        >
                          Отправить
                        </VBtn>
                      </VCardActions>
                    </VCard>
                  </div>
                </PerfectScrollbar>
                <div
                  v-else
                  class="flex-grow-1 d-flex align-center justify-center"
                >
                  <p class="text-field-error">
                    Нет сообщений
                  </p>
                </div>

                <VForm
                  v-if="activeChat && (activeChat.status === 'pending' && activeChat.is_order_photo_sent || activeChat.status === 'on_confirmation' && activeChat.is_review_photo_sent || activeChat.status === 'cashback_received' || (activeChat.status === 'awaiting_receipt' && activeChat.is_review_photo_sent) || receiptSent || orderSend)"
                  class="mt-4"
                  @submit.prevent="sendMessage"
                >
                  <VTextField
                    v-model="messageInput"
                    placeholder="Введите сообщение..."
                    variant="outlined"
                    density="compact"
                    append-inner-icon="ri-send-plane-line"
                    @click:append-inner="sendMessage"
                  >
                    <template #append-inner-label="{ props }">
                      <VTooltip text="Прикрепить файл (.jpg, .jpeg, .png)">
                        <template #activator="{ props: activatorProps }">
                          <VBtn
                            icon
                            size="small"
                            v-bind="activatorProps"
                            @click="fileInput.click()"
                          >
                            <VIcon icon="ri-attachment-2" />
                          </VBtn>
                        </template>
                      </VTooltip>
                    </template>
                  </VTextField>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".jpeg,.png,.jpg"
                    hidden
                    @change="sendMessage"
                  >
                </VForm>
              </div>
            </div>
            <div
              v-else
              class="d-flex w-100 h-100 align-center justify-center flex-column"
            >
              <VAvatar
                size="large"
                variant="tonal"
                color="primary"
                class="mb-2"
              >
                <VIcon
                  size="large"
                  icon="ri-wechat-line"
                />
              </VAvatar>
              <p class="text-center text-muted">
                Выберите чат для общения
              </p>
            </div>
          </VCard>
        </VCol>
      </VRow>
      <VDialog
        v-model="confirmModal"
        max-width="360"
      >
        <VCard class="py-5 px-4">
          <VCardTitle class="pa-0 pb-2">
            Подтверждение заказа
          </VCardTitle>
          <VCardText class="pa-0">
            Нажимаяя кнопку ниже, вы подтверждаете, что заказали товар согласно инструкции продавца.
          </VCardText>
          <VBtn
            block
            color="primary"
            variant="flat"
            class="mt-6"
            size="large"
            @click="uploadPendingFile"
          >
            Подтвердить
          </VBtn>
          <VBtn
            variant="outlined"
            color="secondary"
            block
            size="large"
            class="text-gray-900 mt-3"
            style="color: rgb(var(--v-theme-on-surface))"
            @click="confirmModal = false"
          >
            Отмена
          </VBtn>
        </VCard>
      </VDialog>

      <VDialog
        v-model="cancelItem"
        max-width="360"
      >
        <VCard class="py-5 px-4">
          <VCardTitle class="pa-0 pb-2">
            Отмена заказа
          </VCardTitle>
          <VCardText class="pa-0">
            Нажимая кнопку ниже, вы подтверждаете, что отменяете заказ
          </VCardText>
          <VBtn
            block
            color="primary"
            variant="flat"
            class="mt-6"
            size="large"
            @click="cancelOrder"
          >
            Подтвердить
          </VBtn>
          <VBtn
            variant="outlined"
            color="secondary"
            block
            size="large"
            class="text-gray-900 mt-3"
            style="color: rgb(var(--v-theme-on-surface))"
            @click="cancelItem = false"
          >
            Отмена
          </VBtn>
        </VCard>
      </VDialog>

      <VDialog
        v-model="imageModal"
        max-width="800"
      >
        <VCard>
          <VImg
            :src="selectedImage"
            contain
            max-height="600"
          />
          <VCardActions>
            <VSpacer />
            <VBtn
              color="secondary"
              @click="imageModal = false"
            >
              Закрыть
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
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
  overflow-x: hidden;
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
.justify-between{
  justify-content: space-between;
}

.chat-list {
  height: 100%;
  overflow-y: auto;
}
</style>

<style>
.status-alert .v-alert__content{
  background: #fff;
  border-radius: 30px;
  padding: 5px;
}
</style>
