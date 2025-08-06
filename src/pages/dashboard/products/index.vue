<script setup>
import api from '@/api'
import { useSnackbarStore } from '@/stores/snackbar'
import { computed, nextTick, ref } from 'vue'

definePage({
  meta: {
    authRequired: true,
  },
})

const snackbar = useSnackbarStore()
const products = ref([])
const selectedRows = ref([])
const showAddModal = ref(false)
const articleInput = ref('')
const loading = ref(false)

const filters = ref({
  is_archived: null,
  status: null,
})

const statusOptions = [
  { label: 'Все', value: null },
  { label: 'Активные', value: 1 },
  { label: 'Неактивные', value: 0 },
  { label: 'Архивные', value: 'archived' },
]

function selectStatus(value) {
  filters.value.status = value
  handleFilterStatus(value) // вызываешь, если у тебя есть логика
}


const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 15
const totalItems = ref(0)

const showShopConfirmModal = ref(false)
const showTestTariff = ref(false)
const productData = ref(null)
const shopData = ref(null)

const userData = useCookie('userData')

// Обрезка названия до 20 символов
const truncateName = name => {
  if (!name) return ''
  
  return name.length > 20 ? name.slice(0, 20) + '...' : name
}

// Загрузка товаров
const loadProducts = async () => {
  try {
    loading.value = true
    await nextTick() // Гарантируем рендеринг индикатора загрузки

    const response = await api.products.getSellerProducts({
      page: currentPage.value,
      per_page: itemsPerPage,
      ...filters.value,
      search: searchQuery.value || undefined,
    })

    products.value = response.data
    console.log(products.value)
    totalItems.value = response.total || 0
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при загрузке товаров',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Инициальная загрузка
loadProducts()

// Проверка на тестовый тариф
const createdAt = new Date(userData.value.created_at)
const now = new Date()

const diffInMs = now - createdAt
const diffInMinutes = diffInMs / 1000 / 60

const alreadyShown = localStorage.getItem('test_tariff_shown') === '1'
if (diffInMinutes < 180 && !alreadyShown) {
  showTestTariff.value = true
  localStorage.setItem('test_tariff_shown', '1')
}

// Переключение статуса
const toggleStatus = async productId => {
  const product = products?.value?.find(item => item.id === productId)
  if (!product) return
  const originalStatus = product.status

  product.status = product.status === 0 ? 1 : 0 // Оптимистичное обновление

  try {
    await nextTick()
    await api.products.stopSellerProducts([productId])
    snackbar.notify({
      text: 'Статус товара изменен',
      color: 'success',
    })
  } catch (error) {
    product.status = originalStatus // Откат при ошибке
    snackbar.notify({
      text: error.response?._data.message ?? 'Ошибка при изменении статуса',
      color: 'error',
    })
  }
}

// Добавление товара
const addProduct = async () => {
  if (!articleInput.value) return
  try {
    loading.value = true
    await nextTick()

    // Получение данных пользователя
    const userData = useCookie('userData')
    if (!userData.value) {
      snackbar.notify({
        text: 'Данные пользователя не найдены',
        color: 'error',
      })
      
      return
    }

    if (userData.value.shop) {
      // Если магазин есть, сразу добавляем товар
      await addProductToWb()
      
      return
    }

    // Если магазина нет, получаем данные о товаре
    const response = await api.products.fetchWbProduct(articleInput.value, loadRelated.value)

    // Проверяем, что ответ содержит нужные данные
    if (!response || !response.product || !response.shop) {
      snackbar.notify({
        text: 'Неверный формат данных товара или магазина',
        color: 'error',
      })
      
      return
    }

    // Сохраняем данные о товаре и магазине
    productData.value = response.product
    shopData.value = response.shop

    // Показываем модальное окно для подтверждения
    showShopConfirmModal.value = true
  } catch (error) {
    console.error('Error in addProduct:', error.message, error.stack)
    let errorMessage = 'Ошибка при получении данных товара'
    if (error.response?.status === 404) {
      errorMessage = 'Товар не найден'
    } else if (error.response?.status === 403) {
      errorMessage = 'Доступ к товару запрещен'
    }
    snackbar.notify({
      text: errorMessage,
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Добавление товара в WB
const router = useRouter()

const addProductToWb = async () => {
  try {
    loading.value = true
    await nextTick()

    const response = await api.products.addWbProduct(articleInput.value)

    if (response.code === 201) {
      // Если товар успешно добавлен
      const userData = useCookie('userData')

      if (!userData.value?.shop) {
        // Обновляем данные пользователя в куках
        const updatedUser = await api.user.profile()

        userData.value = updatedUser

        // Перенаправляем на создание объявления
        await loadProducts()
        showAddModal.value = false
        showShopConfirmModal.value = false
        articleInput.value = ''
        router.push(`/dashboard/advertisements/create/${response.product.id}`)
      } else {
        // Показываем уведомление об успешном добавлении
        await loadProducts()
        showAddModal.value = false
        articleInput.value = ''
        snackbar.notify({
          text: 'Товар успешно добавлен',
          color: 'success',
        })
      }
    }
  } catch (error) {
    snackbar.notify({
      text: error.response._data.message ?? 'Произошла ошибка',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Массовая остановка товаров
const stopSelected = async () => {
  if (!selectedRows.value.length) return
  const productIds = selectedRows.value

  // Оптимистичное обновление
  const originalStatuses = new Map()

  products.value.forEach(item => {
    if (productIds.includes(item.id)) {
      originalStatuses.set(item.id, item.status)
      item.status = 1 // Устанавливаем неактивный статус
    }
  })

  try {
    loading.value = true
    await nextTick()
    await api.products.stopSellerProducts(productIds)
    await loadProducts()
    selectedRows.value = []
    snackbar.notify({
      text: 'Товары остановлены',
      color: 'success',
    })
  } catch (error) {
    // Откат при ошибке
    products.value.forEach(item => {
      if (productIds.includes(item.id)) {
        item.status = originalStatuses.get(item.id)
      }
    })
    snackbar.notify({
      text: 'Ошибка при остановке товаров',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Архивирование товаров
const showArchiveModal = ref(false)

const archiveSelected = async () => {
  if (!selectedRows.value.length) return
  showArchiveModal.value = true
}

const confirmArchive = async () => {
  const productIds = selectedRows.value

  // Оптимистичное обновление (удаляем из списка)
  const originalProducts = [...products.value]

  products.value = products.value.filter(item => !productIds.includes(item.id))

  try {
    loading.value = true
    await nextTick()
    await api.products.archiveSellerProducts(productIds)
    await loadProducts()
    selectedRows.value = []
    snackbar.notify({
      text: 'Товары заархивированы',
      color: 'success',
    })
  } catch (error) {
    // Откат при ошибке
    products.value = originalProducts
    snackbar.notify({
      text: 'Ошибка при архивировании товаров',
      color: 'error',
    })
  } finally {
    loading.value = false
    showArchiveModal.value = false
  }
}

// Проверка, выбраны ли товары
const hasSelection = computed(() => selectedRows.value.length > 0)

// Обработчик выбора строки
const toggleSelect = item => {
  const index = selectedRows.value.indexOf(item.id)
  if (index === -1) {
    selectedRows.value.push(item.id)
  } else {
    selectedRows.value.splice(index, 1)
  }
}

// Выбор всех строк
const selectAll = computed({
  get: () => selectedRows.value.length === products?.value?.length && products?.value?.length > 0,
  set: value => {
    selectedRows.value = value ? products?.value?.map(item => item.id) : []
  },
})

// Текст пагинации
const paginationText = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage + 1
  const end = Math.min(currentPage.value * itemsPerPage, totalItems.value)
  
  return `${start}-${end} из ${totalItems.value}`
})

// Общее количество страниц
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

// Обработчики для поиска и фильтров
const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

const handleFilterArchived = () => {
  currentPage.value = 1
  loadProducts()
}

const handleFilterStatus = value => {
  if (value === 'archived') {
    filters.value.is_archived = true
  } else {
    filters.value.is_archived = null
  }

  filters.value.status = value

  currentPage.value = 1
  loadProducts()
}

const loadRelated = ref(false)
</script>

<template>
  <VContainer fluid>
    <VTabs
      color="deep-purple-accent-4"
      align-tabs="start"
      class="md-and-up"
    >
      <VTab
        to="/dashboard/products"
        class="text-primary px-1 pb-4 text-body-2"
      >
        Товары <span
          v-if="products?.length"
          class="pl-1"
        >  ({{ products?.length }})</span>
      </VTab>
      <VTab 
        to="/dashboard/advertisements"         
        class="text-secondary px-1 pb-4 text-body-2 mx-4"
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
    <VRow class="mb-4 mt-5 md-and-up">
      <VCol cols="auto">
        <VBtn
          color="primary"
          prepend-icon="ri-add-fill"
          @click="showAddModal = true"
        >
          Добавить товар
        </VBtn>
      </VCol>
      <VCol cols="auto">
        <VMenu>
          <template #activator="{ props }">
            <VBtn
              color="secondary"
              variant="outlined"
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
    <VRow
      v-if="$vuetify.display.smAndDown || !$vuetify.display.mdAndUp"
      class="mb-4"
    >
      <VCol cols="12">
        <VBtn
          color="primary"
          prepend-icon="ri-add-fill"
          class="mb-2 !text-body-1"
          style="font-size: 14px !important"
          @click="showAddModal = true"
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
            class="text-primary px-1 pb-4 text-body-2 font-weight-bold"
            style="font-size: 14px !important"
          >
            Товары <span
              v-if="products.length"
              class="pl-1"
            >  ({{ products.length }})</span>
          </VTab>
          <VTab 
            to="/dashboard/advertisements"         
            class="text-secondary px-1 pb-4 text-body-2 font-weight-bold mx-4"
            style="font-size: 14px !important"
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
          v-for="item in products"
          v-else-if="products.length"          
          :key="item.id"
          elevation="1"
          width="100%"
          class="pa-4 border"
        >
          <div class="d-flex gap-3 w-100">
            <VImg
              :src="item.images[0]"
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
                {{ item.id }}
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
          <div class="d-flex justify-between mt-3 !font-weight-medium">
            <ul class="w-50">
              <li class="list-none">
                <p
                  class="text-overline ma-0 text-medium-emphasis"
                  style="font-size: 10px !important; font-weight: 500 !important;"
                >
                  Объявления
                </p>
                <span
                  class="text-high-emphasis"
                  style="font-size: 16px !important; font-weight: 500 !important;"
                >{{ item.ads_count }} шт.</span>
              </li>
              <li class="list-none my-1">
                <p
                  class="text-overline ma-0 text-medium-emphasis"
                  style="font-size: 10px !important; font-weight: 500 !important;"
                >
                  CR (Переход/Заказ)
                </p>
                <span
                  class="text-high-emphasis"
                  style="font-size: 16px !important; font-weight: 500 !important"
                >
                  {{
                    item.conversion && item.completed_buybacks_count
                      ? ((item.completed_buybacks_count / item.conversion) * 100).toFixed(1) + '%'
                      : '0%'
                  }}
                </span>
              </li>
              <li class="list-none my-1">
                <p
                  class="text-overline ma-0 text-medium-emphasis"
                  style="font-size: 10px !important; font-weight: 500 !important;"
                >
                  Выкупы в процессе
                </p>
                <span
                  class="text-high-emphasis"
                  style="font-size: 16px !important; font-weight: 500 !important"
                >{{ item.completed_buybacks_count }}</span>
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
                >{{ item.views || 0 }}</span>
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
                >{{ item.conversion }}</span>
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
                >{{ item.completed_buybacks_count }}</span>
              </li>
            </ul>
          </div>
          <div class="d-flex justify-end align-center w-100">
            <VMenu>
              <template #activator="{ props }">
                <IconBtn
                  icon
                  color="transparent"
                  height="24"
                  rounded="lg"
                  v-bind="props"
                >
                  <VIcon>
                    ri-more-line
                  </VIcon>
                </IconBtn>
              </template>
              <VList>
                <VListItem @click="stopSelected">
                  <VListItemTitle>
                    {{ item.status === 1 ? 'Остановить' : 'Активировать' }}
                  </VListItemTitle>
                </VListItem>
                <VListItem @click="showArchiveModal = true">
                  <VListItemTitle>Архивировать</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </div>
        </VCard>
        <div
          v-else
          class="text-center  w-100"
        >
          <p>Тут пока пусто</p>
        </div>
      </VCol>
    </VRow>
    <!-- Таблица товаров -->
    <VTable class="rounded-table md-and-up">
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
          <th class="text-uppercase">
            CTR
          </th>
          <th class="text-uppercase">
            CR
          </th>
          <th class="text-uppercase">
            Переходы
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="loading"
          class="loading-row"
        >
          <td
            colspan="10"
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
            v-for="item in products"
            :key="item.id"
            :class="{ 'selected-row': selectedRows.includes(item.id) }"
          >
            <td>
              <div class="d-flex align-center gap-3">
                <VCheckbox
                  :model-value="selectedRows.includes(item.id)"
                  hide-details
                  width="36"
                  @update:model-value="() => toggleSelect(item)"
                />
                <VAvatar
                  v-if="item.images"
                  size="40"
                >
                  <VImg :src="item.images[0]" />
                </VAvatar>
                <div
                  class="d-flex flex-column"
                  style="max-width: 179px;"
                >
                  <RouterLink
                    :to="'/dashboard/advertisements?product_id='+item.id"
                    class="text-no-wrap overflow-hidden text-body-2 font-weight-medium"
                  >
                    {{ truncateName(item.name) }}                    
                  </RouterLink>
                  {{ item.wb_id }}
                </div>
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
            <td>{{ item.buybacks_progress }}</td>
            <td>{{ item.views || 0 }}</td>
            <td>{{ item.completed_buybacks_count || 0 }}</td>
            <td>{{ item.conversion }}</td>
            <td>{{ item.ads_count }}</td>
            <td>{{ item.ctr }}</td>
            <td>{{ item.cr }}</td>
            <td>{{ item.clicks }}</td>
          </tr>
          <tr v-if="!products?.length && !filters.is_archived">
            <td
              colspan="10"
              class="text-center pb-7"
            >
              <VBtn
                color="primary"
                class="mt-7 mb-7"
                @click="showAddModal = true"
              >
                <VIcon>ri-add-line</VIcon>
                Добавить
              </VBtn>
              <br>
              <span class="text-subtitle-1">Загрузите первый товар, чтобы начать продвижение</span>
            </td>
          </tr>
          <tr v-else-if="!products?.length && filters.is_archived">
            <td
              colspan="10"
              class="text-center pb-7 pt-3"
            >
              <span class="text-subtitle-1">Архивных товаров нет</span>
            </td>
          </tr>
        </template>
      </tbody>
    </VTable>

    <!-- Пагинация -->
    <div
      v-if="products?.length && !loading && totalItems > itemsPerPage"
      class="text-center mt-4"
    >
      <div>{{ paginationText }}</div>
      <VPagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        @update:model-value="loadProducts"
      />
    </div>

    <!-- Модальное окно для добавления товара -->
    <VDialog
      v-model="showAddModal"
      max-width="500"
    >
      <VCard>
        <VCardTitle>Добавить товар</VCardTitle>
        <VCardText>
          <VTextField
            v-model="articleInput"
            label="Артикул WB"
            required
          />

          <VCheckbox
            v-model="loadRelated"
            label="Загрузить связанные товары"
            @update:model-value="loadReload = !loadReload"
          />
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="primary"
            :disabled="!articleInput"
            @click="addProduct"
          >
            Добавить
          </VBtn>
          <VBtn @click="showAddModal = false">
            Отмена
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!--    Архивация -->
    <VDialog
      v-model="showArchiveModal"
      max-width="500"
    >
      <VCard>
        <VCardTitle>Архивировать товар?</VCardTitle>
        <VCardText>
          После архивации товара запустить объявления по нему будет невозможно.
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
          <p>
            Этот товар находится в магазине продавца "{{ shopData?.wb_name }}".
            <br>
            Подтвердите добавление магазина в ваш профиль на Wbdiscount.
          </p>
          <p class="text-caption">
            (Этот шаг делается один раз для новой учетной записи)
          </p>
          <VRow v-if="productData">
            <VCol cols="12">
              <VTextField
                v-model="productData.name"
                label="Товар"
                readonly
                class="mb-4"
              />

              <VTextField
                v-model="productData.price"
                label="Цена"
                readonly
                class="mb-4 custom-disabled-textfield"
              />

              <VTextField
                v-model="productData.brand"
                readonly
                label="Бренд"
                class="mb-4"
              />
            </VCol>

            <div class="w-100 text-center d-flex">
              <VImg
                v-if="productData.images && productData.images.length"
                :src="productData.images[0]"
                class="mb-2"
                width="225"
                height="300"
              />
            </div>
          </VRow>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            color="primary"
            :disabled="loading"
            @click="addProductToWb"
          >
            Далее
          </VBtn>
          <VBtn
            :disabled="loading"
            @click="showShopConfirmModal = false"
          >
            Отмена
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog
      v-model="showTestTariff"
      max-width="600"
    >
      <VCard>
        <VCardTitle>Благодарим за регистрацию!</VCardTitle>
        <VCardText>
          <p>
            В рамках тестового периода вы можете совершить до 10 выкупов в течение трёх дней с момента регистрации.
          </p>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn
            :disabled="loading"
            @click="showTestTariff = false"
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
  height: 200px; /* Фиксированная высота для центрирования индикатора */
  td {
    vertical-align: middle;
  }
}

.rounded-table {
  border-collapse: separate; /* Важно! */
  border-spacing: 0;
  border-radius: 0.5rem;
  overflow: hidden; /* Обрезает углы у внутренних элементов */
}

@media screen and (max-width: 800px) {
  .md-and-up {
    display: none;
  }  
}
</style>
