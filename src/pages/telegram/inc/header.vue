<script setup>
import logo from '@images/logo.svg?url'

const closePage = () => {
  // Logic to close the page (e.g., go back in history, close a dialog)
  console.log('Close button clicked');
}
</script>

<template>
  <v-app-bar flat class="px-4" height="64px">
    <v-spacer></v-spacer>

    <img
      :src="logo"
      alt="WBDiscount"
      height="40"
      width="40"
      class="rounded-lg"
    />
    <v-spacer></v-spacer>
  </v-app-bar>
</template>

<style scoped lang="scss">

</style>
