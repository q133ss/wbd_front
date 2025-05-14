<script setup>
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import Pusher from 'pusher-js'
import { useSnackbarStore } from '@/stores/snackbar'
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api from '@/api'

const snackbar = useSnackbarStore()
const router = useRouter()

const notifications = ref([])
const user = ref(null)
const pusher = ref(null)
const channel = ref(null)
const isLoading = ref(true)

const props = defineProps({
  badgeProps: {
    type: Object,
    required: false,
    default: undefined,
  },
  location: {
    type: String,
    required: false,
    default: 'bottom end',
  },
})

const emit = defineEmits(['read', 'unread', 'remove', 'click:notification'])

const isAllMarkRead = computed(() => notifications.value.some(item => !item.is_read))
const totalUnreadNotifications = computed(() => notifications.value.filter(item => !item.is_read).length)

// Fetch user profile
const fetchUserProfile = async () => {
  try {
    const response = await api.user.profile()
    user.value = response
    if (user.value.id) {
      setupPusher()
    } else {
      snackbar.notify({ text: 'Ошибка: ID пользователя отсутствует', color: 'error' })
    }
  } catch (error) {
    snackbar.notify({ text: 'Ошибка при загрузке профиля', color: 'error' })
  }
}

// Fetch initial notifications
const fetchNotifications = async () => {
  try {
    const response = await api.notification.list()
    notifications.value = Array.isArray(response) ? response : []
  } catch (error) {
    snackbar.notify({ text: 'Ошибка при загрузке уведомлений', color: 'error' })
    notifications.value = []
  } finally {
    isLoading.value = false
  }
}

// Setup Pusher connection
const setupPusher = () => {
  try {
    pusher.value = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true,
    })

    const channelName = `notification-${user.value.id}`
    channel.value = pusher.value.subscribe(channelName)

    channel.value.bind('MessageSent', (data) => {
      if (data && data.subtitle) {
        const notification = {
          id: data.id,
          user_id: user.value.id,
          buyback_id: data.buyback_id || null, // Note: Backend should include buyback_id for navigation
          text: data.subtitle,
          is_read: false,
          created_at: data.date || new Date().toISOString(),
          updated_at: data.date || new Date().toISOString(),
        }
        notifications.value.unshift(notification)
        snackbar.notify({ text: notification.text, color: 'info' })
      }
    })
  } catch (error) {
    snackbar.notify({ text: 'Ошибка при настройке уведомлений', color: 'error' })
  }
}

