<script setup>
import api from '@/api'
import { useSnackbarStore } from '@/stores/snackbar'
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'

definePage({
  meta: {
    authRequired: true,
  },
})

const { mdAndUp } = useDisplay()

const snackbar = useSnackbarStore()
const router = useRouter()
const route = useRoute()
const ads = ref([])
const selectedRows = ref([])
const showAddModal = ref(false)
const articleInput = ref('')
const loading = ref(false)

const filters = ref({
  is_archived: null,
  status: null,
})

function selectStatus(value) {
  filters.value.status = value
  handleFilterStatus(value)
}

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 15
const totalItems = ref(0)

// Product selection modal
const showProductModal = ref(false)
const products = ref([])
const productSearchQuery = ref('')
const productCurrentPage = ref(1)
const productTotalItems = ref(0)
const productItemsPerPage = 18

const showShopConfirmModal = ref(false)
const adData = ref(null)
const shopData = ref(null)

const userData = useCookie('userData')

// Truncate name to 27 characters
const truncateName = (name, length = 27) => {
  if (!name) return ''
  return name.length > length ? name.slice(0, length) + '...' : name
}

const showTelegramModal = ref(false)

// Load advertisements
const loadAds = async () => {
  try {
    loading.value = true
    await nextTick()

    const params = {
      page: currentPage.value,
      per_page: itemsPerPage,
      status: filters.value.status !== null ? filters.value.status : undefined,
      is_archived: filters.value.is_archived !== null ? (filters.value.is_archived ? 1 : 0) : undefined,
      search: searchQuery.value || undefined,
    }

    if (route.query.product_id) {
      params.product_id = route.query.product_id
    }

    const response = await api.ads.getAds(params)

    ads.value = response.data
    console.log(ads.value)
    
    totalItems.value = response.total || 0

    if (totalItems.value == 1 && userData.telegram_id == null) {
      showTelegramModal.value = true
    }
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при загрузке объявлений',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Initial load
loadAds()

// Toggle status using stopAds
const toggleStatus = async adId => {
  const ad = ads.value.find(item => item.id === adId)
  if (!ad) return
  const originalStatus = ad.status
  const newStatus = ad.status === 0 ? 1 : 0

  ad.status = newStatus
  try {
    await api.ads.stopAds([adId])
    snackbar.notify({
      text: 'Статус объявления изменен',
      color: 'success',
    })
    loadAds()
  } catch (error) {
    ad.status = originalStatus
    snackbar.notify({
      text: 'Ошибка при изменении статуса',
      color: 'error',
    })
  }
}

// Load products for modal
const loadProducts = async () => {
  try {
    loading.value = true
    await nextTick()

    const response = await api.products.getSellerProducts({
      page: productCurrentPage.value,
      per_page: productItemsPerPage,
      search: productSearchQuery.value || undefined,
    })

    products.value = response
    productTotalItems.value = response.total || 0
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при загрузке товаров',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Open product selection modal
const openProductModal = () => {
  if (route.query.product_id != undefined) {
    showProductModal.value = false
    router.push(`/dashboard/advertisements/create/${route.query.product_id}`)
    return
  }
  showAddModal.value = false
  showProductModal.value = true
  productSearchQuery.value = ''
  productCurrentPage.value = 1
  loadProducts()
}

// Select product and redirect
const selectProduct = productId => {
  showProductModal.value = false
  router.push(`/dashboard/advertisements/create/${productId}`)
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
      color: 'success',
    })
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при остановке объявлений',
      color: 'error',
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
      color: 'success',
    })
  } catch (error) {
    snackbar.notify({
      text: error.response?._data?.message ?? 'Ошибка при архивировании объявлений',
      color: 'error',
    })
  } finally {
    loading.value = false
    showArchiveModal.value = false
  }
}

const statusOptions = [
  { label: 'Все', value: null },
  { label: 'Активные', value: 1 },
  { label: 'Неактивные', value: 0 },
  { label: 'Архивные', value: 'archived' },
]

