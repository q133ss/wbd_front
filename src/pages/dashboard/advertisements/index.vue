<script setup>
import { ref, computed, nextTick } from 'vue'
import api from '@/api'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbar = useSnackbarStore()
const ads = ref([])
const selectedRows = ref([])
const showAddModal = ref(false)
const articleInput = ref('')
const loading = ref(false)
const filters = ref({
  is_archived: null,
  status: null
})
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 15
const totalItems = ref(0)

const showShopConfirmModal = ref(false)
const adData = ref(null)
const shopData = ref(null)

// Truncate name
const truncateName = (name) => {
  if (!name) return ''
  return name.length > 40 ? name.slice(0, 40) + '...' : name
}

// Load advertisements
const loadAds = async () => {
  try {
    loading.value = true
    await nextTick()
    const response = await api.ads.getAds({
      page: currentPage.value,
      per_page: itemsPerPage,
      ...filters.value,
      search: searchQuery.value || undefined
    })
    ads.value = response.data
    totalItems.value = response.total || 0
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при загрузке объявлений',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Initial load
loadAds()

// Toggle status
const toggleStatus = async (adId) => {
  const ad = ads.value.find(item => item.id === adId)
  if (!ad) return
  const originalStatus = ad.status
  const newStatus = ad.status === 0 ? 1 : 0
  ad.status = newStatus
  try {
    await api.ads.updateAd(adId, { status: newStatus })
    snackbar.notify({
      text: 'Статус объявления изменен',
      color: 'success'
    })
  } catch (error) {
    ad.status = originalStatus
    snackbar.notify({
      text: 'Ошибка при изменении статуса',
      color: 'error'
    })
  }
}

// Add advertisement (simplified to link to create page)
const addAd = () => {
  // Since creating an ad requires more data, redirect to create page
  showAddModal.value = false
  articleInput.value = ''
  window.location.href = '/dashboard/ads/create'
}

// Mass stop
const stopSelected = async () => {
  if (!selectedRows.value.length) return
  const adIds = selectedRows.value
  try {
    loading.value = true
    await nextTick()
    await api.ads.stopAds(adIds)
    await loadAds()
    selectedRows.value = []
    snackbar.notify({
      text: 'Объявления остановлены',
      color: 'success'
    })
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при остановке объявлений',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Archive selected
const showArchiveModal = ref(false)
const archiveSelected = async () => {
  if (!selectedRows.value.length) return
  showArchiveModal.value = true
}

const confirmArchive = async () => {
  const adIds = selectedRows.value
  try {
    loading.value = true
    await nextTick()
    await api.ads.archiveAds(adIds)
    await loadAds()
    selectedRows.value = []
    snackbar.notify({
      text: 'Объявления заархивированы',
      color: 'success'
    })
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при архивировании объявлений',
      color: 'error'
    })
  } finally {
    loading.value = false
    showArchiveModal.value = false
  }
}

// Selection
const hasSelection = computed(() => selectedRows.value.length > 0)
const toggleSelect = (item) => {
  const index = selectedRows.value.indexOf(item.id)
  if (index === -1) {
    selectedRows.value.push(item.id)
  } else {
    selectedRows.value.splice(index, 1)
  }
}
const selectAll = computed({
  get: () => selectedRows.value.length === ads.value.length && ads.value.length > 0,
  set: (value) => {
    selectedRows.value = value ? ads.value.map(item => item.id) : []
  }
})

// Pagination
const paginationText = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage + 1
  const end = Math.min(currentPage.value * itemsPerPage, totalItems.value)
  return `${start}-${end} из ${totalItems.value}`
})
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

// Handlers
const handleSearch = () => {
  currentPage.value = 1
  loadAds()
}
const handleFilterArchived = () => {
  currentPage.value = 1
  loadAds()
}
const handleFilterStatus = () => {
  currentPage.value = 1
  loadAds()
}

// Get first image
const getFirstImage = (images) => {
  if (!images) return ''
  if (Array.isArray(images)) return images[0]
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed[0] : ''
  } catch {
    return ''
  }
}
</script>

