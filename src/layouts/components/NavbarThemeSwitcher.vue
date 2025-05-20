<script setup>
const themes = [
  {
    name: 'system',
    icon: 'ri-macbook-line',
    label: 'Системная',
  },
  {
    name: 'light',
    icon: 'ri-sun-line',
    label: 'Светлая',
  },
  {
    name: 'dark',
    icon: 'ri-moon-clear-line',
    label: 'Тёмная',
  },
]
</script>

<template>
  <ThemeSwitcher :themes="themes" />
</template>
