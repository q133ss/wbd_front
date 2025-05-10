<script setup>
import { ref, computed, nextTick } from 'vue'
import api from '@/api'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbar = useSnackbarStore()
const products = ref([])
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
const productData = ref(null)
const shopData = ref(null)

// Обрезка названия до 40 символов
const truncateName = (name) => {
  if (!name) return ''
  return name.length > 40 ? name.slice(0, 40) + '...' : name
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
      search: searchQuery.value || undefined
    })
    products.value = response.data
    totalItems.value = response.total || 0
    console.log('API response:', response)
    console.log('Total items:', totalItems.value)
    console.log('Current page:', currentPage.value)
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при загрузке товаров',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Инициальная загрузка
loadProducts()

// Переключение статуса
const toggleStatus = async (productId) => {
  const product = products?.value?.find(item => item.id === productId)
  if (!product) return
  const originalStatus = product.status
  product.status = product.status === 0 ? 1 : 0 // Оптимистичное обновление

  try {
    await nextTick()
    await api.products.stopSellerProducts([productId])
    snackbar.notify({
      text: 'Статус товара изменен',
      color: 'success'
    })
  } catch (error) {
    product.status = originalStatus // Откат при ошибке
    snackbar.notify({
      text: 'Ошибка при изменении статуса',
      color: 'error'
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
        color: 'error'
      })
      return
    }

    if (userData.value.shop) {
      // Если магазин есть, сразу добавляем товар
      await addProductToWb()
      return
    }

    // Если магазина нет, получаем данные о товаре
    const response = await api.products.fetchWbProduct(articleInput.value)

    // Проверяем, что ответ содержит нужные данные
    if (!response || !response.product || !response.shop) {
      snackbar.notify({
        text: 'Неверный формат данных товара или магазина',
        color: 'error'
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
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Добавление товара в WB
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
        router.push(`/dashboard/ads/create/${response.product.id}`)
      } else {
        // Показываем уведомление об успешном добавлении
        await loadProducts()
        showAddModal.value = false
        articleInput.value = ''
        snackbar.notify({
          text: 'Товар успешно добавлен',
          color: 'success'
        })
      }
    }
  } catch (error) {
    console.log(error.response._data)
    snackbar.notify({
      text: error.response._data.message ?? 'Произошла ошибка',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Массовая остановка товаров
const stopSelected = async () => {
  if (!selectedRows.value.length) return
  const productIds = selectedRows.value
  console.log('Stop product IDs:', productIds)

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
      color: 'success'
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
      color: 'error'
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
      color: 'success'
    })
  } catch (error) {
    // Откат при ошибке
    products.value = originalProducts
    snackbar.notify({
      text: 'Ошибка при архивировании товаров',
      color: 'error'
    })
  } finally {
    loading.value = false
    showArchiveModal.value = false
  }
}

// Проверка, выбраны ли товары
const hasSelection = computed(() => selectedRows.value.length > 0)

// Обработчик выбора строки
const toggleSelect = (item) => {
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
  set: (value) => {
    selectedRows.value = value ? products?.value?.map(item => item.id) : []
  }
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

const handleFilterStatus = () => {
  currentPage.value = 1
  loadProducts()
}

const userData = useCookie('userData')
</script>

<template>
  <v-container fluid>
    {{userData}}
    <!-- Панель управления -->
    <v-row class="mb-4" align="center">
      <v-col cols="auto">
        <v-btn
          color="primary"
          @click="showAddModal = true"
        >
          Добавить товар
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
              Все товары
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

    <!-- Таблица товаров -->
    <VTable>
      <thead>
      <tr>
        <th class="text-uppercase">
          <v-checkbox
            v-model="selectAll"
            :indeterminate="selectedRows.length > 0 && selectedRows.length < products.length"
            hide-details
          ></v-checkbox>
        </th>
        <th class="text-uppercase">Товар</th>
        <th class="text-uppercase">Статус</th>
        <th class="text-uppercase">Выкупов</th>
        <th class="text-uppercase">Просмотры</th>
        <th class="text-uppercase">Выкупы</th>
        <th class="text-uppercase">Конверсия</th>
        <th class="text-uppercase">Объявлений</th>
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
          v-for="item in products"
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
                v-if="item.images && item.images.length"
                :src="item.images[0]"
                max-width="50"
                max-height="66"
                class="mr-2"
              ></v-img>
              <span>{{ truncateName(item.name) }}</span>
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
          <td>{{ item.buybacks_progress }}</td>
          <td>{{ item.views }}</td>
          <td>{{ item.completed_buybacks_count }}</td>
          <td>{{ item.conversion }}</td>
          <td>{{ item.ads_count }}</td>
        </tr>
        <tr v-if="!products?.length">
          <td colspan="8" class="text-center">
            <v-alert icon="$warning" type="primary" class="ma-4">Товары не найдены</v-alert>
          </td>
        </tr>
      </template>
      </tbody>
    </VTable>

    <!-- Пагинация -->
    <div class="text-center mt-4" v-if="products?.length && !loading">
      <div>{{ paginationText }}</div>
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="7"
        @update:modelValue="loadProducts"
      ></v-pagination>
    </div>

    <!-- Модальное окно для добавления товара -->
    <v-dialog
      v-model="showAddModal"
      max-width="500"
    >
      <v-card>
        <v-card-title>Добавить товар</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="articleInput"
            label="Артикул WB"
            required
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="addProduct"
            :disabled="!articleInput"
          >
            Добавить
          </v-btn>
          <v-btn
            @click="showAddModal = false"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

<!--    Архивация-->
    <v-dialog
      v-model="showArchiveModal"
      max-width="500"
    >
      <v-card>
        <v-card-title>Архивировать товар?</v-card-title>
        <v-card-text>
          После архивации товара запустить объявления по нему будет невозможно.
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

    <!-- Модальное окно для подтверждения добавления магазина -->
    <v-dialog
      v-model="showShopConfirmModal"
      max-width="600"
    >
      <v-card>
        <v-card-title>Добавление магазина</v-card-title>
        <v-card-text>
          <p>Этот товар находится в магазине продавца "{{ shopData?.wb_name }}".</p>
          <p>Подтвердите добавление магазина в ваш профиль на Wbdiscount.</p>
          <p>(Этот шаг делается один раз для новой учетной записи)</p>
          <v-row v-if="productData">
            <v-col cols="12">
              <v-img
                v-if="productData.images && productData.images.length"
                :src="productData.images[0]"
                max-width="100"
                max-height="100"
                class="mb-2"
              ></v-img>
              <p><strong>Товар:</strong> {{ productData.title }}</p>
              <p><strong>Цена:</strong> {{ productData.price }} руб.</p>
              <p><strong>Бренд:</strong> {{ productData.brand }}</p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="addProductToWb"
            :disabled="loading"
          >
            Далее
          </v-btn>
          <v-btn
            @click="showShopConfirmModal = false"
            :disabled="loading"
          >
            Отмена
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
  height: 200px; /* Фиксированная высота для центрирования индикатора */
  td {
    vertical-align: middle;
  }
}
</style>
