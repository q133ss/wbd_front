<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar.js'
import api from '@/api/index.js'

definePage({
  meta: {
    layout: 'default',
    authRequired: true
  },
})

const user = useCookie('userData').value
const role = user?.role?.slug
const isSeller = ref(false)
if (role === 'seller') {
  isSeller.value = true
}

const snackbar = useSnackbarStore()
const router = useRouter()

// Balance data
const balance = ref(null)
const loading = ref(true)

// Top-up popup
const showTopUpModal = ref(false)
const showWithdrawModal = ref(false)
const withdrawAmount = ref(false)
const topUpAmount = ref('')
const cardNumber = ref('')

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
const type = ref('all') // 'all', 'deposit', 'withdraw'

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

const withdraw = async () => {
  if(!cardNumber.value || !withdrawAmount.value) {
    snackbar.notify({
      text: 'Введите номер карты и сумму',
      color: 'error'
    })
    return
  }

  // Исправленная проверка длины (value.length вместо lenght)
  if(cardNumber.value.length < 16) {
    snackbar.notify({
      text: 'Введите корректный номер карты (16 цифр)',
      color: 'error'
    })
    return
  }

  try {
    // Передаём значения отдельными аргументами, а не объектом
    const response = await api.balance.withdraw(
      withdrawAmount.value,  // первый аргумент - amount
      cardNumber.value       // второй аргумент - card_number
    )

    if(response.status) {
      snackbar.notify({
        text: response.message,
        color: 'success'
      })
    }
    location.reload();
  } catch (err) {
    console.error('Full error:', err)
    snackbar.notify({
      text: err.response?._data?.message || 'Произошла ошибка',
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

const selectType = (selectType) => {
  type.value = selectType
  transactionFilters.value.type = type === '' ? '' : type
  transactionPage.value = 1
  applyFilters()
}

const tariffs = ref([])

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

// Fetch tariffs
onMounted(async () => {
  try {
    const response = await api.tariff.getTariffList()
    tariffs.value = response || []
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки тарифов',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
})

// Buy tariff
const buyTariff = async (tariff) => {
  try {
    await api.balance.topUpBuybacks(tariff.buybacks_count)
    snackbar.notify({
      text: `Тариф "${tariff.name}" успешно приобретен`,
      color: 'success'
    })
  } catch (error) {
    const errorMessage = error.response?._data?.message || 'Ошибка при покупке тарифа'
    snackbar.notify({
      text: errorMessage,
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="balance-container">

    <div class="content-wrapper">
      <h1 class="text-h4 mb-2">Баланс выкупов</h1>
      <p class="text-body-1 mb-6">Управляйте вашим балансом, просматривайте транзакции и пополняйте счет</p>

      <div v-if="loading" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div v-else>
        <!-- Balance and Details -->
        <v-row class="mb-6">
          <v-col cols="12" md="3">
            <div class="balance-box pa-6 pb-3" v-if="isSeller">
              <p class="text-h5">Ваш баланс выкупов: <span class="font-weight-bold h-3 access-balance d-block mt-3">{{ redemptionCount }}</span></p>
            </div>
            <div class="buybacks-wrap" v-if="isSeller">
              <div class="text-none buybacks-btn promo-btn"
                   @click="showPromoModal = true">
                Ввести промокод
              </div>
            </div>

          </v-col>
          <v-col cols="12" md="4" v-if="isSeller">
            <div class="details-box">
              <h3 class="text-h6 mb-4">Потраченно</h3>
              <div class="d-flex flex-column">
                <div class="d-flex">
                  <span class="text-body-1 w-25">Сегодня:</span>
                  <span class="font-weight-bold">1 выкуп</span>
                </div>
                <div class="d-flex">
                  <span class="text-body-1 w-25">Вчера:</span>
                  <span class="font-weight-bold">2 выкупа</span>
                </div>
                <div class="d-flex">
                  <span class="text-body-1 w-25">За 7 дней:</span>
                  <span class="font-weight-bold">8 выкупов</span>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>


        <!--        Тарифы-->
        <div class="tariffs-container">
          <div class="content-wrapper">
            <h1 class="text-h4 mb-2">Тарифы</h1>
            <p class="text-body-1 mb-8">Выберите подходящий тариф для продвижения ваших товаров с кэшбеком</p>

            <div v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary" />
            </div>

            <v-row v-else>
              <v-col
                v-for="tariff in tariffs"
                :key="tariff.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
                <v-card class="tariff-card pa-6" min-height="400">
                  <div class="card-content">
                    <div class="d-flex justify-between">
                      <h2 class="text-h5 mb-4 font-weight-bold tariff-name">{{ tariff.name }}</h2>
                      <div class="tariff-badge">Бессрочно</div>
                    </div>
                    <p class="text-h6 font-weight-bold mb-2">{{ tariff.price }} ₽</p>
                    <p class="text-body-1 mb-4">
                      {{ tariff.buybacks_count }} {{ getBuybackDeclension(tariff.buybacks_count) }}
                    </p>
                    <v-divider class="mb-4" />
                    <div class="min-100">
                      <div
                        v-for="(advantage, index) in tariff.advantages"
                        :key="index"
                        class="text-body-2 adv-item"
                      >
                        {{ advantage }}
                      </div>
                    </div>
                    <p class="text-body-1 mt-12 text-center opacity-50">
                      Стоимость выкупа: {{ tariff.redemption_price }} ₽
                    </p>
                  </div>
                  <v-btn
                    color="primary"

                    @click="buyTariff(tariff)"
                  >
                    Купить
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
        <!--        / Тарифы -->

        <!-- Transaction Filters -->
        <div class="filters-box mt-10 mb-6">
          <h1 class="text-h4 mb-4">Фильтры транзакций</h1>

          <div class="filter-group mb-2">
            <v-btn variant="text" @click="selectType('')" :active="type == 'all'" :class="{ 'active-tab': type === 'all' }">Все транзакции</v-btn>
            <v-btn variant="text" @click="selectType('deposit')" :active="type == 'deposit'" :class="{ 'active-tab': type === 'deposit' }">Пополнения</v-btn>
            <v-btn variant="text" @click="selectType('withdraw')" :active="type == 'withdraw'" :class="{ 'active-tab': type === 'withdraw' }">Списания</v-btn>
          </div>
          <v-row>
            <v-col cols="12" md="6">
              <v-btn
                color="primary"
                size="large"
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
          <h3 class="text-h6 mb-4">Детализация</h3>
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
                {{ transaction.currency_type === 'cash' ?  '₽' : '' }}
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

<!--      Вывод средств-->
      <v-dialog v-model="showWithdrawModal" max-width="400px">
        <v-sheet class="pa-6">
          <h2 class="text-h5 mb-4">Вывести деньги</h2>
          <v-text-field
            v-model="withdrawAmount"
            label="Сумма (₽)"
            type="number"
            min="1000"
            outlined
          />
          <v-text-field
            v-model="cardNumber"
            label="Номер карты"
            v-mask="'#### #### #### ####'"
            class="mt-2"
            type="text"
            outlined
          />
          <div class="d-flex justify-end mt-4">
            <v-btn
              color="secondary"
              class="mr-2"
              @click="showWithdrawModal = false"
            >
              Отмена
            </v-btn>
            <v-btn
              color="primary"
              @click="withdraw"
            >
              Вывести
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
.balance-box{
  display: flex;
  gap: 30px;
  border: 1px solid #D0D5DD;
  border-radius: 15px;
  align-items: center;
  justify-content: space-between;
}
.access-balance{
  font-size: 26px;
}

.on-confimation{
  font-size: 26px;
  color: #9BA5BA;
}

.buybacks-wrap{
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.buybacks-box{
  display: flex;
  gap: 20px;
  border: 1px solid #D0D5DD;
  border-radius: 15px;
  padding: 10px;
  cursor: pointer;
}

.buybacks-btn{
  cursor: pointer;
  border: 1px solid #D0D5DD;
  padding: 10px;
  border-radius: 15px;
}

.buybacks-plus-btn{
  color: #9BA5BA;
  margin-left: 5px;
}

.details-box p{
  margin-bottom: 0;
}

@media screen and (max-width: 960px) {
  .balance-box {
    flex-direction: column;
    align-items: flex-start;
    gap: 0px;
  }
  .buybacks-wrap {
    flex-direction: column;
    gap: 10px;
  }

  .details-box p{
    display: flex;
    justify-content: space-between;
  }

  .filters-box{
    padding: 0 !important;
  }
}

.content-wrapper {
  max-width: 1200px;
  margin-left: 0;
}

.tariff-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.card-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.advantages-list {
  list-style-type: disc;
  padding-left: 20px;
  text-decoration: none;

  li {
    margin-bottom: 8px;
  }
}

.adv-item {
  display: flex; // Добавляем flex для выравнивания
  align-items: flex-start; // Выравниваем по верхнему краю
  margin-bottom: 8px;
  padding-left: 30px; // Отступ для иконки
  position: relative; // Для позиционирования псевдоэлемента
  font-size: 14px!important;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 2px; // Подправляем вертикальное выравнивание
    width: 18px;
    height: 18px;
    background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='18' height='18' rx='9' fill='%23D1FADF'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M12.8215 5.5425L7.45152 10.725L6.02652 9.2025C5.76402 8.955 5.35152 8.94 5.05152 9.15C4.75902 9.3675 4.67652 9.75 4.85652 10.0575L6.54402 12.8025C6.70902 13.0575 6.99402 13.215 7.31652 13.215C7.62402 13.215 7.91652 13.0575 8.08152 12.8025C8.35152 12.45 13.504 6.3075 13.504 6.3075C14.179 5.6175 13.3615 5.01 12.8215 5.535V5.5425Z' fill='%2312B76A'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    flex-shrink: 0; // Запрещаем сжатие
    margin-right: 6px; // Отступ между иконкой и текстом
  }
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

.promo-btn{
  background: rgb(var(--v-theme-primary));
  color: #ffffff;
}

.justify-between{
  justify-content: space-between;
  align-items: start;
}

.tariff-name{
  font-size: 20px!important;
}

.tariff-badge{
  color: #175CD3;
  background-color: #EFF8FF;
  padding: 5px 10px;
  font-size: 13px;
  border-radius: 35px;
}

.min-100{
  min-height: 100px;
}
</style>