// Handle notification click
const handleNotificationClick = async (notification) => {
  emit('click:notification', notification)
  if (notification.buyback_id) {
    try {
      await router.push(`/dashboard/buybacks/${notification.buyback_id}`)
    } catch (error) {
      snackbar.notify({ text: 'Ошибка при переходе к выкупу', color: 'error' })
    }
  } else {
    snackbar.notify({ text: 'Это уведомление не связано с выкупом', color: 'info' })
  }
  if (!notification.is_read) {
    try {
      // Try array format first
      await api.notification.markAsRead([notification.id])
      notification.is_read = true
      emit('read', [notification.id])
    } catch (error) {
      console.error('Mark as read error:', {
        notificationId: notification.id,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      let errorMessage = 'Ошибка при отметке уведомления как прочитанного'
      if (error.response?.status === 404) {
        errorMessage = 'API для отметки уведомлений не найдено'
      } else if (error.response?.status === 422) {
        errorMessage = 'Неверный формат данных для отметки уведомления'
        // Try alternative payload format
        try {
          await api.notification.markAsRead({ ids: [notification.id] })
          notification.is_read = true
          emit('read', [notification.id])
          return
        } catch (altError) {
          console.error('Alternative payload error:', altError)
        }
      }
      snackbar.notify({ text: errorMessage, color: 'error' })
    }
  }
}

// Mark all notifications as read/unread
const markAllReadOrUnread = async () => {
  const allNotificationsIds = notifications.value.map(item => item.id)
  if (!isAllMarkRead.value) {
    snackbar.notify({ text: 'Отметка как непрочитанные не поддерживается', color: 'warning' })
    emit('unread', allNotificationsIds)
  } else {
    try {
      await api.notification.markAsRead(allNotificationsIds)
      notifications.value.forEach(notification => {
        notification.is_read = true
      })
      emit('read', allNotificationsIds)
      snackbar.notify({ text: 'Все уведомления отмечены как прочитанные', color: 'success' })
    } catch (error) {
      console.error('Mark all as read error:', {
        notificationIds: allNotificationsIds,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      let errorMessage = 'Ошибка при отметке уведомлений'
      if (error.response?.status === 404) {
        errorMessage = 'API для отметки уведомлений не найдено'
      } else if (error.response?.status === 422) {
        errorMessage = 'Неверный формат данных для отметки уведомлений'
        // Try alternative payload format
        try {
          await api.notification.markAsRead({ ids: allNotificationsIds })
          notifications.value.forEach(notification => {
            notification.is_read = true
          })
          emit('read', allNotificationsIds)
          snackbar.notify({ text: 'Все уведомления отмечены как прочитанные', color: 'success' })
          return
        } catch (altError) {
          console.error('Alternative payload error:', altError)
        }
      }
      snackbar.notify({ text: errorMessage, color: 'error' })
    }
  }
}

onMounted(async () => {
  await fetchUserProfile()
  await fetchNotifications()
})

onUnmounted(() => {
  if (channel.value) {
    channel.value.unbind()
    pusher.value.unsubscribe(`notification-${user.value?.id}`)
  }
  if (pusher.value) {
    pusher.value.disconnect()
  }
})
</script>

<template>
  <IconBtn v-if="!isLoading" id="notification-btn">
    <VBadge
      dot
      v-bind="props.badgeProps"
      :model-value="notifications.some(n => !n.is_read)"
      color="error"
      bordered
      offset-x="1"
      offset-y="1"
      class="notification-badge"
    >
      <VIcon icon="ri-notification-2-line" />
    </VBadge>

    <VMenu
      activator="parent"
      width="380"
      :location="props.location"
      offset="15px"
      :close-on-content-click="false"
    >
      <VCard class="d-flex flex-column">
        <VCardItem class="notification-section">
          <h6 class="text-h6 text-truncate">
            Уведомления
            <span v-if="totalUnreadNotifications">({{ totalUnreadNotifications }})</span>
          </h6>
        </VCardItem>

        <VDivider />

        <PerfectScrollbar
          :options="{ wheelPropagation: false }"
          style="max-block-size: 27rem;"
        >
          <VList class="py-0">
            <template v-for="(notification, index) in notifications" :key="notification.id">
              <VDivider v-if="index > 0" />
              <VListItem
                :link="!!notification.buyback_id"
                lines="one"
                min-height="66px"
                class="list-item-hover-class py-3 px-4"
                @click="handleNotificationClick(notification)"
              >
                <div class="d-flex align-start gap-3">
                  <VAvatar
                    size="40"
                    :color="notification.color && !user?.avatar ? notification.color : undefined"
                    :variant="user?.avatar ? undefined : 'tonal'"
                  >
                    <span v-if="notification.text">{{
                        avatarText ? avatarText(notification.text) : notification.text.charAt(0).toUpperCase()
                      }}</span>
                    <VImg v-if="user?.avatar" :src="user.avatar" />
                  </VAvatar>

                  <div>
                    <div class="text-body-2 text-high-emphasis font-weight-medium mb-1">
                      {{ notification.text }}
                    </div>
                    <p
                      class="text-caption mb-0"
                      style="letter-spacing: 0.4px !important; line-height: 18px;"
                    >
                      {{ notification.created_at ? new Date(notification.created_at).toLocaleString() : '—' }}
                    </p>
                  </div>

                  <VSpacer />

                  <div class="d-flex flex-column align-end gap-2">
                    <VIcon
                      :color="!notification.is_read ? 'primary' : 'secondary'"
                      :class="`${notification.is_read ? 'visible-in-hover' : ''} ms-1`"
                      size="10"
                      icon="ri-circle-fill"
                      @click.stop="$emit(notification.is_read ? 'unread' : 'read', [notification.id])"
                    />
                  </div>
                </div>
              </VListItem>
            </template>

            <VListItem
              v-show="!notifications.length"
              class="text-center text-medium-emphasis"
              style="block-size: 56px;"
            >
              <VListItemTitle>Нет уведомлений!</VListItemTitle>
            </VListItem>
          </VList>
        </PerfectScrollbar>

        <VDivider />

        <VCardText v-show="notifications.length" class="pa-4">
          <VBtn block size="small" @click="markAllReadOrUnread">
            {{ isAllMarkRead ? 'Отметить все как прочитанные' : 'Отметить все как непрочитанные' }}
          </VBtn>
        </VCardText>
      </VCard>
    </VMenu>
  </IconBtn>
</template>

<style lang="scss">
.notification-section {
  padding-block: 12px !important;
  padding-inline: 16px !important;
}

.list-item-hover-class {
  .visible-in-hover {
    display: none;
  }

  &:hover {
    .visible-in-hover {
      display: block;
    }
  }
}

.notification-badge {
  &.v-badge--bordered.v-badge--dot .v-badge__badge::after {
    color: rgb(var(--v-theme-background));
  }
}
</style>
