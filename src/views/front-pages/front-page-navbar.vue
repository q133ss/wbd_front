<script setup>
import { useWindowScroll } from '@vueuse/core'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useDisplay } from 'vuetify'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import navImg from '@images/front-pages/misc/nav-img.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const props = defineProps({
  activeId: {
    type: String,
    required: false,
  },
  navbarInitialOpacity: {
    type: Number,
    required: false,
    default: 0.64,
  },
})

const display = useDisplay()
const route = useRoute()
const router = useRouter()
const { y } = useWindowScroll()
const sidebar = ref(false)

watch(() => display, () => {
  return display.mdAndUp ? sidebar.value = false : sidebar.value
}, { deep: true })

const isMenuOpen = ref(false)

const menuItems = [
  {
    listTitle: 'Page',
    listIcon: 'ri-layout-grid-line',
    navItems: [
      {
        name: 'Pricing',
        to: { name: 'front-pages-pricing' },
      },
      {
        name: 'Payment',
        to: { name: 'front-pages-payment' },
      },
      {
        name: 'Checkout',
        to: { name: 'front-pages-checkout' },
      },
      {
        name: 'Help Center',
        to: { name: 'front-pages-help-center' },
      },
    ],
  },
  {
    listTitle: 'Auth Demo',
    listIcon: 'ri-lock-unlock-line',
    navItems: [
      {
        name: 'Login (Basic)',
        to: { name: 'pages-authentication-login-v1' },
      },
      {
        name: 'Login (Cover)',
        to: { name: 'pages-authentication-login-v2' },
      },
      {
        name: 'Register (Basic)',
        to: { name: 'pages-authentication-register-v1' },
      },
      {
        name: 'Register (Cover)',
        to: { name: 'pages-authentication-register-v2' },
      },
      {
        name: 'Register (Multi-steps)',
        to: { name: 'pages-authentication-register-multi-steps' },
      },
      {
        name: 'Forgot Password (Basic)',
        to: { name: 'pages-authentication-forgot-password-v1' },
      },
      {
        name: 'Forgot Password (Cover)',
        to: { name: 'pages-authentication-forgot-password-v2' },
      },
      {
        name: 'Reset Password (Basic)',
        to: { name: 'pages-authentication-reset-password-v1' },
      },
      {
        name: 'Reset Password (cover  )',
        to: { name: 'pages-authentication-reset-password-v2' },
      },
    ],
  },
  {
    listTitle: 'Other',
    listIcon: 'ri-image-line',
    navItems: [
      {
        name: 'Under Maintenance',
        to: { name: 'pages-misc-under-maintenance' },
      },
      {
        name: 'Coming Soon',
        to: { name: 'pages-misc-coming-soon' },
      },
      {
        name: 'Not Authorized',
        to: { path: '/not-authorized' },
      },
      {
        name: 'Verify Email (Basic)',
        to: { name: 'pages-authentication-verify-email-v1' },
      },
      {
        name: 'Verify Email (Cover)',
        to: { name: 'pages-authentication-verify-email-v2' },
      },
      {
        name: 'Two Steps (Basic)',
        to: { name: 'pages-authentication-two-steps-v1' },
      },
      {
        name: 'Two Steps (Cover)',
        to: { name: 'pages-authentication-two-steps-v2' },
      },
    ],
  },
]

const userData = useCookie('userData')
const accessToken = useCookie('accessToken')

const isLoggedIn = computed(() => !!(userData.value && accessToken.value))

const isCurrentRoute = to => {
  return route.matched.some(_route => _route.path.startsWith(router.resolve(to).path))

  // ℹ️ Below is much accurate approach if you don't have any nested routes

// return route.matched.some(_route => _route.path === router.resolve(to).path)
}

const isPageActive = computed(() => menuItems.some(item => item.navItems.some(listItem => isCurrentRoute(listItem.to))))
</script>

