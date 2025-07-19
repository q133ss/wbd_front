<script setup>
import { useSnackbarStore } from '@/stores/snackbar'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useDisplay } from 'vuetify'
import { useChatStore } from './chat'
import CustomFileInput from './CustomFileInput.vue'
import { statusMessages } from './statusMessages'
import { useChat } from './useChat'
import { useFiles } from './useFiles'
import { useMessages } from './useMessages'
import { useOrders } from './useOrders'
import { useReviews } from './useReviews'
import { useTimer } from './useTimer'

definePage({ meta: { layoutWrapperClasses: 'layout-content-height-fixed', authRequired: true } })

const { smAndDown } = useDisplay()
const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const snackbar = useSnackbarStore()

const chatLogPS = ref(null)
const { updateStatusTimer, timer } = useTimer()
const { fetchChats, selectStatus, selectChat, setupNotificationChannel, cleanupPusher, scrollToBottom } = useChat(chatLogPS, updateStatusTimer) // Передаем updateStatusTimer
const { sendMessage, messageInput, fileInput, sendingMessage } = useMessages()

const { generatePreview, uploadPendingFile, uploadConfirmationFiles, pendingFile, barcodeFile, reviewFile, pendingPreview, barcodePreview, reviewPreview } = useFiles()
const { submitReview, reviewText, reviewRating } = useReviews()
const { cancelOrder } = useOrders()

const imageModal = ref(false)
const selectedImage = ref('')
const isLeftSidebarOpen = ref(true)
const isMobile = ref(window.innerWidth < 960)
const showBarcode = ref(false)
const showOrderForm = ref(false)
const orderSend = ref(false)
const receiptSent = ref(false)
const confirmModal = ref(false)
const cancelItem = ref(false)
const correctPhotos = ref(false)
const examplePhoto = ref(false)

