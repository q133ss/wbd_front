<script setup>
import { useTheme } from 'vuetify'

const { global } = useTheme()

const authProviders = [
  {
    icon: 'ri-vk-fill',
    color: '#497CE2',
    colorInDark: '#497CE2',
  },
  {
    icon: 'bxl-google',
    color: '#db4437',
    colorInDark: '#db4437',
  }
]
</script>

<template>
  <div class="d-flex justify-center flex-wrap gap-2">
    <VBtn
      v-for="link in authProviders"
      :key="link.icon"
      icon
      variant="text"
      size="small"
      :color="global.name.value === 'dark' ? link.colorInDark : link.color"
    >
      <VIcon :icon="link.icon" />
    </VBtn>
  </div>
</template>
