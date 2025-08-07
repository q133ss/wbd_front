<script setup>
import logo from '@images/logo.svg?url'

const closePage = () => {
  // Logic to close the page (e.g., go back in history, close a dialog)
  console.log('Close button clicked')
}
</script>

<template>
  <VAppBar
    flat
    class="px-4 border-b "
    height="64px"
  >
    <VSpacer />

    <img
      :src="logo"
      alt="WBDiscount"
      height="40"
      width="40"
      class="rounded-lg"
    >
    <VSpacer />
  </VAppBar>
</template>