function formatTimeAgo(dateString) {
  if (!dateString) return 'давно'

  const date = new Date(dateString)
  if (isNaN(date)) return 'Неверная дата'

  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'только что'
  if (minutes < 60) return `${minutes} мин назад`
  if (days === 0)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} дн. назад`

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getDaysWord = days => {
  if (days % 10 === 1 && days % 100 !== 11) return 'день'
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня'
  
  return 'дней'
}

const getHoursWord = hours => {
  if (hours % 10 === 1 && hours % 100 !== 11) return 'час'
  if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) return 'часа'
  
  return 'часов'
}

const getBuybackDeclension = count => {
  const num = Math.abs(count)
  if (num % 10 === 1 && num % 100 !== 11) return 'выкуп'
  if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'выкупа'
  
  return 'выкупов'
}

const statusInfo = computed(() => {
  const chat = chatStore.activeChat

  console.log(chat)
  
  if (!chat) return { title: '', text: '' }

  const status = chat.status
  const info = statusMessages[status] || { title: '', text: '' }

  let text = info.text
  if (status === 'cashback_received') {
    text = text.replace('{{price}}', Math.round(chat.product_price - chat.price_with_cashback))
  }

  return { title: info.title, text }
})

const step = computed(() => {
  if (!chatStore.activeChat) return ''
  const status = chatStore.activeChat.status
  if (status === 'pending') return 1
  if (status === 'awaiting_receipt') return 2
  if (status === 'on_confirmation') return 3
  if (status === 'cashback_received') return 4
  if (['completed', 'order_expired', 'cancelled'].includes(status)) return 5
  
  return ''
})

const alertType = computed(() => {
  if (!chatStore.activeChat) return ''
  const status = chatStore.activeChat.status
  if (status === 'pending') return '#6941C6'
  if (status === 'awaiting_receipt') return '#4F91FF'
  if (status === 'on_confirmation') return '#DC6803'
  if (['cashback_received', 'completed'].includes(status)) return '#12B76A'
  if (['cancelled', 'order_expired'].includes(status)) return '#344054'
  
  return ''
})

const shouldShowChatList = computed(() => (isMobile.value && !chatStore.activeChat) || !isMobile.value)
const shouldShowMessages = computed(() => (isMobile.value && chatStore.activeChat) || !isMobile.value)

const sortedChats = computed(() => {
  const chats = chatStore.chatsByStatus[chatStore.selectedStatus] || []
  
  return chats
    .slice()
    .sort((a, b) => {
      const dateA = new Date(a.messages?.[a.messages.length - 1]?.created_at || 0).getTime()
      const dateB = new Date(b.messages?.[b.messages.length - 1]?.created_at || 0).getTime()
      
      return dateB - dateA
    })
})

const openImage = url => {
  selectedImage.value = url || 'https://via.placeholder.com/48'
  imageModal.value = true
}

const goToUserProfile = userId => router.push(`/users/${userId}`)
const goToProduct = adsId => router.push(`/products/${adsId}`)

const backToChats = () => {
  chatStore.activeChat = null
  chatStore.messages = []
}

const openSupport = () => router.push('/dashboard/support')

const cancelBuyback = () => {
  cancelOrder()
  selectChat(chatStore.activeChat)
}

const handleConfirm = async () => {
  const success = await uploadPendingFile()

  confirmModal.value = false
}

const handleCancel = async () => {
  const success = await cancelOrder()

  cancelItem.value = false
}

const handleUpload = async () => {
  const success = await uploadConfirmationFiles()

  correctPhotos.value = false
}

onMounted(async () => {
  try {
    chatStore.resetState()
    await chatStore.fetchCurrentUser()
    await chatStore.fetchStatuses()
    await fetchChats(chatStore.selectedStatus)
    setupNotificationChannel()

    const chatId = route.query.chatId
    if (chatId) {
      const chat = await api.buyback.getBuybackById(chatId)
      if (chat) {
        console.log('Selecting chat:', chat)
        await selectChat(chat)
      }
    }
  } catch (error) {
    console.error('Error on mount:', error)
    snackbar.notify({ text: 'Ошибка загрузки данных', color: 'error' })
  }
})

onUnmounted(() => {
  cleanupPusher()
  if (timer.value) clearInterval(timer.value)
})
</script>

<template>
  <div class="chats-container">
    <div class="content-wrapper">
      <VRow class="chat-row d-flex flex-row">
        <VCol
          v-if="shouldShowChatList"
          cols="12"
          md="4"
          class="pr-0"
        >
          <VCard
            class="chat-list-sidebar"
            height="80vh"
            elevation="0"
            style="border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: 1px solid rgba(var(--v-theme-on-background), 0.2); box-sizing: border-box"
          >
            <div class="chat-list-header py-4 px-4 gap-4">
              <VSelect
                v-model="chatStore.selectedStatus"
                :items="chatStore.statuses"
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
            </div>
            <VDivider />
            <VProgressCircular
              v-if="chatStore.loadingChats"
              indeterminate
              color="primary"
              class="d-block mx-auto"
            />
            <PerfectScrollbar
              v-else
              tag="ul"
              class="chat-contacts-list px-3 d-flex flex-column gap-1"
              :options="{ wheelPropagation: false }"
            >
              <li class="list-none">
                <span class="chat-contact-header py-2 d-block text-lg font-weight-medium">Чаты</span>
              </li>
              <VListItem
                v-for="chat in sortedChats"
                :key="chat.id"
                rounded="md"
                :class="{ 'chat-contact-active': chatStore.activeChat?.id === chat.id }"
                class="chat-contact cursor-pointer w-100 align-center"
                @click="selectChat(chat)"
              >
                <template #prepend>
                  <VBadge
                    dot
                    location="bottom right"
                    offset-x="3"
                    offset-y="3"
                    :color="chat.user?.is_online ? '#39da8a' : '#69809a'"
                    bordered
                    :model-value="chat.user?.is_online"
                  >
                    <VAvatar
                      size="40"
                      class="mr-1"
                    >
                      <VImg :src="chat?.ad?.product?.images[0] || 'https://via.placeholder.com/50'" />
                    </VAvatar>
                  </VBadge>
                </template>
                <VListItemTitle class="mb-1">
                  <div class="d-flex justify-space-between align-center w-100 gap-3">
                    <span class="text-truncate text-base mb-0">
                      {{ chat.ad.product.name }} ({{ statusMessages[chat.status]?.title || chat.status }})
                      <VBadge
                        v-if="chat.messages.some(m => !m.is_read && m.whoSend === 'seller')"
                        content="!"
                        color="error"
                        inline
                      />
                    </span>
                    <span class="text-caption text-no-wrap text-sm text-disabled whitespace-no-wrap">{{ formatTimeAgo(chat.messages.at(-1).created_at) }}</span>
                  </div>
                </VListItemTitle>
                <VListItemSubtitle>
                  <div class="d-flex justify-space-between align-center w-100">
                    <span
                      class="text-truncate mr-4"
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
          class="active-chat-block px-0"
        >
          <VCard
            class="chat-content pa-0"
            elevation="0"
            height="calc(100vh - 20%)"
            style="border-top-left-radius: 0; border-bottom-left-radius: 0"
          >
            <div
              v-if="chatStore.activeChat"
              class="d-flex flex-column h-100"
            >
              <div>
                <div
                  class="d-flex align-center justify-between mb-2"
                  style="padding: 0.3rem 1.5rem;"
                >
                  <div class="d-flex align-center">
                    <IconBtn
                      v-if="shouldShowMessages && isMobile"
                      icon
                      size="small"
                      class="mr-2"
                      @click="backToChats"
                    >
                      <VIcon
                        icon="ri-arrow-left-s-line"
                        :color="$vuetify.theme.current.colors['on-surface']"
                        size="large"
                      />
                    </IconBtn>
                    <VAvatar
                      size="40"
                      class="mr-1 cursor-pointer"
                      color="primary"
                      @click="goToUserProfile(chatStore.activeChat.user.id)"
                    >
                      <VImg
                        v-if="chatStore.activeChat.user.avatar"
                        :src="chatStore.activeChat.user.avatar"
                        :alt="chatStore.activeChat.user.name"
                      />
                      <span v-else>{{ chatStore.activeChat.user.name[0] }}</span>
                    </VAvatar>
                    <VAvatar
                      size="40"
                      class="cursor-pointer"
                      style="position: relative; left: -20px;"
                      @click="goToProduct(chatStore.activeChat.ad.id)"
                    >
                      <VImg
                        :src="chatStore.activeChat.ad.product.images[0] || 'https://via.placeholder.com/48'"
                        :alt="chatStore.activeChat.ad.name"
                      />
                    </VAvatar>
                    <div style="line-height: 1.2">
                      <span
                        class="text-secondary"
                        style="font-size: 12px"
                      >
                        Оффлайн: {{ formatTimeAgo(chatStore.lastSeen) }}
                      </span>
                      <div class="d-flex align-center gap-1">
                        <h3 class="text-h6 font-weight-bold mb-0">
                          {{ chatStore.activeChat.user?.name }}
                        </h3>
                        <div class="d-flex align-center">
                          <VIcon
                            icon="ri-star-s-fill"
                            size="15"
                            color="#FF9900"
                            class="mr-1"
                          />
                          <span style="font-size: 12px; line-height: 1;">{{ chatStore.activeChat.user.rating }}</span>
                        </div>
                      </div>
                      <p
                        style="font-size: 12px"
                        class="ma-0"
                      >
                        {{ chatStore.activeChat.ad.product.name }}
                      </p>
                    </div>
                  </div>
                  <VMenu offset-y>
                    <template #activator="{ props }">
                      <IconBtn
                        icon
                        size="small"
                        v-bind="props"
                      >
                        <VIcon icon="ri-more-2-line" />
                      </IconBtn>
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
                <VDivider />
              </div>
              <div class="flex-grow-1 d-flex flex-column relative">
                <VCard
                  :color="alertType"
                  class="d-flex w-100 top-0 left-0 right-0"
                  :class="$vuetify.display.mdAndUp 
                    ? 'flex-row fixed justify-between align-center py-2 px-3 rounded-0 gap-3' 
                    : 'flex-column relative align-center py-3 px-5 rounded-lg mx-auto mt-3 gap-0'"
                  :style="$vuetify.display.smAndDown ? { maxWidth: '90%' } : {}"
                >
                  <div
                    class="d-flex align-center"
                    :class="$vuetify.display.mdAndUp ? 'flex-row gap-3' : 'flex-column gap-1'"
                  >
                    <span class="msg-alert-text text-no-wrap status-step d-block-inline px-3">
                      <span v-if="step <= 4 && step">Шаг {{ step }}/4 - </span> {{ statusInfo.title }}
                      <span
                        v-if="step === 1"
                        class="timer ml-2"
                      >{{ timer }}</span>
                      <span
                        v-if="chatStore.activeChat.status === 'pending' && !timer"
                        class="timer ml-2 text-warning"
                      >Ожидание таймера...</span>
                    </span>
                    <span
                      class="text-pre-wrap"
                      :class="$vuetify.display.mdAndUp ? 'text-left' : 'text-center'"
                      style="font-size: 12px"
                    >{{ statusInfo.text }}</span>
                  </div>
                  <span
                    v-if="step !== 1 && timer && step"
                    class="timer text-no-wrap"
                    :class="$vuetify.display.mdAndUp ? 'mr-2' : 'ma-0'"
                  >{{ timer }}</span>
                </VCard>
                <PerfectScrollbar
                  v-if="chatStore.loadingMessages"
                  ref="chatLogPS"
                  tag="ul"
                  :options="{ wheelPropagation: false }"
                  class="flex-grow-1 pa-5 relative"
                  style="overflow-x: hidden !important; overflow-y: auto; height: 1dvh;"
                >
                  <VProgressCircular
                    indeterminate
                    color="primary"
                    class="d-block mx-auto"
                  />
                </PerfectScrollbar>
                <PerfectScrollbar
                  v-else-if="chatStore.messages && chatStore.messages.length"
                  ref="chatLogPS"
                  tag="ul"
                  :options="{ wheelPropagation: false }"
                  class="flex-grow-1 pa-5 relative"
                  style="overflow-x: hidden !important; overflow-y: auto; height: 1dvh;"
                >
                  <li
                    v-for="message in chatStore.messages"
                    :key="`msg-${message.id}`"
                    class="mb-4 list-none"
                  >
                    <template v-if="message.type === 'system' && ['success', 'info'].includes(message.system_type) && message.hide_for !== 'user'">
                      <div class="w-100 text-caption text-center text-disabled mb-2">
                        {{ new Date(message.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }} в {{ new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}
                      </div>
                      <div
                        class="w-100 text-center d-flex justify-center"
                        style="font-size: 12px; line-height: 1.4; border-radius: 5px"
                      >
                        <div
                          :class="{
                            'success-msg': message.system_type === 'success',
                            'info-msg': message.system_type === 'info'
                          }"
                          v-html="message.text"
                        />
                      </div>
                    </template>
                    <div v-if="(message.type === 'system' && chatStore.activeChat.status === 'on_confirmation' && parseInt(message.color) < 5) || showOrderForm">
                      <VCard
                        class="py-7 px-8 border"
                        elevation="0"
                      >
                        <VRating
                          length="5"
                          readonly
                          :model-value="message.color"
                          size="20"
                          color="yellow darken-3"
                          background-color="grey lighten-2"
                          empty-icon="ri-star-s-fill"
                          full-icon="ri-star-s-fill"
                          half-icon="ri-star-s-fill"
                          class="mb-1"
                        />
                        <VCardTitle class="pa-0 pb-3">
                          Ваш отзыв
                        </VCardTitle>
                        <VCardText class="pa-0">
                          {{ message.text }}
                        </VCardText>
                      </VCard>
                    </div>
                    <div v-if="(message.type === 'system' && chatStore.activeChat.status === 'cashback_received' && parseInt(message.color) < 5) || showOrderForm">
                      <VCard
                        class="py-7 px-8 border"
                        elevation="0"
                      >
                        <VRating
                          length="5"
                          readonly
                          :model-value="message.color"
                          size="20"
                          color="yellow darken-3"
                          background-color="grey lighten-2"
                          empty-icon="ri-star-s-fill"
                          full-icon="ri-star-s-fill"
                          half-icon="ri-star-s-fill"
                          class="mb-1"
                        />
                        <VCardTitle class="pa-0 pb-3">
                          Отзыв продавца
                        </VCardTitle>
                        <VCardText class="pa-0">
                          {{ message.text }}
                        </VCardText>
                      </VCard>
                    </div>
                    <div
                      v-else-if="message.type !== 'system'"
                      class="chat-group d-flex align-start"
                      :class="{ 'flex-row-reverse': message.sender_id === chatStore.currentUser?.id }"
                    >
                      <div
                        class="chat-avatar"
                        :class="message.sender_id === chatStore.currentUser?.id ? 'ms-4' : 'me-4'"
                      >
                        <VAvatar
                          size="32"
                          color="primary"
                        >
                          <VImg
                            :src="message.sender_id === chatStore.activeChat.ad.user_id
                              ? chatStore.activeChat.ad.product?.images?.[0] || 'https://via.placeholder.com/48'
                              : chatStore.activeChat.user?.avatar || ''"
                            alt="avatar"
                            cover
                          />
                        </VAvatar>
                      </div>
                      <template v-if="message.type === 'image' && message.files && message.files.length > 0">
                        <div
                          class="chat-body d-inline-flex flex-column"
                          :class="message.sender_id === chatStore.currentUser?.id ? 'align-end' : 'align-end'"
                        >
                          <div
                            class="text-body-1 py-2 px-4 elevation-2 mb-1"
                            :class="[
                              message.sender_id === chatStore.currentUser?.id ? 'bg-secondary text-white chat-right' : 'bg-primary chat-left'
                            ]"
                            :style="{
                              borderRadius: message.sender_id === chatStore.currentUser?.id ? '8px 0 8px 8px' : '0 8px 8px 8px'
                            }"
                          >
                            <span v-if="message.system_type === 'send_photo' || message.system_type === 'review'">Скриншот</span>
                            <VImg
                              v-for="(file, index) in message.files"
                              :key="index"
                              :src="file.src || 'https://via.placeholder.com/200'"
                              alt="Изображение в чате"
                              style="max-width: 200px; position: relative !important"
                              class="mt-2 cursor-pointer rounded"
                              cover
                              @click="openImage(file.src)"
                            />
                          </div>
                          <div class="d-flex align-center gap-2">
                            <p
                              class="text-caption text-disabled mb-0"
                              style="letter-spacing: 0.4px;"
                            >
                              {{ formatTimeAgo(message.created_at) }}
                            </p>
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <div
                          class="chat-body d-inline-flex flex-column"
                          :class="message.sender_id === chatStore.currentUser?.id ? 'align-end' : 'align-start'"
                        >
                          <div
                            class="text-body-1 py-2 px-4 elevation-2 mb-1"
                            :class="[
                              message.sender_id === chatStore.currentUser?.id ? 'bg-secondary text-white chat-right' : 'bg-primary chat-left'
                            ]"
                            :style="{
                              borderRadius: message.sender_id === chatStore.currentUser?.id ? '8px 0 8px 8px' : '0 8px 8px 8px'
                            }"
                          >
                            <p
                              class="mb-0"
                              style="word-break: break-word; overflow-wrap: anywhere; white-space: pre-wrap"
                              v-html="message.text ? message.text.replace(/(\\n|\n|\r\n)/g, '<br>') : ''"
                            />
                          </div>
                          <div class="d-flex align-center gap-2">
                            <p
                              class="text-caption text-disabled mb-0"
                              style="letter-spacing: 0.4px;"
                            >
                              {{ formatTimeAgo(message.created_at) }}
                            </p>
                          </div>
                        </div>
                      </template>
                    </div>
                  </li>
                  <div
                    v-if="chatStore.activeChat.status === 'cashback_received' && !chatStore.activeChat.has_review_by_buyer && !sendReview"
                    class="mt-4"
                  >
                    <VCard
                      class="pa-3 mb-4 border"
                      elevation="0"
                      rounded="lg"
                    >
                      <VCardTitle class="text-h6 text-lg d-flex align-center px-5">
                        Оставьте отзыв о продавце
                      </VCardTitle>
                      <VCardText class="pb-1 d-flex flex-column">
                        <p class="text-body-2 mb-1">
                          Расскажите о том, как прошел выкуп.
                        </p>
                        <VRating
                          v-model="reviewRating"
                          length="5"
                          size="20"
                          color="yellow darken-3"
                          background-color="grey lighten-2"
                          empty-icon="ri-star-s-fill"
                          full-icon="ri-star-s-fill"
                          half-icon="ri-star-s-fill"
                          class="mb-1"
                          aria-label="Выберите рейтинг от 1 до 5"
                        />
                        <span class="mb-0 text-sm">
                          Ваш отзыв:
                        </span>
                        <VTextarea
                          v-model="reviewText"
                          variant="outlined"
                          density="flat"
                          class="mb-0 py-2"
                          aria-label="Оставить отзыв о заказе"
                        />
                      </VCardText>
                      <VCardActions class="mx-3">
                        <VBtn
                          color="primary"
                          :disabled="!reviewText.trim() || reviewRating == null"
                          variant="flat"
                          block
                          rounded
                          @click="submitReview"
                        >
                          Отправить отзыв
                        </VBtn>
                      </VCardActions>
                    </VCard>
                  </div>
                  <div
                    v-if="(chatStore.activeChat.status === 'pending' && !chatStore.activeChat.is_order_photo_sent && !orderSend) || showOrderForm"
                    class="mt-4"
                  >
                    <VCard
                      class="custom-dashed mx-auto py-6 px-4"
                      elevation="0"
                      max-width="345"
                      rounded="lg"
                    >
                      <VCardTitle
                        class="text-center font-weight-normal text-wrap pa-0 pb-3"
                        style="line-height: 1.4; font-size: 12px;"
                      >
                        Загрузите скриншот из кабинета Wildberries, на котором видно, что вы заказали этот товар.
                      </VCardTitle>
                      <VCardText
                        class="pa-0 mx-auto"
                        max-width="260"
                      >
                        <CustomFileInput
                          v-model="pendingFile"
                          :panding="pendingFile"
                        />
                        <VImg
                          v-if="pendingPreview"
                          :src="pendingPreview"
                          max-width="100"
                          width="100"
                          height="100"
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
                  <div v-if="(chatStore.activeChat.status === 'awaiting_receipt' && !chatStore.activeChat.is_review_photo_sent && !receiptSent) || showBarcode">
                    <div
                      class="mt-4 custom-dashed rounded-lg py-4 px-6 mx-auto"
                      style="max-width: 345px"
                    >
                      <VCard
                        class="mb-4 pa-0"
                        elevation="0"
                      >
                        <VCardTitle
                          class="text-center font-weight-regular text-base text-wrap pa-0"
                          style="line-height: 140%; font-size: 12px"
                        >
                          Загрузите фото на котором видно что вы порезали QR код на упаковке товара, чтобы не было возможности сдать товар обратно
                        </VCardTitle>
                        <VCardText
                          class="mt-4 text-center mx-auto pa-0"
                          max-width="260"
                        >
                          <CustomFileInput
                            v-model="barcodeFile"
                            :panding="barcodeFile"
                          />
                          <VImg
                            v-if="barcodePreview"
                            :src="barcodePreview"
                            max-width="100"
                            class="mb-4 rounded"
                            cover
                          />
                          <VBtn
                            variant="text"
                            color="#005AC5"
                            class="text-decoration-underline text-none mt-2"
                            style="font-size: 12px"
                            @click="examplePhoto = true"
                          >
                            Пример порезанного штрихкода
                          </VBtn>
                        </VCardText>
                      </VCard>
                      <VDivider />
                      <VCard
                        class="pa-0 mt-4 text-center"
                        elevation="0"
                      >
                        <VCardTitle
                          class="text-center font-weight-regular text-base text-wrap pa-0"
                          style="line-height: 140%; font-size: 12px"
                        >
                          Загрузите скриншот где видно, что вы оставили отзыв
                        </VCardTitle>
                        <VCardText
                          class="mt-4 pa-0"
                          max-width="260"
                        >
                          <CustomFileInput
                            v-model="reviewFile"
                            :panding="reviewFile"
                          />
                          <VImg
                            v-if="reviewPreview"
                            :src="reviewPreview"
                            max-width="100"
                            class="mb-4 rounded"
                            cover
                          />
                          <VBtn
                            variant="text"
                            color="#005AC5"
                            class="text-decoration-underline text-none my-2"
                            style="font-size: 12px"
                            @click="examplePhoto = true"
                          >
                            Пример скриншота с отзывом
                          </VBtn>
                        </VCardText>
                        <VCardActions
                          class="pa-0"
                          max-width="260"
                        >
                          <VBtn
                            color="primary text-base"
                            :disabled="!reviewFile || !barcodeFile"
                            variant="flat"
                            rounded
                            height="44"
                            size="large"
                            block
                            @click="correctPhotos = true"
                          >
                            Отправить
                          </VBtn>
                        </VCardActions>
                      </VCard>
                    </div>
                    <div class="d-flex justify-center my-3">
                      <p
                        class="cursor-pointer text-sm"
                        style="color: rgb(var(--v-theme-on-surface))"
                        @click="cancelItem = true"
                      >
                        Отменить заказ
                      </p>
                    </div>
                  </div>
                </PerfectScrollbar>
                <div
                  v-else
                  class="flex-grow-1 d-flex align-center justify-center"
                  style="height: 100%"
                >
                  <p class="text-field-error">
                    Нет сообщений
                  </p>
                </div>
              </div>
              <VForm
                v-if="chatStore.activeChat && (chatStore.activeChat.status === 'pending' && chatStore.activeChat.is_order_photo_sent || chatStore.activeChat.status === 'on_confirmation' && chatStore.activeChat.is_review_photo_sent || chatStore.activeChat.status === 'cashback_received' || (chatStore.activeChat.status === 'awaiting_receipt' && chatStore.activeChat.is_review_photo_sent) || receiptSent || orderSend)"
                class="pb-11 pt-4 px-5 border-t gap-3 d-flex justify-between align-center"
                @submit.prevent="sendMessage"
              >
                <VTextField
                  v-model="messageInput"
                  variant="outlined"
                  density="compact"
                  class="chat-message-input pa-0"
                  placeholder="Введите сообщение..."
                  autofocus
                  single-line
                  style="height: 44px"
                />
                <div class="d-flex gap-3 align-center">
                  <VTooltip text="Прикрепить файл (.jpg, .jpeg, .png)">
                    <template #activator="{ props: activatorProps }">
                      <VBtn
                        variant="outlined"
                        color="primary"
                        width="40"
                        height="40"
                        size="small"
                        v-bind="activatorProps"
                        @click="fileInput.click()"
                      >
                        <VIcon size="18" icon="ri-attachment-2" />
                      </VBtn>
                    </template>
                  </VTooltip>
                  <VBtn
                    width="40"
                    height="40"
                    :loading="sendingMessage"
                    @click="sendMessage"
                  >
                    <VIcon size="18" icon="ri-send-plane-line" />
                  </VBtn>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  name="file"
                  accept=".jpeg,.png,.jpg,GIF"
                  hidden
                >
              </VForm>
            </div>
            <div
              v-else
              class="d-flex align-center justify-center flex-column"
              style="height: 80dvh"
            >
              <VAvatar
                size="98"
                variant="tonal"
                color="primary"
                class="mb-4"
              >
                <VIcon
                  size="50"
                  class="rounded-0"
                  icon="ri-wechat-line"
                />
              </VAvatar>
              <VBtn
                v-if="$vuetify.display.smAndDown"
                rounded="pill"
                @click="backToChats"
              >
                Выберите чат
              </VBtn>
              <p
                v-else
                style="max-inline-size: 40ch; text-wrap: balance;"
                class="text-center text-disabled"
              >
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
            Нажимая кнопку ниже, вы подтверждаете, что заказали товар согласно инструкции продавца.
          </VCardText>
          <VCardActions class="d-flex flex-column pa-0">
            <VBtn
              block
              color="primary"
              variant="flat"
              class="mt-6"
              size="large"
              @click="handleConfirm"
            >
              Подтвердить
            </VBtn>
            <VBtn
              variant="outlined"
              color="secondary"
              block
              size="large"
              class="text-gray-900 mt-2"
              style="color: rgb(var(--v-theme-on-surface))"
              @click="confirmModal = false"
            >
              Отмена
            </VBtn>
          </VCardActions>
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
          <VCardActions class="d-flex flex-column pa-0">
            <VBtn
              block
              color="primary"
              variant="flat"
              class="mt-6"
              size="large"
              @click="handleCancel"
            >
              Подтвердить
            </VBtn>
            <VBtn
              variant="outlined"
              color="secondary"
              block
              size="large"
              class="text-gray-900 mt-2"
              style="color: rgb(var(--v-theme-on-surface))"
              @click="cancelItem = false"
            >
              Отмена
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model="correctPhotos"
        max-width="360"
      >
        <VCard class="py-5 px-4">
          <VCardTitle class="pa-0 pb-2">
            Подтверждение отправки
          </VCardTitle>
          <VCardText class="pa-0">
            Нажимая кнопку ниже, вы подтверждаете, что прикрепили корректные фото и видео материалы по инструкции продавца
          </VCardText>
          <VCardActions class="d-flex flex-column pa-0">
            <VBtn
              block
              color="primary"
              variant="flat"
              class="mt-6"
              size="large"
              @click="handleUpload"
            >
              Подтвердить
            </VBtn>
            <VBtn
              variant="outlined"
              color="secondary"
              block
              size="large"
              class="text-gray-900 mt-2"
              style="color: rgb(var(--v-theme-on-surface))"
              @click="correctPhotos = false"
            >
              Отмена
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model="imageModal"
        max-width="800"
        class="overflow-hidden"
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
      <VDialog  
        v-model="examplePhoto"
        max-width="500"
      >
        <VCard>
          <VImg
            src="https://basket-10.wbbasket.ru/vol1408/part140851/140851046/images/big/1.webp"
            contain
            max-height="400"
          />
          <VCardText>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa cum non recusandae neque molestiae nisi quis, sapiente sunt facilis dolorum.
          </VCardText>
          <VCardActions>
            <VSpacer />
            <VBtn
              color="primary px-3"
              variant="flat"
              @click="examplePhoto = false"
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
.custom-dashed {
  border: 1px dashed #C2C2C2;
}

.v-img__img {
  position: relative !important;
}
::v-deep(.custom-rating) {
  display: flex;
  gap: 8px;
}

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
@use "@styles/variables/vuetify.scss";
@use "@core/scss/base/mixins";
@use "vuetify/lib/styles/tools/states" as vuetifyStates;

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
    margin-top: 25px !important;
    min-height: 85vh !important;
  }
  .chat-list-sidebar {
    min-height: 91vh !important;
    margin-top: 30px !important;
  }
  .chat-log {
    min-height: 60vh !important;
  }
}

.msg-alert-text {
  color: #164582;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
}

.success-msg {
  background: #D1FADF;
  padding: 10px 35px;
  border-radius: 5px;
  margin-bottom: 10px;
  color: #000000cc !important;
}

.info-msg {
  background: #D1D7FA;
  border-radius: 5px;
  color: #000000 !important;
  max-width: 70%;
  padding: 10px 15px;
  margin-bottom: 10px;
}

.justify-between {
  justify-content: space-between;
}

.chat-list {
  height: 100%;
  overflow-y: auto;
}

.chat-contacts-list {
  --chat-content-spacing-x: 12px;
  height: 100%;
  padding-block-end: 0.75rem;

  .chat-contact-header {
    margin: .25rem .75rem;
  }

  .no-chat-items-text {
    margin-inline: var(--chat-content-spacing-x);
  }
}

.chat-contact {
  border-radius: 8px;
  padding-block: 8px;
  padding-inline: var(--chat-content-spacing-x);

  @include mixins.before-pseudo;
  @include vuetifyStates.states($active: false);

  &.chat-contact-active {
    @include mixins.elevation(2);
    background: rgb(var(--v-theme-primary));
    color: #fff;
    --v-theme-on-background: #fff;

    .v-avatar {
      background: #fff;
    }
  }

  .v-badge--bordered .v-badge__badge::after {
    color: #fff;
  }
}

.status-step {
  background: #fff;
  border-radius: 30px;
  padding: 5px;
}
</style>
