<script setup>
import { ref } from 'vue'
import api from '@/api'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbar = useSnackbarStore()

const products = ref(null)
const response = await api.products.getSellerProducts()
products.value = response
</script>

<template>
  <VTable>
    <thead>
    <tr>
      <th class="text-uppercase">
        Товар
      </th>
      <th class="text-uppercase">
        Статус
      </th>
      <th class="text-uppercase">
        Выкупов
      </th>
      <th class="text-uppercase">
        Просмотры
      </th>
      <th class="text-uppercase">
        Выкупы
      </th>
      <th class="text-uppercase">
        Конверсия
      </th>
      <th class="text-uppercase">
        Объявлений
      </th>
    </tr>
    </thead>

    <tbody>
    <tr
      v-for="item in products.data"
      :key="item.id"
    >
      <td>
        {{ item.name }}
      </td>
      <td>
        {{ item.status }}
      </td>
      <td>
        {{ item.buybacks_progress }}
      </td>
      <td>
        {{ item.views }}
      </td>
      <td>
        {{ item.completed_buybacks_count }}
      </td>
      <td>
        {{ item.conversion }}
      </td>
      <td>
        {{ item.ads_count }}
      </td>
    </tr>
    </tbody>
  </VTable>
</template>

<style scoped lang="scss">

</style>
