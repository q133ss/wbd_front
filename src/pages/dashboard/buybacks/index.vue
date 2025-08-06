<script setup>
import api from '@/api/Index'
import { useSnackbarStore } from '@/stores/snackbar'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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
const { fetchChats, selectStatus, selectChat, setupNotificationChannel, cleanupPusher, scrollToBottom } = useChat(chatLogPS, updateStatusTimer)
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
const pendingScreen = ref(null)
const showUploadScreen = ref(false)
const isRejectVisible = ref(false)
const sendReview = ref(false)
const hasSubmittedReview = ref(false)

const confirmationMessage = `Продавец получил подтверждение вашего заказа.<br>
Он проверит фотографию - если заказ сделан корректно, то все в порядке и сделка продолжится автоматически. Если вы загрузили некорректную фотографию или заказали не тот товар, то Продавец вправе отменить вашу заявку. Вы получите соответствующее уведомление об этом`

const getScreenSentStatus = chatId => {
  const sentStatus = localStorage.getItem('screenSentStatus')
  if (sentStatus) {
    const parsed = JSON.parse(sentStatus)
    
    return parsed[String(chatId)] || false
  }
  
  return false
}

const setScreenSentStatus = (chatId, status) => {
  const sentStatus = localStorage.getItem('screenSentStatus')
  const parsed = sentStatus ? JSON.parse(sentStatus) : {}

  parsed[String(chatId)] = status
  localStorage.setItem('screenSentStatus', JSON.stringify(parsed))
}

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
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} дн. назад`
  
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
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
  if (status === 'cashback_received' || status === 'awaiting_payment_confirmation') return 4
  if (['completed', 'order_expired', 'cancelled'].includes(status)) return 5
  
  return ''
})

const alertType = computed(() => {
  if (!chatStore.activeChat) return ''
  const status = chatStore.activeChat.status
  if (status === 'pending') return '#6941C6'
  if (status === 'awaiting_receipt') return '#4F91FF'
  if (status === 'on_confirmation') return '#DC6803'
  if (status === 'awaiting_payment_confirmation') return '#12B76A'
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
  confirmModal.value = false

  const success = await uploadPendingFile()
  if (success) {
    snackbar.notify({ text: 'Файл успешно загружен', color: 'success' })
  }
}

const handleCancel = async () => {
  cancelItem.value = false

  const success = await cancelOrder()
  if (success) {
    snackbar.notify({ text: 'Заказ успешно отменен', color: 'success' })
  }
}

const handleUpload = async () => {
  correctPhotos.value = false

  const success = await uploadConfirmationFiles()
  if (success) {
    snackbar.notify({ text: 'Файлы успешно загружены', color: 'success' })
  }
}

const uploadScreen = async () => {
  if (!pendingScreen.value) {
    snackbar.notify({ text: 'Пожалуйста, выберите файл для загрузки', color: 'error' })
    
    return
  }
  try {
    console.log('Uploading screen for chat ID:', chatStore.activeChat.id)

    const response = await api.buyback.sendScreen(chatStore.activeChat.id, pendingScreen.value)

    console.log('Upload screen response:', response)
    snackbar.notify({ text: 'Скриншот заказа отправлен', color: 'success' })
    showUploadScreen.value = false
    setScreenSentStatus(chatStore.activeChat.id, true)
    pendingScreen.value = null
    await selectChat(chatStore.activeChat)
  } catch (error) {
    console.error('Error uploading screen:', error)
    snackbar.notify({
      text: error.response?._data?.message || 'Ошибка при отправке скриншота',
      color: 'error',
    })
  }
}

const handleSubmitReview = async () => {
  try {
    const success = await submitReview()
    if (success) {
      hasSubmittedReview.value = true 
      snackbar.notify({ text: 'Отзыв успешно отправлен', color: 'success' })
      reviewText.value = ''
      reviewRating.value = null
    }
  } catch (error) {
    console.error('Error submitting review:', error)
    snackbar.notify({
      text: error.response?._data?.message || 'Ошибка при отправке отзыва',
      color: 'error',
    })
  }
}

const openInfo = () => {
  infoProduct.value = false
  confirmModal.value = false
  cancelItem.value = false
  correctPhotos.value = false
  imageModal.value = false
  examplePhoto.value = false
  infoProduct.value = true
}

// Следим за сменой чата
watch(() => chatStore.activeChat?.id, newChatId => {
  if (newChatId) {
    showUploadScreen.value =
      chatStore.activeChat?.status === 'on_confirmation' &&
      !getScreenSentStatus(newChatId)
    pendingScreen.value = null
    hasSubmittedReview.value = false
  }
})

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
        await selectChat(chat)
        showUploadScreen.value =
          chat.status === 'on_confirmation' &&
          !getScreenSentStatus(chatId)
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
                label="Товары"
                variant="outlined"
                density="compact"
                class="px-2"
                :menu-props="{ maxHeight: 'none' }"
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
              <VSelect
                v-model="chatStore.selectedStatus"
                :items="chatStore.statuses"
                item-title="title"
                item-value="slug"
                label="Статус"
                variant="outlined"
                density="compact"
                class="px-2 mt-3"
                :menu-props="{ maxHeight: 'none' }"
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
                      <VListItem @click="openInfo">
                        <VListItemTitle>Информация о выкупе</VListItemTitle>
                      </VListItem>
                      <VListItem @click="openSupport">
                        <VListItemTitle>Поддержка</VListItemTitle>
                      </VListItem>
                      <VListItem @click="cancelItem = true">
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
                    <template v-if="message.type === 'system' && ['success', 'info'].includes(message.system_type) && message.hide_for !== 'seller'">
                      <div class="w-100 text-caption text-center text-disabled mb-2">
                        {{ new Date(message.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }} в {{ new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}
                      </div>
                      <div
                        v-if="message.text === 'Подтвердите получение кэшбека. Если вы не получили кэшбек, свяжитесь с продавцом в этом чате. Если возник спор или продавец не отвечает, напишите в поддержку и мы решим вопрос'"
                        class="w-100 text-center d-flex justify-center"
                        style="font-size: 12px; line-height: 1.4; border-radius: 5px"
                      >
                        <div class="info-msg">
                          У покупателя есть 24 часа чтобы подтвердить получение кэшбека. Если покупатель не подтвердит получение в течение установленного срока, то сделка будет завершена автоматически
                        </div>
                      </div>
                      <div
                        v-else-if="message.text === 'У продавца есть 24 часа чтобы проверить ваши материалы и подтвердить получение кэшбека. Если по истечению времени перевод не будет получен, свяжитесь с продавцом в этом чате, а так же с поддержкой через три точки в верхнем меню чата'"
                        class="w-100 text-center d-flex justify-center"
                        style="font-size: 12px; line-height: 1.4; border-radius: 5px"
                      >
                        <div class="info-msg">
                          У вас есть 24 часа чтобы проверить материалы покупателя (порезанный ШК + скрин отзыва) и отправить кэшбек покупателю по реквизитам в чате. Просим соблюсти установленные сроки выплаты кэшбека.
                        </div>
                      </div>
                      <div
                        v-else-if="message.text === confirmationMessage"
                        class="w-100 text-center d-flex justify-center"
                        style="font-size: 12px; line-height: 1.4; border-radius: 5px"
                      >
                        <div class="info-msg">
                          Покупатель прислал скрин из ЛК WB c подтверждение заказа вашего товара. <br>
                          Если все в порядке, то просто игнорируйте это сообщение, и сделка продолжится автоматически. Если покупатель загрузил некорректную фотографию или заказал не ваш товар, то вы вправе отменить заказ
                        </div>
                      </div>
                      <div
                        v-else
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
                    <div v-if="message.type === 'comment' && chatStore.activeChat?.status === 'cashback_received' && parseInt(message.color) <= 5 && message.sender_id !== chatStore.currentUser?.id">
                      <VCard
                        class="py-7 px-8 border mx-auto"
                        max-width="372"
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
                          Отзыв покупателя
                        </VCardTitle>
                        <VCardText class="pa-0">
                          {{ message.text }}
                        </VCardText>
                      </VCard>
                    </div>
                    <div v-if="message.type === 'comment' && chatStore.activeChat?.status === 'cashback_received' && parseInt(message.color) <= 5 && message.sender_id === chatStore.currentUser?.id">
                      <VCard
                        class="py-7 px-8 border mx-auto"
                        max-width="372"
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
                    <div
                      v-else-if="message.type !== 'system' && message.type !== 'comment'"
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
                            v-if="message.sender_id !== chatStore.currentUser?.id"
                            :src="chatStore.activeChat.ad.product?.images?.[0] || 'https://via.placeholder.com/48'"
                            :alt="chatStore.activeChat.user.name"
                            alt="avatar"
                            cover
                          />
                          <span v-else>{{ chatStore.activeChat.user.name[0] }}</span>
                        </VAvatar>
                      </div>
                      <template v-if="message.type === 'image' && message.files && message.files.length > 0">
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
                  {{ console.log(chatStore.activeChat) }}
                  <div
                    v-if="chatStore.activeChat?.status === 'cashback_received' && !chatStore.activeChat?.has_review_by_seller && !hasSubmittedReview"
                    class="mt-4"
                  >
                    <VCard
                      class="pa-3 mb-4 border"
                      elevation="0"
                      rounded="lg"
                    >
                      <VCardTitle class="text-h6 text-lg d-flex align-center px-5">
                        Отзыв о покупателе
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
                          @click="handleSubmitReview"
                        >
                          Отправить отзыв
                        </VBtn>
                      </VCardActions>
                    </VCard>
                  </div>
                  <div
                    v-if="chatStore.activeChat.status === 'on_confirmation' && showUploadScreen"
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
                        Загрузите скриншот перевода средств по указанным реквизитам
                      </VCardTitle>
                      <VCardText
                        class="pa-0 mx-auto"
                        max-width="260"
                      >
                        <CustomFileInput
                          v-model="pendingScreen"
                          :panding="pendingScreen"
                        />
                      </VCardText>
                      <VCardActions class="pa-0 mt-4">
                        <VBtn
                          :disabled="!pendingScreen"
                          :loading="isSubmittingReview"
                          variant="flat"
                          color="primary"
                          block
                          size="large"
                          rounded
                          @click="uploadScreen"
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
                  style="height: 100%"
                >
                  <p class="text-field-error">
                    Нет сообщений
                  </p>
                </div>
              </div>
              <VForm
                v-if="chatStore.activeChat"
                class="pt-4 px-5 border-t gap-3 d-flex justify-between align-center"
                :class="$vuetify.display.smAndDown ? 'pb-4' : 'pb-11'"
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
                        width="42"
                        height="42"
                        size="small"
                        v-bind="activatorProps"
                        @click="fileInput.click()"
                      >
                        <VIcon
                          size="18"
                          icon="ri-attachment-2"
                        />
                      </VBtn>
                    </template>
                  </VTooltip>
                  <VBtn
                    width="42"
                    height="42"
                    :loading="sendingMessage"
                    @click="sendMessage"
                  >
                    <VIcon
                      size="18"
                      icon="ri-send-plane-line"
                    />
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
              :loading="isSubmittingReview"
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
            Вы можете отменить заказ по любой причине, где покупатель нарушает правила исполнения заказа. В случае выявления неправомерной отмены заказа в процессе выкупа товара покупателем, на ваш аккаунт могут быть наложены ограничения.  
          </VCardText>
          <VCardActions class="d-flex flex-column pa-0">
            <VBtn
              block
              color="primary"
              variant="flat"
              class="mt-6"
              size="large"
              :loading="isSubmittingReview"
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
              :loading="isSubmittingReview"
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
      <VDialog
        v-model="infoProduct"
        max-width="300"
      >
        <VCard
          max-width="300"
          class="py-4 px-6"
        >
          <div class="d-flex">
            <VSpacer />
            <IconBtn
              color="secondary relative"
              style="right: -5px; top: -5px;"
              @click="infoProduct = false"
            >
              <VIcon
                width="12"
                height="12"
                icon="ri-close-fill"
              />
            </IconBtn>
          </div>
          <VCardTitle class="pa-0 text-body-1 font-weight-bold">
            Заказ #739923
          </VCardTitle>
          <VCardText class="pa-0 mt-1">
            <RouterLink
              to="#"
              class="text-decoration-underline text-wrap text-info"
            >
              {{ chatStore?.activeChat.ad.product.name }}
            </RouterLink>
            <p class="pt-3 pb-6 text-body-2 font-weight-medium">
              Продавец:             
              <RouterLink
                to="#"
                class="text-decoration-underline text-wrap text-info"
              >
                {{ chatStore?.activeChat.ad.shop.wb_name }}
              </RouterLink>
            </p>
            <div class="d-flex text-body-2 justify-between gap-2 ">
              <span>Размер скидки:</span>
              <VChip
                color="error"
                class="px-0"
              >
                {{ chatStore?.activeChat.cashback_percentage }}%
              </VChip>
            </div>
            <div class="d-flex text-body-2 justify-between gap-2 mt-3 mr-3  mb-2">
              <span>Цена на Wildberries:</span>
              <p class="text-secondary text-decoration-line-through">
                {{ chatStore?.activeChat.product_price }}₽
              </p>
            </div>
            <div class="d-flex text-body-2 justify-between gap-2 mr-3 mb-5">
              <span>Размер скидки:</span>
              <p class="text-primary">
                {{ Math.round(chatStore?.activeChat.product_price - chatStore?.activeChat.price_with_cashback) }}₽
              </p>
            </div>
          </VCardText>
          <VCardActions class="pa-0 d-flex flex-column">
            <VBtn
              block
              color="primary"
              variant="flat"
              class="mb-1"
              size="large"
              @click="openSupport"
            >
              Поддержка
            </VBtn>
            <VBtn
              block
              variant="text"
              color="error"
              class="text-decoration-underline"
              @click="cancelItem = true"
            >
              Отменить заказ
            </VBtn>
          </VCardActions>
        </VCard>
      </VDialog>
      <VDialog
        v-model="isRejectVisible"
        max-width="500"
      >
        <VCard
          title="Отклонение подтверждения"
          width="343"
          class="pt-2 px-2 pb-5"
        >
          <VCardText class="py-2">
            <span>
              Пожалуйста, напишите комментарий к вашему решению, чтобы покупатель смог исправить ошибки.
            </span>
            <p class="h6 font-weight-bold pt-3">
              Комментарий
            </p>
            <VTextarea
              v-model="comment"
              class="mt-5"
              variant="outlined"
            />
            <VBtn
              color="primary"
              class="w-100 mt-4"
              :loading="isSubmittingReview"
              @click="rejectFile"
            >
              Отклонить
            </VBtn>
            <VBtn
              color="secondary"
              variant="outlined"
              class="w-100 mt-3"
              @click="isRejectVisible = false"
            >
              Назад
            </VBtn>
          </VCardText>
        </VCard>
      </VDialog>
    </div>
  </div>
</template>

<style>
.custom-dashed {
  border: 1px dashed #C2C2C2 !important;
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
  width: 80%;
  max-width: 500px;
  margin-bottom: 10px;
  color: #000000cc !important;
}

.info-msg {
  background: #D1D7FA;
  border-radius: 5px;
  color: #000000 !important;
  width: 80%;
  max-width: 500px;
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
