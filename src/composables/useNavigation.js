import { ref, computed } from 'vue'
import api from '@/api/index'
import Pusher from 'pusher-js'

export function useSellerNavigation() {
  const buybacks = ref(0)
  const currentUser = ref(null)
  let pusher = null

  const buybacksCount = async () => {
    try {
      const response = await api.buyback.buybacksCount()
      buybacks.value = response.count
    } catch (error) {
      console.error('Ошибка при получении количества бэкапов:', error)
    }
  }

  const initPusher = async () => {
    try {
      currentUser.value = await api.user.profile()

      pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        encrypted: true
      })

      const notificationChannelName = `notification-${currentUser.value.id}`
      const notificationChannel = pusher.subscribe(notificationChannelName)

      notificationChannel.bind('MessageSent', async () => {
        await buybacksCount()
      })
    } catch (error) {
      console.error('Ошибка инициализации Pusher:', error)
    }
  }

  // Инициализация
  buybacksCount()
  initPusher()

  const sellerNavItems = computed(() => [
    { heading: 'Продвижение' },
    {
      title: 'Товары',
      icon: { icon: 'ri-box-3-line' },
      to: 'dashboard-products'
    },
    {
      title: 'Объявления',
      icon: { icon: 'ri-advertisement-line' },
      to: 'dashboard-advertisements'
    },
    {
      title: 'Выкупы',
      icon: { icon: 'ri-shopping-cart-line' },
      to: 'dashboard-buybacks',
      badgeContent: buybacks,
      badgeClass: 'bg-primary',
    },
    { heading: 'Мой аккаунт' },
    {
      title: 'Профиль',
      icon: { icon: 'ri-user-line' },
      to: 'profile',
    },
    {
      title: 'Баланс',
      icon: { icon: 'ri-wallet-line' },
      to: 'balance',
    },
    {
      title: 'Партнерам',
      icon: { icon: 'ri-hand-heart-line' },
      to: 'dashboard-partners',
    },
    {
      title: 'Партнеры',
      icon: { icon: 'ri-gift-line' },
      to: 'dashboard-partners-list',
    },
    {
      title: 'Поддержка',
      icon: { icon: 'ri-headphone-line' },
      to: 'dashboard-support',
    }
  ])

  return {
    sellerNavItems
  }
}
