export const setupGuards = router => {
  // 👉 router.beforeEach
  // Docs: https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards
  router.beforeEach(to => {
    /**
         * Check if user is logged in by checking if token & user data exists in local storage
         * Feel free to update this logic to suit your needs
         */
    const user = useCookie('userData').value
    const token = useCookie('accessToken').value
    const isLoggedIn = !!user && !!token

    if (isLoggedIn) {
      // Проверка роли и настройки профиля
      if (user.role.slug === 'seller' && user.is_configured === 0) {
        // Если пользователь не на странице настройки профиля, перенаправляем
        console.log(to.fullPath)
        if (to.fullPath !== '/profile/setup') {
          return '/profile/setup'
        }
      }
    }

    /*
     * If it's a public route, continue navigation. This kind of pages are allowed to visited by login & non-login users. Basically, without any restrictions.
     * Examples of public routes are, 404, under maintenance, etc.
     */
    if (to.meta.public)
      return

    /*
          If user is logged in and is trying to access login like page, redirect to home
          else allow visiting the page
          (WARN: Don't allow executing further by return statement because next code will check for permissions)
         */
    if (to.meta.unauthenticatedOnly) {
      if (isLoggedIn)
        return '/'
      else
        return undefined
    }

    if (to.meta.authRequired) {
      if (!isLoggedIn) {
        return '/login'
      }
    }
  })
}
