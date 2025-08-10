import { ref, computed } from 'vue'
import api from '@/api/index'
import Pusher from 'pusher-js'

export function useBuyerNavigation() {
  const buybacks = ref(0)
  const currentUser = ref(null)
  let pusher = null
  
  const buybacksCount = async () => {
    try {
      const response = await api.buyback.buyerBuybacksCount()

      buybacks.value = response.count   
      console.log(buybacks.value);      
    } catch (error) {
      console.error('Ошибка при получении количества бэкапов:', error)
    }
  }
  
  const initPusher = async () => {
    try {
      currentUser.value = await api.user.profile()
  
      pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
        cluster: import.meta.env.VITE_PUSHER_CLUSTER,
        encrypted: true,
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


  const buyerNavItem = computed(()=> [
    { heading: 'Мой аккаунт' },

    {
      title: 'Главная',
      icon: { icon: 'ri-home-line' },
      to: 'index',
    },
    {
      title: 'Категории',
      icon: { icon: 'ri-list-check' },
      to: 'categories',
    },
    {
      title: 'Профиль',
      icon: { icon: 'ri-user-line' },
      to: 'profile',
    },
    {
      title: 'Мои заказы',
      icon: { icon: 'ri-shopping-bag-line' },
      to: 'dashboard-orders',
      badgeContent: buybacks,
      badgeClass: 'bg-primary',
    },
    {
      title: 'Избранное',
      icon: { icon: 'ri-heart-line' },
      to: 'favorites',
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
    },
  ])

  
  return {
    buyerNavItem,
  }
} 