// Selection
const hasSelection = computed(() => selectedRows.value.length > 0)

const toggleSelect = item => {
  const index = selectedRows.value.indexOf(item.id)
  if (index === -1) {
    selectedRows.value.push(item.id)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

const selectAll = computed({
  get: () => selectedRows.value.length === ads.value.length && ads.value.length > 0,
  set: value => {
    selectedRows.value = value ? ads.value.map(item => item.id) : []
  },
})

// Pagination for ads
const paginationText = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage + 1
  const end = Math.min(currentPage.value * itemsPerPage, totalItems.value)
  return `${start}-${end} из ${totalItems.value}`
})

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

// Pagination for products
const productPaginationText = computed(() => {
  const start = (productCurrentPage.value - 1) * productItemsPerPage + 1
  const end = Math.min(productCurrentPage.value * productItemsPerPage, productTotalItems.value)
  return `${start}-${end} из ${productTotalItems.value}`
})

const productTotalPages = computed(() => Math.ceil(productTotalItems.value / productItemsPerPage))

// Handlers
const handleSearch = () => {
  currentPage.value = 1
  loadAds()
}

const handleFilterArchived = () => {
  currentPage.value = 1
  loadAds()
}

const handleFilterStatus = value => {
  filters.value.is_archived = value === 'archived' ? true : null
  filters.value.status = value
  currentPage.value = 1
  loadAds()
}

const handleProductSearch = () => {
  productCurrentPage.value = 1
  loadProducts()
}

// Get first image
const getFirstImage = images => {
  if (!images) return ''
  if (Array.isArray(images)) return images[0]
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed[0] : ''
  } catch {
    return ''
  }
}

// Image modal
const imageModal = ref(false)
const selectedImage = ref('')

const openImage = url => {
  selectedImage.value = url || 'https://via.placeholder.com/48'
  imageModal.value = true
}

const telegramLinkCookie = useCookie('telegramBotLink')
const qrCodeLink = ref(null)
const qrCodeSrc = ref('')

const connectTelegram = async () => {
  if (telegramLinkCookie.value) {
    window.open(telegramLinkCookie.value, '_blank')
  } else {
    const response = await api.profile.getTelegramLink()
    if (response?.link) {
      qrCodeLink.value = response.link
      telegramLinkCookie.value = response.link
      window.open(response.link, '_blank')
    }
  }
}

if (telegramLinkCookie.value) {
  qrCodeLink.value = telegramLinkCookie.value
  qrCodeSrc.value = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeLink.value)}&size=200x200`
} else {
  const response = await api.profile.getTelegramLink()
  if (response?.link) {
    qrCodeLink.value = response.link
    telegramLinkCookie.value = response.link
    qrCodeSrc.value = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(response.link)}&size=200x200`
  }
}

const closeTgModal = () => {
  showTelegramModal.value = false
}
</script>

