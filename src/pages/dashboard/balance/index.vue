<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/api/Index'

const snackbar = useSnackbarStore()
const router = useRouter()

// Balance data
const balance = ref(null)
const loading = ref(true)

// Top-up popup
const showTopUpModal = ref(false)
const topUpAmount = ref('')

// Promo code modal
const showPromoModal = ref(false)
const promoCode = ref('')

// Transaction data
const transactions = ref([])
const transactionFilters = ref({
  product_id: '',
  ads_id: ''
})
const transactionPage = ref(1)
const transactionLastPage = ref(1)

// Product modal data
const showProductModal = ref(false)
const products = ref([])
const productPage = ref(1)
const productLastPage = ref(1)
const productSearch = ref('')

// Fetch balance, initial products, and transactions
onMounted(async () => {
  try {
    const [balanceResponse, productsResponse, transactionsResponse] = await Promise.all([
      api.balance.getBalance(),
      api.products.getSellerProducts({ page: 1 }),
      api.balance.getTransactions({ page: 1 })
    ])
    balance.value = balanceResponse
    products.value = productsResponse?.data || []
    productLastPage.value = productsResponse?.last_page || 1
    transactions.value = transactionsResponse?.data || []
    transactionLastPage.value = transactionsResponse?.last_page || 1
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки данных',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
})

// Computed properties
const accessBalance = computed(() => {
  return balance.value ? Math.floor(parseFloat(balance.value.accessBalance)) : 0
})

const onConfirmation = computed(() => {
  return balance.value ? Math.floor(parseFloat(balance.value.onConfirmation)) : 0
})

const redemptionCount = computed(() => {
  return balance.value?.redemption_count || 0
})

const spentToday = computed(() => {
  return balance.value?.transactionData?.today || '0'
})

const spentYesterday = computed(() => {
  return balance.value?.transactionData?.yesterday || '0'
})

const spentLast7Days = computed(() => {
  return balance.value?.transactionData?.last_7_days || '0'
})

const selectedProductName = computed(() => {
  if (!transactionFilters.value.product_id) return 'Выберите товар'
  const product = products.value.find(p => p.id === transactionFilters.value.product_id)
  return product ? product.name : 'Выберите товар'
})

// Declension function for "выкуп"
const getBuybackDeclension = (count) => {
  const num = Math.abs(count)
  if (num % 10 === 1 && num % 100 !== 11) {
    return 'выкуп'
  } else if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) {
    return 'выкупа'
  } else {
    return 'выкупов'
  }
}

// Format transaction type
const formatCurrencyType = (type) => {
  return type === 'cash' ? 'Деньги' : type === 'buyback' ? 'Выкупы' : type
}

// Format transaction operation type
const formatOperationType = (type) => {
  return type === 'deposit' ? 'Пополнение' : type === 'withdraw' ? 'Списание' : type
}

// Format date
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Handlers
const topUpBalance = async () => {
  if (!topUpAmount.value || isNaN(topUpAmount.value) || topUpAmount.value <= 0) {
    snackbar.notify({
      text: 'Введите корректную сумму',
      color: 'error'
    })
    return
  }
  try {
    await api.balance.topUpBalance(parseFloat(topUpAmount.value))
    snackbar.notify({
      text: 'Баланс успешно пополнен',
      color: 'success'
    })
    const balanceResponse = await api.balance.getBalance()
    balance.value = balanceResponse
    showTopUpModal.value = false
    topUpAmount.value = ''
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при пополнении баланса',
      color: 'error'
    })
  }
}

const applyPromoCode = async () => {
  if (!promoCode.value) {
    snackbar.notify({
      text: 'Введите промокод',
      color: 'error'
    })
    return
  }
  try {
    await api.promocode.applyPromocode(promoCode.value)
    snackbar.notify({
      text: 'Промокод успешно применен',
      color: 'success'
    })
    const balanceResponse = await api.balance.getBalance()
    balance.value = balanceResponse
    showPromoModal.value = false
    promoCode.value = ''
  } catch (error) {
    snackbar.notify({
      text: error.response._data.message ?? 'Ошибка при применении промокода',
      color: 'error'
    })
  }
}

