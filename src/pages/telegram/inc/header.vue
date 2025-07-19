<script setup>
import logo from '@images/logo.svg?url'

const closePage = () => {
  // Logic to close the page (e.g., go back in history, close a dialog)
  console.log('Close button clicked');
}
</script>

<template>
  <v-app-bar flat class="px-4" height="64px">
    <v-btn text class="pa-0" min-width="auto" @click="closePage">
      <v-icon left>mdi-close</v-icon>
      <span class="text-body-1 text-capitalize">Закрыть</span>
    </v-btn>

    <v-spacer></v-spacer>

    <img
      :src="logo"
      alt="WBDiscount"
      height="40"
      width="40"
      class="rounded-lg"
    />
    <v-spacer></v-spacer>

    <v-menu offset-y left>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>ri-arrow-down-s-line</v-icon>
          <v-icon>ri-more-fill</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-title>Опция 1</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Опция 2</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<style scoped lang="scss">

</style>
