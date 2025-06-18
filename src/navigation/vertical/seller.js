import api from '@/api/Index'
import Pusher from 'pusher-js'
import { ref } from 'vue'

const buybacks = ref(0)

const buybacksCount = async () => {
  try {
    const response = await api.buyback.buybacksCount()
    buybacks.value = response.count
    console.log('Buybacks count:', buybacks.value)
  } catch (error) {
    console.error('Ошибка при получении количества бэкапов:', error)
  }
}

buybacksCount()

// Уведомления

const currentUser = ref(null)
currentUser.value = await api.user.profile()

// Инициализация Pusher
const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  encrypted: true
})
const notificationChannelName = `notification-${currentUser.value.id}`
const notificationChannel = pusher.subscribe(notificationChannelName)

// Обработчики событий
notificationChannel.bind('MessageSent', async (notification) => {
  await buybacksCount()
})

export default [
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
    icon: { icon: 'ri-gift-line' },
    to: 'dashboard-partners',
  },
  {
    title: 'Поддержка',
    icon: { icon: 'ri-headphone-line' },
    to: 'dashboard-support',
  }
]
