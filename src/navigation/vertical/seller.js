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
    badgeContent: '5',
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
    to: 'dashboard-balance',
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