<template>
  <VContainer fluid>
    <!-- Панель управления -->
    <VTabs
      color="deep-purple-accent-4"
      align-tabs="start"
      class="md-and-up"
    >
      <VTab
        to="/dashboard/products"
        class="text-secondary px-1 pb-4 text-body-2"
      >
        Товары <span
          v-if="products?.length"
          class="pl-1"
        > ({{ products?.length }})</span>
      </VTab>
      <VTab
        to="/dashboard/advertisements"
        class="text-primary px-1 pb-4 text-body-2 mx-4"
      >
        Объявления
      </VTab>
      <VTab
        to="/dashboard/buybacks"
        class="text-secondary px-1 pb-4 text-body-2"
      >
        Выкупы
      </VTab>
    </VTabs>
    <VRow
      class="mb-4 md-and-up mt-5"
      align="center"
    >
      <VCol cols="auto">
        <VBtn
          color="primary"
          prepend-icon="ri-add-fill"
          @click="openProductModal"
        >
          Создать объявление
        </VBtn>
      </VCol>
      <VCol cols="auto">
        <VMenu>
          <template #activator="{ props }">
            <VBtn
              variant="outlined"
              color="secondary"
              :disabled="!hasSelection"
              v-bind="props"
            >
              Действия
              <VIcon class="ml-2">
                ri-arrow-down-s-line
              </VIcon>
            </VBtn>
          </template>
          <VList>
            <VListItem @click="stopSelected">
              <VListItemTitle>Остановить/Активировать</VListItemTitle>
            </VListItem>
            <VListItem @click="showArchiveModal = true">
              <VListItemTitle>Архивировать</VListItemTitle>
            </VListItem>
          </VList>
        </VMenu>
      </VCol>
      <VCol cols="auto">
        <VMenu close-on-content-click="false">
          <template #activator="{ props }">
            <VBtn
              variant="outlined"
              color="secondary"
              v-bind="props"
            >
              Сортировка
              <VIcon class="ml-2">
                ri-arrow-down-s-line
              </VIcon>
            </VBtn>
          </template>
          <VList>
            <VRadioGroup
              v-model="filters.status"
              @update:model-value="handleFilterStatus"
            >
              <VListItem @click.stop>
                <VRadio
                  label="Все"
                  :value="null"
                />
              </VListItem>
              <VListItem @click.stop>
                <VRadio
                  label="Активные"
                  :value="1"
                />
              </VListItem>
              <VListItem @click.stop>
                <VRadio
                  label="Неактивные"
                  :value="0"
                />
              </VListItem>
              <VListItem @click.stop>
                <VRadio
                  label="Архивные"
                  value="archived"
                />
              </VListItem>
            </VRadioGroup>
          </VList>
        </VMenu>
      </VCol>
      <VSpacer />
      <VCol cols="auto">
        <VTextField
          v-model="searchQuery"
          label="Поиск"
          prepend-inner-icon="ri-search-line"
          clearable
          density="compact"
          width="300"
          @update:model-value="handleSearch"
        />
      </VCol>
    </VRow>
    <!-- Мобильная панель управления -->
    <VRow
      v-if="$vuetify.display.smAndDown || !mdAndUp"
      class="mb-4"
      align="center"
    >
      <VCol cols="12">
        <VBtn
          color="primary"
          prepend-icon="ri-add-fill"
          class="mb-2 text-body-1"
          @click="openProductModal"
        >
          Добавить товар
        </VBtn>
      </VCol>
      <VCol cols="12">
        <VTabs
          color="deep-purple-accent-4"
          align-tabs="start"
          class="border-none"
        >
          <VTab
            to="/dashboard/products"
            class="text-secondary px-1 pb-4 text-body-1 font-weight-bold"
          >
            Товары <span
              v-if="products.length"
              class="pl-1"
            > ({{ products.length }})</span>
          </VTab>
          <VTab 
            to="/dashboard/advertisements"         
            class="text-primary px-1 pb-4 text-body-1 font-weight-bold mx-4"
          >
            Объявления
          </VTab>
        </VTabs>
      </VCol>
      <VCol
        cols="12"
        class="d-flex flex-wrap"
      >
        <VBtn
          v-for="option in statusOptions"
          :key="option.value ?? 'all'"
          size="small"
          variant="flat"
          class="px-3 py-1 text-sm font-weight-medium rounded-xl mr-2 mb-2"
          :color="filters.status === option.value ? 'primary' : 'transparent'"
          :style="filters.status === option.value ? '' : 'background-color: rgba(var(--v-theme-secondary), 0.08); color: rgb(var(--v-theme-secondary));'"
          @click="selectStatus(option.value)"
        >
          {{ option.label }}
        </VBtn>
      </VCol>
      <VCol
        cols="12"
        class="d-flex flex-wrap gap-4"
      >
        <div
          v-if="loading"
          class="w-100 d-flex justify-center my-8"
        >
          <VProgressCircular
            indeterminate
            color="primary"
            size="40"
          />
        </div>
        <VCard
          v-for="item in ads"
          v-else-if="ads.length"
          :key="item.id"
          width="100%"
          variant="outlined"
          class="pa-4"
        >
          <div class="d-flex gap-3 w-100">
            <VImg
              :src="item.product.images[0]"
              class="rounded"
              cover
              width="36"
              height="36"
              max-width="36"
            />
            <div class="flex-grow-1 d-flex flex-column justify-center">
              <RouterLink
                :to="'/dashboard/advertisements?product_id=' + item.id"
                class="text-h6 font-weight-medium text-truncate d-inline-block"
                style="max-width: 180px; font-size: 14px;"
              >
                {{ truncateName(item.name) }}
              </RouterLink>
              <span
                class="text-secondary"
                style="font-size: 12px;"
              >
                {{ item.product.wb_id }}
              </span> 
            </div>
            <VSwitch
              :model-value="item.status === 1"
              color="primary"
              hide-details
              density="comfortable"
              style="scale: 1.3;"
              @update:model-value="() => toggleStatus(item.id)"
            />
          </div>
          <div class="d-flex justify-between mt-3 !font-weight-medium" style="max-width: 90%">
            <ul class="w-50">
              <li class="list-none">
                <p
                  class="text-overline ma-0 text-medium-emphasis"
                  style="font-size: 10px !important; font-weight: 500 !important;"
                >
                  Кэшбэк
                </p>
                <span
                  class="text-primary text-body-2"
                  style="font-size: 16px !important; font-weight: 500 !important"
                >{{ parseInt(item.cashback_percentage) }}% / {{ Math.floor(item.price_without_cashback - Number(item.price_with_cashback)) }} Р</span>
              </li>
              <li class="list-none my-1">
                <p
                  class="text-overline ma-0 text-medium-emphasis"
                  style="font-size: 10px !important; font-weight: 500 !important;"
                >
                  CR / CTR
                </p>
                <span
                  class="text-high-emphasis"
                  style="font-size: 16px !important; font-weight: 500 !important"
                >{{ item.cr }}% / {{ item.ctr }}%</span>
              </li>
              <li class="list-none my-1">
                <p
                  class="text-overline ma-0 text-medium-emphasis"
                  style="font-size: 10px !important; font-weight: 500 !important;"
                >
                  Выкупают
                </p>
                <span
                  class="text-high-emphasis"
                  style="font-size: 16px !important; font-weight: 500 !important"
                >{{ item.process_buybacks_count }}</span>
              </li>
            </ul>
            <ul class="w-50">
              <li class="list-none">
                <p
                  class="text-overline ma-0 text-medium-emphasis"
                  style="font-size: 10px !important; font-weight: 500 !important;"
                >
                  Просмотры
                </p>
                <span
                  class="text-high-emphasis"
                  style="font-size: 16px !important; font-weight: 500 !important"
                >{{ item.views_count || 0 }}</span>
              </li>
              <li class="list-none my-1">
                <p
                  class="text-overline ma-0 text-medium-emphasis"
                  style="font-size: 10px !important; font-weight: 500 !important;"
                >
                  Переходы
                </p>
                <span
                  class="text-high-emphasis"
                  style="font-size: 16px !important; font-weight: 500 !important"
                >{{ item.clicks_count || 0 }}</span>
              </li>
              <li class="list-none">
                <p
                  class="text-overline ma-0 text-medium-emphasis"
                  style="font-size: 10px !important; font-weight: 500 !important;"
                >
                  Выкупили
                </p>
                <span
                  class="text-high-emphasis"
                  style="font-size: 16px !important; font-weight: 500 !important"
                >{{ item.completed_buybacks_count || 0 }}</span>
              </li>
            </ul>
          </div>
          <div class="d-flex justify-space-between align-center w-100">
            <VBtn
              variant="flat"
              :color="item.message_count ? 'primary' : 'rgba(var(--v-theme-secondary), 0.08)'"
              class="mt-3"
              :class="item.message_count ? '' : 'text-primary'"
              @click="() => item.message_count && router.push(`/dashboard/advertisements/messages/${item.id}`)"
            >
              <span v-if="item.message_count">
                Сообщения ({{ item.message_count }})
              </span> 
              <span v-else>
                Нет сообщений
              </span>
            </VBtn>
            <VMenu>
              <template #activator="{ props }">
                <IconBtn
                  icon
                  color="secondary"
                  v-bind="props"
                >
                  <VIcon>
                    ri-more-line
                  </VIcon>
                </IconBtn>
              </template>
              <VList>
                <VListItem @click="selectedRows.length && selectedRows.includes(item.id) ? stopSelected() : toggleStatus(item.id)">
                  <VListItemTitle>
                    {{ selectedRows.length && selectedRows.includes(item.id) ? 'Остановить/Активировать выбранные' : item.status === 1 ? 'Остановить' : 'Активировать' }}
                  </VListItemTitle>
                </VListItem>
                <VListItem @click="router.push(`/dashboard/advertisements/edit/${item.id}`)">
                  <VListItemTitle>Редактировать</VListItemTitle>
                </VListItem>
                <VListItem @click="selectedRows.length && selectedRows.includes(item.id) ? archiveSelected() : (selectedRows.value = [item.id], archiveSelected())">
                  <VListItemTitle>
                    {{ selectedRows.length && selectedRows.includes(item.id) ? 'Архивировать выбранные' : 'Архивировать' }}
                  </VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </div>
        </VCard>
        <div
          v-else
          class="text-center w-100"
        >
          <p>Тут пока пусто</p>
        </div>
      </VCol>
    </VRow>
    <!-- Таблица объявлений -->
    <VTable
      v-if="$vuetify.display.mdAndUp || mdAndUp"
      class="rounded-table md-and-up"
    >
      <thead>
        <tr>
          <th class="text-uppercase">
            <VCheckbox
              v-model="selectAll"
              :indeterminate="selectedRows.length > 0 && selectedRows.length < ads.length"
              hide-details
            />
          </th>
          <th class="text-uppercase">
            Объявление
          </th>
          <th class="text-uppercase">
            Статус
          </th>
          <th class="text-uppercase">
            Товар
          </th>
          <th class="text-uppercase">
            Кэшбэк
          </th>
          <th class="text-uppercase">
            Выкупов
          </th>
          <th>
            <div class="inline-flex items-center">              
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VBadge
                    v-bind="props"
                    location="right center"
                    :offset-x="-10"
                    color="primary"
                    dot
                    class="ml-[2px]"
                  >
                    <span class="text-uppercase">Выкупают</span>
                  </VBadge>
                </template>
                <span>Выкупы в процессе</span>
              </VTooltip>
            </div>
          </th>
          <th>
            <div class="flex items-center gap-1">              
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VBadge
                    v-bind="props"
                    location="right center"
                    :offset-x="-10"
                    color="primary"
                    dot
                    class="ml-[2px]"
                  >
                    <span class="text-uppercase">Показы</span>
                  </VBadge>
                </template>
                <span>Сколько людей увидело карточку на главной</span>
              </VTooltip>
            </div>
          </th>
          <th>
            <div class="flex items-center gap-1">              
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VBadge
                    v-bind="props"
                    location="right center"
                    :offset-x="-10"
                    color="primary"
                    dot
                    class="ml-[2px]"
                  >
                    <span class="text-uppercase">Переходы</span>
                  </VBadge>
                </template>
                <span>Сколько людей перешло в карточку</span>
              </VTooltip>
            </div>
          </th>
          <th>
            <div class="relative inline-flex items-center">              
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VBadge
                    v-bind="props"
                    location="right center"
                    :offset-x="-10"
                    color="primary"
                    dot
                    class="ml-[2px] relative top-[1px]"
                  >
                    <span class="text-uppercase">CTR</span>
                  </VBadge>
                </template>
                <span>Конверсия из показа в переход</span>
              </VTooltip>
            </div>
          </th>
          <th>
            <div class="relative inline-flex items-center">
              <VTooltip location="top">
                <template #activator="{ props }">
                  <VBadge
                    v-bind="props"
                    location="right center"
                    :offset-x="-10"
                    color="primary"
                    dot
                    class="ml-[2px] relative top-[1px]"
                  >
                    <span class="text-uppercase">CR</span>
                  </VBadge>
                </template>
                <span>Конверсия из перехода в заказ</span>
              </VTooltip>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="loading"
          class="loading-row"
        >
          <td
            colspan="8"
            class="text-center"
          >
            <VProgressCircular
              indeterminate
              color="primary"
            />
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="item in ads"
            :key="item.id"
            :class="{ 'selected-row': selectedRows.includes(item.id) }"
          >
            <td>
              <VCheckbox
                :model-value="selectedRows.includes(item.id)"
                hide-details
                @update:model-value="() => toggleSelect(item)"
              />
            </td>
            <td>
              <div class="">
                <RouterLink :to="`/dashboard/advertisements/edit/${item.id}`">
                  <VIcon
                    size="16"
                    icon="ri-pencil-fill"
                    class="mr-2"
                  />
                  {{ item.name }}
                </RouterLink>
              </div>
            </td>
            <td>
              <VSwitch
                :model-value="item.status === 1"
                color="primary"
                hide-details
                @update:model-value="() => toggleStatus(item.id)"
              />
            </td>
            <td class="d-flex flex-row align-center">
              <VImg
                v-if="item.product.images && getFirstImage(item.product.images)"
                :src="getFirstImage(item.product.images)"
                class="mr-2 rounded cursor-pointer"
                cover
                width="50"
                height="50"
                @click="openImage(getFirstImage(item.product.images))"
              />
              <span class="truncate-2-lines">{{ truncateName(item.product.name) }}</span>
            </td>
            <td>{{ parseInt(item.cashback_percentage) }}% / {{ parseInt(item.price_with_cashback) }}₽</td>
            <td v-if="item.keywords == null">
              {{ item.completed_buybacks_count }} из {{ item.redemption_count }}
            </td>
            <td v-else>
              {{ item.completed_buybacks_count }} из {{ item.keywords.reduce((sum, kw) => sum + (kw.redemption_count || 0), 0) }}
            </td>
            <td>
              {{ item.process_buybacks_count }}
            </td>
            <td>{{ item.views_count }}</td>
            <td>{{ item.clicks_count }}</td>
            <td>{{ item.ctr }}</td>
            <td>{{ item.cr }}</td>
          </tr>
          <tr v-if="!ads.length">
            <td
              colspan="12"
              class="text-center pt-10"
            >
              <span v-if="!filters.is_archived">Объявлений нет</span>
              <span v-else>Архивных объявлений нет</span>
              <br>
              <VBtn
                v-if="!filters.is_archived"
                class="mt-7 mb-7"
                prepend-icon="ri-add-fill"
                @click="openProductModal"
              >
                Создать объявление
              </VBtn>
            </td>
          </tr>
        </template>
      </tbody>
    </VTable>

    <!-- Пагинация -->
    <div
      v-if="ads.length && !loading && totalItems > itemsPerPage"
      class="text-center mt-4"
    >
      <div>{{ paginationText }}</div>
      <VPagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        @update:model-value="loadAds"
      />
    </div>

    <!-- Модальное окно для создания объявления -->
    <VDialog
      v-model="showAddModal"
      max-width="500"
    >
      <VCard>
        <VCardTitle>Создать объявление</VCardTitle>
        <VCardText>
          <VTextField
            v-model="articleInput"
            label="Артикул WB (опционально)"
            hint="Оставьте пустым для перехода к выбору товара"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="primary"
            @click="openProductModal"
          >
            Выбрать товар
          </VBtn>
          <VBtn @click="showAddModal = false">
            Отмена
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Модальное окно для выбора товара -->
    <VDialog
      v-model="showProductModal"
      max-width="800"
    >
      <VCard>
        <VCardTitle>Выберите товар</VCardTitle>
        <VCardText>
          <VTextField
            v-model="productSearchQuery"
            label="Поиск"
            prepend-inner-icon="ri-search-line"
            clearable
            density="compact"
            class="mb-4"
            @update:model-value="handleProductSearch"
          />
          <VTable style="background: none">
            <thead>
              <tr>
                <th class="text-uppercase">
                  Товар
                </th>
                <th class="text-uppercase">
                  Рейтинг
                </th>
                <th class="text-uppercase">
                  Цена
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-if="loading"
                class="loading-row"
              >
                <td
                  colspan="3"
                  class="text-center"
                >
                  <VProgressCircular
                    indeterminate
                    color="primary"
                  />
                </td>
              </tr>
              <template v-else>
                <tr
                  v-for="product in products.data"
                  :key="product.id"
                  style="cursor: pointer;"
                  @click="selectProduct(product.id)"
                >
                  <td>
                    <div class="d-flex align-center">
                      <VImg
                        v-if="product.images && getFirstImage(product.images)"
                        :src="getFirstImage(product.images)"
                        max-width="50"
                        max-height="66"
                        class="mr-2"
                      />
                      <span>{{ truncateName(product.name) }}</span>
                    </div>
                  </td>
                  <td>{{ product.rating }}</td>
                  <td>{{ product.price }}</td>
                </tr>
                <tr v-if="!products.data?.length">
                  <td
                    colspan="3"
                    class="text-center"
                  >
                    <VAlert
                      icon="$warning"
                      type="primary"
                      class="ma-4"
                    >
                      Товары не найдены
                    </VAlert>
                  </td>
                </tr>
              </template>
            </tbody>
          </VTable>
          <div
            v-if="products.data?.length && !loading"
            class="text-center mt-4"
          >
            <div>{{ productPaginationText }}</div>
            <VPagination
              v-model="productCurrentPage"
              :length="productTotalPages"
              :total-visible="7"
              @update:model-value="loadProducts"
            />
          </div>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn @click="showProductModal = false">
            Отмена
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Архивация -->
    <VDialog
      v-model="showArchiveModal"
      max-width="500"
    >
      <VCard>
        <VCardTitle>Архивировать объявления?</VCardTitle>
        <VCardText>
          После архивации объявлений запустить их будет невозможно.
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="primary"
            @click="confirmArchive"
          >
            Подтвердить
          </VBtn>
          <VBtn @click="showArchiveModal = false">
            Отменить
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Модальное окно для подтверждения добавления магазина -->
    <VDialog
      v-model="showShopConfirmModal"
      max-width="600"
    >
      <VCard>
        <VCardTitle>Добавление магазина</VCardTitle>
        <VCardText>
          <p>Этот функционал не применим к объявлениям.</p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            :disabled="loading"
            @click="showShopConfirmModal = false"
          >
            Закрыть
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Image Modal -->
    <VDialog
      v-model="imageModal"
      max-width="800"
    >
      <VCard>
        <VImg
          :src="selectedImage"
          contain
          max-height="600"
        />
        <VCardActions>
          <VSpacer />
          <VBtn
            color="secondary"
            @click="imageModal = false"
          >
            Закрыть
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VContainer>
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

.v-table > .v-table__wrapper > table > thead > tr > th, .v-table > .v-table__wrapper > table > tfoot > tr > th {
  padding: 0 10px !important;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr > td) {
  padding: 0 10px !important;
}

.rounded-table {
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.truncate-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media screen and (max-width: 800px) {
  .rounded-table {
    display: none;
  }
  .md-and-up {
    display: none;
  }  
}
</style>