<template>
  <v-container fluid>
    <!-- Панель управления -->
    <v-row class="mb-4" align="center">
      <v-col cols="auto">
        <v-btn
          color="primary"
          @click="showAddModal = true"
        >
          Создать объявление
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              :disabled="!hasSelection"
              v-bind="props"
            >
              Действия
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="stopSelected">
              <v-list-item-title>Остановить</v-list-item-title>
            </v-list-item>
            <v-list-item @click="showArchiveModal = true">
              <v-list-item-title>Архивировать</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
      <v-col cols="auto">
        <v-menu close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn
              color="primary"
              v-bind="props"
            >
              Все объявления
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click.stop>
              <v-checkbox
                v-model="filters.is_archived"
                label="Показать архивные"
                :true-value="true"
                :false-value="null"
                @update:modelValue="handleFilterArchived"
              ></v-checkbox>
            </v-list-item>
            <v-list-item @click.stop>
              <v-radio-group
                v-model="filters.status"
                @update:modelValue="handleFilterStatus"
              >
                <v-radio
                  label="Все"
                  :value="null"
                ></v-radio>
                <v-radio
                  label="Активные"
                  :value="1"
                ></v-radio>
                <v-radio
                  label="Неактивные"
                  :value="0"
                ></v-radio>
              </v-radio-group>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="auto">
        <v-text-field
          v-model="searchQuery"
          label="Поиск"
          prepend-inner-icon="mdi-magnify"
          clearable
          @update:modelValue="handleSearch"
          style="width: 300px"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Таблица объявлений -->
    <VTable>
      <thead>
      <tr>
        <th class="text-uppercase">
          <v-checkbox
            v-model="selectAll"
            :indeterminate="selectedRows.length > 0 && selectedRows.length < ads.length"
            hide-details
          ></v-checkbox>
        </th>
        <th class="text-uppercase">Объявление</th>
        <th class="text-uppercase">Статус</th>
        <th class="text-uppercase">Товар</th>
        <th class="text-uppercase">Кэшбек</th>
        <th class="text-uppercase">Выкупов</th>
        <th class="text-uppercase">Просмотры</th>
        <th class="text-uppercase">CR</th>
      </tr>
      </thead>
      <tbody>
      <tr v-if="loading" class="loading-row">
        <td colspan="8" class="text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </td>
      </tr>
      <template v-else>
        <tr
          v-for="item in ads"
          :key="item.id"
          :class="{ 'selected-row': selectedRows.includes(item.id) }"
        >
          <td>
            <v-checkbox
              :model-value="selectedRows.includes(item.id)"
              @update:modelValue="() => toggleSelect(item)"
              hide-details
            ></v-checkbox>
          </td>
          <td>
            <div class="d-flex align-center">
              <v-img
                v-if="item.product.images && getFirstImage(item.product.images)"
                :src="getFirstImage(item.product.images)"
                max-width="50"
                max-height="66"
                class="mr-2"
              ></v-img>
              <NuxtLink :to="`/dashboard/ads/${item.id}/edit`">{{ truncateName(item.name) }}</NuxtLink>
            </div>
          </td>
          <td>
            <v-switch
              :model-value="item.status === 1"
              @update:modelValue="() => toggleStatus(item.id)"
              color="primary"
              hide-details
            ></v-switch>
          </td>
          <td>{{ item.product.name }}</td>
          <td>{{ item.cashback_percentage }}%</td>
          <td>{{ item.redemption_count }}</td>
          <td>{{ item.views_count }}</td>
          <td>{{ item.cr }}</td>
        </tr>
        <tr v-if="!ads.length">
          <td colspan="8" class="text-center">
            <v-alert icon="$warning" type="primary" class="ma-4">Объявления не найдены</v-alert>
          </td>
        </tr>
      </template>
      </tbody>
    </VTable>

    <!-- Пагинация -->
    <div class="text-center mt-4" v-if="ads.length && !loading">
      <div>{{ paginationText }}</div>
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        @update:modelValue="loadAds"
      ></v-pagination>
    </div>

    <!-- Модальное окно для создания объявления -->
    <v-dialog
      v-model="showAddModal"
      max-width="500"
    >
      <v-card>
        <v-card-title>Создать объявление</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="articleInput"
            label="Артикул WB (опционально)"
            hint="Оставьте пустым для перехода к созданию"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="addAd"
          >
            Перейти к созданию
          </v-btn>
          <v-btn
            @click="showAddModal = false"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Архивация -->
    <v-dialog
      v-model="showArchiveModal"
      max-width="500"
    >
      <v-card>
        <v-card-title>Архивировать объявления?</v-card-title>
        <v-card-text>
          После архивации объявлений запустить их будет невозможно.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="confirmArchive"
          >
            Подтвердить
          </v-btn>
          <v-btn
            @click="showArchiveModal = false"
          >
            Отменить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Модальное окно для подтверждения добавления магазина (оставлено для совместимости, но не используется) -->
    <v-dialog
      v-model="showShopConfirmModal"
      max-width="600"
    >
      <v-card>
        <v-card-title>Добавление магазина</v-card-title>
        <v-card-text>
          <p>Этот функционал не применим к объявлениям.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="showShopConfirmModal = false"
            :disabled="loading"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped lang="scss">
:deep(.v-table) {
  .v-table__wrapper {
    max-height: 600px;
    overflow-y: auto;
  }
  th {
    text-transform: uppercase;
    font-weight: bold;
  }
}
.selected-row {
  background-color: rgba(0, 0, 0, 0.05);
}
.loading-row {
  height: 200px;
  td {
    vertical-align: middle;
  }
}
</style>
