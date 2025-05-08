export default [
  { heading: 'Мой аккаунт' },
  {
    title: 'Профиль',
    icon: { icon: 'ri-user-line' },
    to: 'profile',
  },
  {
    title: 'Баланс',
    icon: { icon: 'ri-wallet-line' },
    to: 'dashboard-balance',
  },
  {
    title: 'Поддержка',
    icon: { icon: 'ri-headphone-line' },
    to: 'dashboard-support',
  },
  {
    title: 'Уведомления',
    icon: { icon: 'ri-notification-line' },
    to: 'dashboard-notifications',
    badgeContent: '5',
    badgeClass: 'bg-primary',
  },
]
