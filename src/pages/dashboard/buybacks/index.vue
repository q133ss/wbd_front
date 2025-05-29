<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useSnackbarStore } from '@/stores/snackbar'
import { useDisplay } from 'vuetify'
import { useRoute, useRouter } from 'vue-router'
import Pusher from 'pusher-js'
import api from '@/api/Index'

definePage({ meta: { layoutWrapperClasses: 'layout-content-height-fixed', authRequired: true } })

const snackbar = useSnackbarStore()
const { smAndDown } = useDisplay()
const route = useRoute()
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
    const response = await api.chat.getStatusList()
    statuses.value = response || []
    await fetchChats()

    // Получение чата по ID
    const chatId = route.query.chatId
    if(chatId){
      const res = await api.buyback.getBuybackById(chatId)
      const chat = res
      if (chat) {
        selectChat(chat)
      } else {
        console.warn(`Чат с id=${chatId} не найден.`)
      }
    }

    // Подписка на канал уведомлений
    // if (pusher) {
    //   channel?.unsubscribe()
    //   pusher.disconnect()
    // }
    pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true
    })
    const notificationChannelName = `notification-${currentUser.value.id}`

    const notificationChannel = pusher.subscribe(notificationChannelName)

    notificationChannel.bind('MessageSent', async (notification) => {
      await fetchChats()
    })
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
  console.log(chat)
  activeChat.value = chat
  messages.value = []
  try {
    const response = await api.chat.getMessages(chat.id)
    messages.value = response.data || []
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
const setupPusher = async (chatId) => {
  channel = pusher.subscribe(`chat-${chatId}`)
  channel.bind('MessageSent', (data) => {
    console.log('New message received:', data)
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

  try {
    await api.chat.sendMessage(activeChat.value.id, messageInput.value)
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
const approveFile = async (chatIdValue, fileIdValue) => {
  try {
    const response = await api.buyback.approvePhoto(chatIdValue, fileIdValue)
    if (response.buyback) {
      activeChat.value.status = response.buyback.status
      updateStatusTimer()
    }
    if (response.message) {
      messages.value.push(response.message)
      scrollToBottom()
    }

    const res = await api.buyback.getBuybackById(chatIdValue)
    const chat = res
    if (chat) {
      selectChat(chat)
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

// Status message and timer
const statusMessages = {
  cancelled: 'Отменен',
  order_expired: 'Покупатель не успел сделать заказ в установленный срок',
  pending: 'Ожидание заказа',
  awaiting_receipt: 'Ожидание получения',
  on_confirmation: 'На подтверждении',
  cashback_received: 'Кэшбек был зачислен на баланс покупателя',
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

const chatId = ref('')
const fileId = ref('')
const comment = ref('')

const isRejectVisible = ref(false)
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

// Reject file
const rejectFile = async () => {
  try {
    const response = await api.buyback.rejectPhoto(chatId.value, fileId.value, comment.value)
    if (response.buyback) {
      activeChat.value.status = response.buyback.status
      updateStatusTimer()
    }
    if (response.message) {
      messages.value.push(response.message)
      scrollToBottom()
    }
    isRejectVisible.value = false

    const res = await api.buyback.getBuybackById(chatId.value)
    const chat = res
    if (chat) {
      selectChat(chat)
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

// Submit review for cashback_received status
const reviewText = ref('')
const reviewRating = ref(null)
const reviewSend = ref(false)
const submitReview = async () => {
  console.log(!reviewText.value.trim() , reviewRating.value == null)
  if (!reviewText.value.trim() || reviewRating.value == null) return
  try {
    await api.reviews.storeReview(activeChat.value.id, reviewText.value, reviewRating.value)
    reviewText.value = ''
    snackbar.notify({
      text: 'Отзыв отправлен',
      color: 'success'
    })
    selectChat(activeChat.value)
    reviewSend.value = true
    scrollToBottom()
  } catch (error) {
    console.error('Error submitting review:', error)
    snackbar.notify({
      text: error.response?._data?.message || 'Ошибка отправки отзыва',
      color: 'error'
    })
  }
}

const isMobile = ref(window.innerWidth < 960)

const shouldShowChatList = computed(() => {
  return (isMobile.value && activeChat.value === null) || !isMobile.value
})

const shouldShowMessages = computed(() => {
  return (isMobile.value && activeChat.value != null) || !isMobile.value
})

const backToChats = () => {
  activeChat.value = null
  messages.value = []
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
          <VBtn size="small" v-if="shouldShowMessages && isMobile" @click="backToChats" variant="outlined" class="mb-3" prepend-icon="ri-arrow-left-line">Вернуться назад</VBtn>
          <v-card class="chat-content pa-6" min-height="80vh">
            <div v-if="activeChat" class="d-flex flex-column h-100">
              <!-- Chat Header -->
              <div class="chat-header mb-4">
                <div class="d-flex align-center mb-2">
                  <v-avatar size="48" class="mr-2 cursor-pointer" color="primary" @click="goToUserProfile(activeChat.user.id)">
                    <v-img
                      v-if="activeChat.user.avatar"
                      :src="activeChat.user.avatar"
                      :alt="activeChat.user.name"
                    />
                    <span v-else>{{ activeChat.user.name[0] }}</span>
                  </v-avatar>
                  <v-avatar size="48" class="mr-2 cursor-pointer" @click="goToProduct(activeChat.ad.id)" style="position: relative; left: -20px;">
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
                      <template v-if="message.system_type === 'review' && message.type == 'system'">
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
                      </template>
                      <span v-if="message.text" v-html="message.text.replace(/\n/g, '<br>')"></span>

                      <template v-if="message.type === 'image'">
                        <span v-if="message.system_type == 'send_photo'">Заказ сделан</span>
                        <span v-if="message.system_type == 'review'  && message.type == 'system'">{{message.sender_id == currentUser.id ? 'Вы оставили отзыв' : 'Покупатель оставил отзыв'}}</span>
                        <v-img
                          v-if="message?.file || message?.files?.[0]?.src"
                          :key="`image-${message.id}`"
                          :src="message?.file?.src || message?.files?.[0]?.src"
                          :lazy-src="'https://via.placeholder.com/50'"
                          max-width="200"
                          class="mt-2 cursor-pointer rounded"
                          @click="openImage(message?.file?.src)"
                          @error="console.error('Failed to load image:', message?.file?.src)"
                        />
                        <span v-else class="text-error">
                          Изображение не загружено (нет URL)
                        </span>
                        <span v-if="message.file?.status == null && activeChat.status == 'cashback_received'">
                          Скриншот
                        </span>
                        <v-row no-gutters class="mt-2" v-if="message.file?.status == null && activeChat.status != 'cashback_received'">
                          <v-col><v-btn color="success" @click="approveFile(message.buyback_id, message.files?.[0]?.id || message.file?.id)">Принять</v-btn></v-col>
                          <v-col><v-btn color="error" @click="openRejectModal(message.buyback_id, message.files?.[0]?.id || message.file?.id)" class="ml-2">Отклонить</v-btn></v-col>
                        </v-row>
                        <span v-else-if="message.file?.status != null">
                          {{message.file?.status == true ? 'Файл подтвержден' : 'Файл отклонен'}}
                        </span>
                      </template>
                      <div
                        v-if="message.file && message.whoSend === 'buyer' && activeChat.status === 'on_confirmation'"
                        class="mt-2"
                      >
                        <v-btn
                          color="success"
                          size="small"
                          class="mr-2"
                          @click="approveFile(message.buyback_id, message.file?.id)"
                        >
                          Подтвердить
                        </v-btn>
                        <v-btn
                          color="error"
                          size="small"
                          @click="rejectFile()"
                        >
                          Отклонить
                        </v-btn>
                      </div>
                    </div>
                    <span class="text-caption text-disabled mt-1">
                      {{ new Date(message.created_at).toLocaleTimeString('ru-RU') }}
                    </span>
                  </li>

                  <div v-if="activeChat.status === 'cashback_received' && activeChat.has_review_by_seller == false && !reviewSend" class="mt-4">
                    <v-card class="pa-4" elevation="2" rounded="lg">
                      <v-card-title class="text-h6 d-flex align-center">
                        <v-icon icon="ri-star-line" class="mr-2" />
                        Оставьте отзыв
                      </v-card-title>
                      <v-card-text>
                        <p class="text-body-2 mb-4">
                          Пожалуйста, оставьте отзыв о покупателе
                        </p>
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
                          type="submit"
                          color="primary"
                          :disabled="!reviewText && reviewRating != null"
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

  <!--  Модальное окно для отклонения -->

  <VDialog
    v-model="isRejectVisible"
    width="500"
  >
    <!-- Dialog Content -->
    <VCard title="Отклонить фото">
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="resetForm()"
      />

      <VCardText>
        <v-textarea v-model="comment" placeholder="Укажите причину"></v-textarea>
        <v-btn color="danger" @click="rejectFile()">Отклонить</v-btn>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style>
.layout-page-content{
  overflow: visible!important;
}

@media screen and (max-width: 960px){
  .layout-page-content{
    margin-top: -30px;
  }
  html{
    overflow: hidden!important;
  }
}

.footer{
  display: none;
}
</style>

<style scoped lang="scss">
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.chat-list-sidebar {
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

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
}

.timer {
  font-weight: 500;
  color: #d81b60;
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

.bg-primary {
  background-color: #1976d2 !important;
}

.chats-container{
  overflow-y: hidden!important;
}

@media screen and (max-width: 960px){
  .chats-container{
    overflow-x: scroll!important;
  }
  .content-wrapper{
    overflow: hidden;
  }
  .chat-content{
    padding-top: 10px !important;
  }
  .active-chat-block{
    overflow-y: hidden!important;
  }
  .chat-list-sidebar{
    min-height: 91vh!important;
  }
  .chat-content{
    min-height: 85vh!important;
  }
  .chat-log{
    min-height: 60vh!important;
  }
}
</style>