const applyFilters = async () => {
  try {
    const transactionsResponse = await api.balance.getTransactions({
      ...transactionFilters.value,
      page: transactionPage.value
    })
    transactions.value = transactionsResponse?.data || []
    transactionLastPage.value = transactionsResponse?.last_page || 1
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки транзакций',
      color: 'error'
    })
  }
}

const fetchProducts = async () => {
  try {
    const productsResponse = await api.products.getSellerProducts({
      page: productPage.value,
      search: productSearch.value
    })
    products.value = productsResponse?.data || []
    productLastPage.value = productsResponse?.last_page || 1
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки товаров',
      color: 'error'
    })
  }
}

const selectProduct = (productId) => {
  transactionFilters.value.product_id = productId
  showProductModal.value = false
  applyFilters()
}

const goToTariffs = () => {
  router.push('/dashboard/tariffs')
}
</script>

<template>
  <div class="balance-container">
    <div class="content-wrapper">
      <h1 class="text-h4 mb-2">Баланс</h1>
      <p class="text-body-1 mb-6">Управляйте вашим балансом, просматривайте транзакции и пополняйте счет</p>

      <div v-if="loading" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div v-else>
        <!-- Balance and Details -->
        <v-row class="mb-6">
          <v-col cols="12" md="8">
            <div class="balance-box pa-6">
              <h3 class="text-h6 mb-4">Баланс</h3>
              <p class="text-h5 font-weight-bold primary--text">Доступный баланс: {{ accessBalance }} ₽</p>
              <p class="text-h5 font-weight-bold primary--text">Замороженный баланс: {{ onConfirmation }} ₽</p>
              <v-btn
                color="primary"
                class="mt-4"
                @click="showTopUpModal = true"
              >
                Пополнить
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="details-box pa-4">
              <h3 class="text-h6 mb-4">Детализация</h3>
              <p class="text-body-1">Потрачено сегодня: {{ spentToday }} ₽</p>
              <p class="text-body-1">Потрачено вчера: {{ spentYesterday }} ₽</p>
              <p class="text-body-1">Потрачено за 7 дней: {{ spentLast7Days }} ₽</p>
            </div>
          </v-col>
        </v-row>

        <!-- Redemptions and Promo Code -->
        <div class="redemptions-box pa-6 mb-6">
          <v-row align="center">
            <v-col cols="12" md="6">
              <p class="text-h5 font-weight-bold primary--text">
                Количество выкупов: {{ redemptionCount }} {{ getBuybackDeclension(redemptionCount) }}
              </p>
            </v-col>
            <v-col cols="12" md="6" class="text-md-right">
              <v-btn
                color="primary"
                class="mr-2"
                @click="goToTariffs"
              >
                +
              </v-btn>
              <v-btn
                color="secondary"
                @click="showPromoModal = true"
              >
                Ввести промокод
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <!-- Transaction Filters -->
        <div class="filters-box pa-4 mb-6">
          <h3 class="text-h6 mb-4">Фильтры транзакций</h3>
          <v-row>
            <v-col cols="12" md="6">
              <v-btn
                color="primary"
                block
                @click="showProductModal = true; fetchProducts()"
              >
                {{ selectedProductName }}
              </v-btn>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="transactionFilters.ads_id"
                label="ID объявления"
                type="number"
                @input="applyFilters"
              />
            </v-col>
          </v-row>
        </div>

        <!-- Transactions Table -->
        <div class="transactions-box pa-4">
          <h3 class="text-h6 mb-4">Транзакции</h3>
          <v-table>
            <thead>
            <tr>
              <th>ID</th>
              <th>Сумма</th>
              <th>Тип</th>
              <th>Тип операции</th>
              <th>Дата и время</th>
              <th>Описание</th>
              <th>ID объявления</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="transaction in transactions" :key="transaction.id">
              <td>{{ transaction.id }}</td>
              <td>
                {{ Math.floor(parseFloat(transaction.amount)) }}
                {{ transaction.currency_type === 'cash' ? '₽' : getBuybackDeclension(transaction.amount) }}
              </td>
              <td>{{ formatCurrencyType(transaction.currency_type) }}</td>
              <td :class="{
                  'success--text': transaction.transaction_type === 'deposit',
                  'error--text': transaction.transaction_type === 'withdraw'
                }">
                {{ formatOperationType(transaction.transaction_type) }}
              </td>
              <td>{{ formatDate(transaction.created_at) }}</td>
              <td>{{ transaction.description }}</td>
              <td>{{ transaction.ads_id || '-' }}</td>
            </tr>
            </tbody>
          </v-table>
          <v-pagination
            v-model="transactionPage"
            :length="transactionLastPage"
            class="mt-4"
            @update:modelValue="applyFilters"
          />
        </div>
      </div>

      <!-- Top-Up Modal -->
      <v-dialog v-model="showTopUpModal" max-width="400px">
        <v-sheet class="pa-6">
          <h2 class="text-h5 mb-4">Пополнить баланс</h2>
          <v-text-field
            v-model="topUpAmount"
            label="Сумма (₽)"
            type="number"
            min="1"
            outlined
          />
          <div class="d-flex justify-end mt-4">
            <v-btn
              color="secondary"
              class="mr-2"
              @click="showTopUpModal = false"
            >
              Отмена
            </v-btn>
            <v-btn
              color="primary"
              @click="topUpBalance"
            >
              Пополнить
            </v-btn>
          </div>
        </v-sheet>
      </v-dialog>

      <!-- Promo Code Modal -->
      <v-dialog v-model="showPromoModal" max-width="400px">
        <v-sheet class="pa-6">
          <h2 class="text-h5 mb-4">Ввести промокод</h2>
          <v-text-field
            v-model="promoCode"
            label="Промокод"
            outlined
          />
          <div class="d-flex justify-end mt-4">
            <v-btn
              color="secondary"
              class="mr-2"
              @click="showPromoModal = false"
            >
              Отмена
            </v-btn>
            <v-btn
              color="primary"
              @click="applyPromoCode"
            >
              Применить
            </v-btn>
          </div>
        </v-sheet>
      </v-dialog>

      <!-- Product Selection Modal -->
      <v-dialog v-model="showProductModal" max-width="600px">
        <v-sheet class="pa-6">
          <h2 class="text-h5 mb-4">Выберите товар</h2>
          <v-text-field
            v-model="productSearch"
            label="Поиск по названию"
            outlined
            class="mb-4"
            @input="productPage = 1; fetchProducts()"
          />
          <v-list>
            <v-list-item
              v-for="product in products"
              :key="product.id"
              @click="selectProduct(product.id)"
              class="product-item"
            >
              <v-list-item-title>{{ product.name }}</v-list-item-title>
              <v-list-item-subtitle>ID: {{ product.id }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-pagination
            v-model="productPage"
            :length="productLastPage"
            class="mt-4"
            @update:modelValue="fetchProducts"
          />
          <div class="d-flex justify-end mt-4">
            <v-btn
              color="secondary"
              @click="showProductModal = false"
            >
              Закрыть
            </v-btn>
          </div>
        </v-sheet>
      </v-dialog>
    </div>
  </div>
</template>

<style scoped lang="scss">
.balance-container {
  padding: 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin-left: 0;
}

.balance-box,
.details-box,
.redemptions-box,
.filters-box,
.transactions-box {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.balance-box,
.redemptions-box {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

:deep(.v-field) {
  background-color: #f5f5f5;
  border-radius: 4px;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

:deep(.v-table) {
  background-color: #fff;
}

:deep(.v-table th) {
  font-weight: bold;
  color: #333;
}

:deep(.v-table td) {
  padding: 8px;
}

.product-item {
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f5f5f5;
  }
}

.primary--text {
  color: #1976d2 !important;
}

.success--text {
  color: #4caf50 !important;
}

.error--text {
  color: #f44336 !important;
}
</style>
