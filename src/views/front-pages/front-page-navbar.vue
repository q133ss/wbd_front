<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

const navigation = [
  { name: 'Преимущества', href: '#features' },
  { name: 'Как это работает', href: '#how-it-works' },
  { name: 'Тарифы', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
]

const scrollToSection = sectionId => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const onLoginClick = () => {
  // Логика входа
  console.log('Войти')
}
</script>

<template>
  <VAppBar
    app
    color="white"
    elevation="2"
    class="d-flex justify-space-between align-center"
  >
    <VContainer
      max-width="1200"
      class="mx-auto w-100 d-flex justify-space-between align-center gap-6"
    >
      <!-- Logo -->
      <RouterLink
        to="/"
        class="app-logo"
      >
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        <h1 class="app-logo-title leading-normal">
          {{ themeConfig.app.title }}
        </h1>
      </RouterLink>

      <!-- Desktop Navigation -->
      <VRow
        class="d-none d-md-flex align-center gap-5 ml-4"
        dense
      >
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          variant="text"
          :to="item.href"
          class="text-body-1"
        >
          {{ item.name }}
        </RouterLink>
      </VRow>
      <!-- Desktop Actions -->
      <VRow
        class="d-none d-md-flex ma-0 justify-end"
        align="center"
        dense
      >
        <RouterLink
          class="mr-4 text-body-1"
          to="/seller/login"
        >
          Войти
        </RouterLink>
        <VBtn
          color="primary"
          variant="flat"
          class="text-none"
          to="/seller/login"
        >
          Начать продвижение
        </VBtn>
      </VRow>

      <!-- Mobile menu button -->
      <VBtn
        icon
        class="d-md-none"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        <i
          v-if="!mobileMenuOpen"
          class="ri-menu-3-line text-h5"
        />
        <i
          v-else
          class="ri-close-line text-h5"
        />
      </VBtn>
    </VContainer>
  </VAppBar>

  <!-- Mobile Navigation Drawer -->
  <VNavigationDrawer
    v-model="mobileMenuOpen"
    temporary
    right
    class="d-md-none"
  >
    <VList>
      <VListItem
        v-for="item in navigation"
        :key="item.name"
        @click="() => { scrollToSection(item.href.replace('#', '')); mobileMenuOpen = false }"
      >
        <VListItemTitle color="text-body-1 hover:text-primary">
          {{ item.name }}
        </VListItemTitle>
      </VListItem>
      <VDivider class="my-2 mx-5" />
      <div class="d-flex flex-column mx-5">
        <RouterLink
          to="/seller/login"
          color="text-body-1"
        >
          Войти
        </RouterLink>
        <VBtn
          class="mt-3 text-none"
          @click="() => { scrollToSection('hero'); mobileMenuOpen = false }"
        >
          Начать продвижение
        </VBtn>
      </div>
    </VList>
  </VNavigationDrawer>
</template>

<style scoped>
.theme-text {
  color: var(--v-theme-on-background) !important;
}

.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.5rem;

  .app-logo-title {
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.75rem;
    text-transform: capitalize;
  }
}
</style>
