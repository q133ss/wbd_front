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

const userData = useCookie('userData')
const accessToken = useCookie('accessToken')

const isLoggedIn = computed(() => !!(userData.value && accessToken.value))

const isCurrentRoute = to => {
  return route.matched.some(_route => _route.path.startsWith(router.resolve(to).path))

  // ℹ️ Below is much accurate approach if you don't have any nested routes

// return route.matched.some(_route => _route.path === router.resolve(to).path)
}
</script>

<template>
  <!-- 👉 Navigation drawer for mobile devices  -->
  <VNavigationDrawer
    v-model="sidebar"
    data-allow-mismatch
    disable-resize-watcher
    :class="['mobile-nav-menu', { 'mobile-nav-menu--active': sidebar }]"
  >
    <PerfectScrollbar
      :options="{ wheelPropagation: false }"
      class="h-100"
    >
      <!-- Nav items -->
      <div>

        <div class="d-flex pa-4 mt-3 gap-x-3 align-center menu-logo mb-2">
          <VNodeRenderer :nodes="themeConfig.app.logo" />

          <div
            class="nav-title text-truncate"
            :class="[$vuetify.display.lgAndUp ? 'd-block' : 'd-none', $vuetify.display.mdAndUp ? 'd-none' : 'd-block']"
          >
            {{ themeConfig.app.title }}
          </div>
        </div>

        <div class="d-flex flex-column gap-y-4 pa-4 pt-0 justify-center mt-5 mobile-menu-wrap">
          <RouterLink
            to="/"
            class="text-h5 font-weight-medium nav-link px-0"
          >
            <VIcon>ri-home-3-line</VIcon>
            Главная
          </RouterLink>

          <RouterLink
            to="/seller/login"
            class="text-h5 font-weight-medium nav-link px-0"
          >
            <VIcon>ri-shopping-bag-2-line</VIcon>
            Вход
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
            v-if="isLoggedIn"
            to="/favorites"
            class="nav-link font-weight-medium"
          >
            Избранное
          </RouterLink>

          <RouterLink
            v-if="isLoggedIn"
            to="/profile"
            class="nav-link font-weight-medium"
          >
            Профиль
          </RouterLink>

          <RouterLink
            v-if="isLoggedIn"
            to="/dashboard/orders"
            class="nav-link font-weight-medium"
          >
            Мои заказы
          </RouterLink>

          <RouterLink
            v-if="isLoggedIn"
            to="/balance"
            class="nav-link font-weight-medium"
          >
            Баланс
          </RouterLink>

          <RouterLink
            v-if="isLoggedIn"
            to="/dashboard/partners"
            class="nav-link font-weight-medium"
          >
            Партнерам
          </RouterLink>

          <RouterLink
            v-if="isLoggedIn"
            to="/dashboard/support"
            class="nav-link font-weight-medium"
          >
            Поддержка
          </RouterLink>
        </div>
      </div>

      <VSpacer />

      <div class="d-flex gap-x-4 align-center">
<!--        <NavbarThemeSwitcher class="me-0 me-sm-2" />-->

        <VBtn
          v-if="$vuetify.display.lgAndUp"
          :prepend-icon="isLoggedIn ? 'ri-user-line' : 'ri-login-box-line'"
          variant="elevated"
          color="primary"
          :href="isLoggedIn ? '/profile' : '/seller/login'"
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
          href="/login"
          rel="noopener noreferrer"
        >
          <VIcon icon="ri-login-box-line" />
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

.mobile-nav-menu.v-navigation-drawer--active {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  left: 0 !important;
  top: 0 !important;
  background: rgb(var(--v-theme-primary)) !important;
  overflow-x: hidden !important;

  .ps {
    width: 100% !important;
    height: 100% !important;
    overflow-x: hidden !important;
  }
}

.menu-logo{
  justify-content: center;
}

.menu-logo .nav-title{
  color: #ffffff!important;
}

.seller-login{
  position: absolute;
  bottom: 30px;
}

.mobile-menu-wrap .nav-link{
  color: #ffffff!important;
}
</style>