<template>
  <!-- 👉 Navigation drawer for mobile devices  -->
  <VNavigationDrawer
    v-model="sidebar"
    data-allow-mismatch
    disable-resize-watcher
  >
    <PerfectScrollbar
      :options="{ wheelPropagation: false }"
      class="h-100"
    >
      <!-- Nav items -->
      <div>
        <div class="d-flex flex-column gap-y-4 pa-4">
          <RouterLink
            to="/"
            class="text-body-1 font-weight-medium nav-link px-0"
          >
            Главная
          </RouterLink>

          <RouterLink
            to="/categories"
            class="text-body-1 font-weight-medium nav-link px-0"
          >
            Категории
          </RouterLink>

          <RouterLink
            to="/favorites"
            class="text-body-1 font-weight-medium nav-link px-0"
          >
            Избранное
          </RouterLink>
        </div>
      </div>
      <!-- Navigation drawer close icon -->
      <VIcon
        id="navigation-drawer-close-btn"
        icon="ri-close-line"
        size="20"
        @click="sidebar = !sidebar"
      />
    </PerfectScrollbar>
  </VNavigationDrawer>

  <!-- 👉 Navbar for desktop devices  -->
  <div class="front-page-navbar">
    <VAppBar
      :class="y > 20 ? 'front-page-navbar-box-shadow' : ''"
      :border="y < 20 ? '1px solid rgba(var(--v-theme-surface), 0.78)' : 'none'"
      elevation="0"
      class="rounded-b-xl"
      :style="y > 20 ? '' : `background-color: rgba(var(--v-theme-surface),${props.navbarInitialOpacity})`"
      height="62"
    >
      <!-- toggle icon for mobile device -->
      <VAppBarNavIcon
        :class="$vuetify.display.mdAndUp ? 'd-none' : 'd-inline-block'"
        class="ms-0 me-1"
        color="high-emphasis"
        @click="() => sidebar = !sidebar"
      />

      <!-- Title and Landing page sections -->
      <div class="d-flex align-center">
        <VAppBarTitle class="me-3 me-sm-6">
          <RouterLink
            to="/"
            class="d-flex gap-x-4"
            :class="$vuetify.display.mdAndUp ? 'd-none' : 'd-block'"
          >
            <div class="d-flex gap-x-3 align-center">
              <VNodeRenderer :nodes="themeConfig.app.logo" />

              <div
                class="nav-title text-truncate"
                :class="[$vuetify.display.lgAndUp ? 'd-block' : 'd-none', $vuetify.display.mdAndUp ? 'd-none' : 'd-block']"
              >
                {{ themeConfig.app.title }}
              </div>
            </div>
          </RouterLink>
        </VAppBarTitle>

        <!-- landing page sections -->
        <div
          :class="$vuetify.display.mdAndUp ? 'd-flex' : 'd-none'"
          class="text-base align-center gap-x-2"
        >
          <!-- Pages Menu -->
          <RouterLink
            to="/categories"
            class="nav-link font-weight-medium"
          >
            Категории
          </RouterLink>
          <RouterLink
            to="/favorites"
            class="nav-link font-weight-medium"
          >
            Избранное
          </RouterLink>
        </div>
      </div>

      <VSpacer />

      <div class="d-flex gap-x-4 align-center">
        <NavbarThemeSwitcher class="me-0 me-sm-2" />

        <VBtn
          v-if="$vuetify.display.lgAndUp"
          :prepend-icon="isLoggedIn ? 'ri-user-line' : 'ri-login-box-line'"
          variant="elevated"
          color="primary"
          :href="isLoggedIn ? '/profile' : '/login'"
          rel="noopener noreferrer"
        >
          {{ isLoggedIn ? 'Профиль' : 'Войти' }}
        </VBtn>

        <VBtn
          v-else
          icon
          rounded
          variant="elevated"
          color="primary"
          href="https://1.envato.market/materialize_admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          <VIcon icon="ri-shopping-cart-line" />
        </VBtn>
      </div>
    </VAppBar>
  </div>
</template>

<style lang="scss" scoped>
.front-page-navbar-box-shadow {
  /* stylelint-disable-next-line max-line-length */
  box-shadow: 0 4px 8px -4px rgba(var(--v-shadow-key-umbra-color), 42%) !important;
}

.nav-menu {
  display: flex;
  gap: 3rem;
}

.nav-title {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity)) !important;
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  text-transform: capitalize;
}

.nav-link {
  padding-inline: 0.625rem;

  &:not(:hover) {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  }
}

@media (min-width: 1920px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(1440px - 32px);
    }
  }
}

@media (min-width: 1280px) and (max-width: 1919px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(1200px - 32px);
    }
  }
}

@media (min-width: 960px) and (max-width: 1279px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(900px - 32px);
    }
  }

  .nav-menu {
    gap: 2rem;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(100% - 62px);
    }
  }
}

@media (max-width: 600px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(100% - 32px);
    }
  }
}

.nav-item-img {
  border: 10px solid rgb(var(--v-theme-background));
  border-radius: 10px;
}

.active-link {
  color: rgb(var(--v-theme-primary)) !important;
}

.mega-menu-item {
  &:not(:hover) {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  }
}
</style>

<style lang="scss">
@use "@layouts/styles/mixins" as layoutMixins;

.mega-menu {
  position: fixed !important;
  inset-block-start: 4.1rem;
  inset-inline-start: 50%;
  transform: translateX(-50%);

  @include layoutMixins.rtl {
    transform: translateX(50%);
  }
}

.front-page-navbar {
  .v-toolbar__content {
    padding-inline: 2rem !important;
  }

  .v-toolbar {
    inset-inline: 0 !important;
    margin-inline: auto !important;
  }
}

#navigation-drawer-close-btn {
  position: absolute;
  cursor: pointer;
  inset-block-start: 0.5rem;
  inset-inline-end: 1rem;
}

@media (max-width: 600px) {
  .front-page-navbar {
    .v-toolbar__content {
      padding-inline: 0.75rem !important;
    }
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .front-page-navbar {
    .v-toolbar__content {
      padding-inline: 1rem !important;
    }
  }
}
</style>
