<script setup>
import api from '@/api/index.js'
import { useSnackbarStore } from '@/stores/snackbar.js'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

definePage({
  meta: {
    layout: 'default',
    authRequired: true,
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
  ads_id: '',
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
      api.balance.getTransactions({ page: 1 }),
    ])

    balance.value = balanceResponse
    products.value = productsResponse?.data || []
    productLastPage.value = productsResponse?.last_page || 1
    transactions.value = transactionsResponse?.data || []
    transactionLastPage.value = transactionsResponse?.last_page || 1
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки данных',
      color: 'error',
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

const tariff = computed(() => {
  return balance.value?.tariff || null
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
const formatCurrencyType = type => {
  return type === 'cash' ? 'Деньги' : type === 'buyback' ? 'Выкупы' : type
}

// Format transaction operation type
const formatOperationType = type => {
  return type === 'deposit' ? 'Пополнение' : type === 'withdraw' ? 'Списание' : type
}

// Format date
const formatDate = dateStr => {
  const date = new Date(dateStr)
  
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Handlers
const topUpBalance = async () => {
  if (!topUpAmount.value || isNaN(topUpAmount.value) || topUpAmount.value <= 0) {
    snackbar.notify({
      text: 'Введите корректную сумму',
      color: 'error',
    })
    
    return
  }
  try {
    await api.balance.topUpBalance(parseFloat(topUpAmount.value))
    snackbar.notify({
      text: 'Баланс успешно пополнен',
      color: 'success',
    })

    const balanceResponse = await api.balance.getBalance()

    balance.value = balanceResponse
    showTopUpModal.value = false
    topUpAmount.value = ''
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при пополнении баланса',
      color: 'error',
    })
  }
}

const withdraw = async () => {
  if(!cardNumber.value || !withdrawAmount.value) {
    snackbar.notify({
      text: 'Введите номер карты и сумму',
      color: 'error',
    })
    
    return
  }

  // Исправленная проверка длины (value.length вместо lenght)
  if(cardNumber.value.length < 16) {
    snackbar.notify({
      text: 'Введите корректный номер карты (16 цифр)',
      color: 'error',
    })
    
    return
  }

  try {
    // Передаём значения отдельными аргументами, а не объектом
    const response = await api.balance.withdraw(
      withdrawAmount.value,  // первый аргумент - amount
      cardNumber.value,       // второй аргумент - card_number
    )

    if(response.status) {
      snackbar.notify({
        text: response.message,
        color: 'success',
      })
    }
    location.reload()
  } catch (err) {
    console.error('Full error:', err)
    snackbar.notify({
      text: err.response?._data?.message || 'Произошла ошибка',
      color: 'error',
    })
  }
}

const declension = (number, titles) => {
  const cases = [2, 0, 1, 1, 1, 2]
  
  return titles[
    number % 100 > 4 && number % 100 < 20
      ? 2
      : cases[number % 10 < 5 ? number % 10 : 5]
  ]
}

const applyPromoCode = async () => {
  if (!promoCode.value) {
    snackbar.notify({
      text: 'Введите промокод',
      color: 'error',
    })
    
    return
  }
  try {
    await api.promocode.applyPromocode(promoCode.value)
    snackbar.notify({
      text: 'Промокод успешно применен',
      color: 'success',
    })

    const balanceResponse = await api.balance.getBalance()

    balance.value = balanceResponse
    showPromoModal.value = false
    promoCode.value = ''
  } catch (error) {
    snackbar.notify({
      text: error.response._data.message ?? 'Ошибка при применении промокода',
      color: 'error',
    })
  }
}

const applyFilters = async () => {
  try {
    const transactionsResponse = await api.balance.getTransactions({
      ...transactionFilters.value,
      page: transactionPage.value,
    })

    transactions.value = transactionsResponse?.data || []
    transactionLastPage.value = transactionsResponse?.last_page || 1
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки транзакций',
      color: 'error',
    })
  }
}

const fetchProducts = async () => {
  try {
    const productsResponse = await api.products.getSellerProducts({
      page: productPage.value,
      search: productSearch.value,
    })

    products.value = productsResponse?.data || []
    productLastPage.value = productsResponse?.last_page || 1
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки товаров',
      color: 'error',
    })
  }
}

const selectProduct = productId => {
  transactionFilters.value.product_id = productId
  showProductModal.value = false
  applyFilters()
}

const goToTariffs = () => {
  router.push('/dashboard/tariffs')
}

const selectType = selectType => {
  type.value = selectType
  transactionFilters.value.type = type.value === '' ? '' : type
  transactionPage.value = 1
  applyFilters()
}

const tariffs = ref([])

// Declension function for "выкуп"
const getBuybackDeclension = count => {
  const num = Math.abs(count)
  if (num % 10 === 1 && num % 100 !== 11) {
    return 'выкуп'
  } else if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) {
    return 'выкупа'
  } else {
    return 'выкупов'
  }
}

const selectedTariff = ref(0)

const selectTariff = id => {
  selectedTariff.value = id
}

// Fetch tariffs
onMounted(async () => {
  try {
    const response = await api.tariff.getTariffList()

    tariffs.value = response || []
    console.log(tariffs.value)
    
    if (tariffs.value.length > 0) {
      selectedTariff.value = tariffs.value[0].id
    }

  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки тарифов',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
})

// Buy tariff
const buyTariff = async (tariff, days) => {
  try {
    const response = await api.balance.topUpBuybacks(tariff.id, days)
    const url = response.invoice.Url

    location.href=url

    // snackbar.notify({
    //   text: `Тариф "${tariff.name}" успешно приобретен`,
    //   color: 'success'
    // })
  } catch (error) {
    const errorMessage = error.response?._data?.message || 'Ошибка при покупке тарифа'

    snackbar.notify({
      text: errorMessage,
      color: 'error',
    })
  }
}

const getTariffEndDate = tariff => {
  const pivot = tariff.pivot

  if (!pivot) return 'Нет данных'

  // Если есть точная дата окончания — используем её
  const endDate = pivot.end_date ? new Date(pivot.end_date) : null

  // Если нет, рассчитываем по created_at + duration_days
  let expirationDate
  if (endDate) {
    expirationDate = endDate
  } else {
    const createdAt = new Date(pivot.created_at)

    expirationDate = new Date(createdAt)
    expirationDate.setDate(expirationDate.getDate() + (tariff.duration_days || 0))
  }

  // Локализованный формат даты
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  const expirationDateString = expirationDate.toLocaleDateString('ru-RU', options)

  // Проверка, истёк ли тариф
  const now = new Date()
  if (now > expirationDate) {
    return 'Тариф истёк'
  }

  return expirationDateString
}

const translateStatus = (status) => {
  switch (status) {
  case 'pending':
    return 'В ожидании'
  case 'completed':
    return 'Завершён'
  case 'failed':
    return 'Отменен'
  default:
    return status
  }
}
</script>

<template>
  <VContainer class="ma-0 py-0">
    <h1 class="text-h3 mb-1 font-weight-bold">
      Баланс выкупов
    </h1>
    <p class="text-body-1 mb-6">
      Баланс > Тарифы
    </p>
    <h3 class="text-h5 font-weight-bold mb-3">
      Ваш тариф
    </h3>
    <div
      v-if="loading"
      class="text-center"
    >
      <VProgressCircular
        indeterminate
        color="primary"
      />
    </div>

    <div v-else>
      <!-- Balance and Details -->
      <VRow class="mb-6">
        <VCol
          cols="12"
          md="4"
        >
          <VCard
            v-if="isSeller"
            extended="2"
            variant="text"
            width="349"
            class="balance-box"
          >
            <p class="ma-0">
              <span class="font-weight-bold text-h6 text-primary d-block mb-2">{{ tariff?.name ?? 'Тариф не выбран' }}</span>
              <span
                v-if="tariff != null"
                class="text-subtitle-2"
              >Тариф действителен до {{ getTariffEndDate(tariff) }}</span>
              <span
                v-else
                class="text-subtitle-2"
              >
                Выберите тариф для начала работы
              </span>
            </p>
          </VCard>
          <VBtn
            v-if="isSeller"
            color="primary"
            class="mt-3 font-weight-bold"
            @click="showPromoModal = true"
          >
            Ввести промокод
          </VBtn>
        </VCol>
      </VRow>


      <!--        Тарифы -->
      <div class="tariffs-container">
        <div class="content-wrapper">
          <h1 class="text-h4 mb-2 font-weight-bold">
            Тарифы
          </h1>
          <p class="text-body-1 mb-8">
            Выберите тариф исходя из количества товаров для продвижения:
            <br><br>
            <span class="text-primary font-weight-bold">Lite</span> - до 10 товаров (безлимит по выкупам) <br>
            <span class="text-primary font-weight-bold">Pro</span> - до 50 товаров (безлимит по выкупам) <br>
            <span class="text-primary font-weight-bold">Superstar</span> - безлимит товаров и выкупов
          </p>

          <VBtn
            v-for="tariff in tariffs"
            :key="tariff.id"
            variant="text"
            :class="selectedTariff === tariff.id ? 'text-primary' : 'text-secondary'"
            class="ml-1 py-1 px-3 mb-6"
            rounded="lg"
            @click="selectTariff(tariff.id)"
          >
            {{ tariff.name }}
          </VBtn>



          <div
            v-if="loading"
            class="text-center"
          >
            <VProgressCircular
              indeterminate
              color="primary"
            />
          </div>
          <VRow
            v-else
            class="mt-3 card-wrap"
          >
            <template
              v-for="tariff in tariffs"
              :key="tariff.id"
            >
              <template v-if="selectedTariff == tariff.id">
                <div
                  v-for="(data, index) in tariff.data"
                  :key="index"
                  class="d-flex justify-start align-start gap-10 px-3"
                >
                  <VCard
                    class="tariff-card"
                    width="340"
                  >
                    <div class="card-content">
                      <div class="d-flex justify-between">
                        <h2 class="text-h5 mb-4 font-weight-bold tariff-name">
                          {{ data.name }}
                        </h2>
                        <div class="tariff-badge">
                          Скидка 50%
                        </div>
                      </div>
                      <div class="min-100">
                        <div class="text-body-2 adv-item text-no-wrap">
                          До {{ tariff.products_count }} товаров в месяц на магазин
                        </div>
                        <div class="text-body-2 adv-item text-no-wrap">
                          Безлимит по количеству выкупов
                        </div>
                      </div>
                    </div>
                    <div class="d-flex justify-between align-center mt-4 gap-5">
                      <VBtn
                        color="primary"
                        width="146"
                        @click="buyTariff(tariff, data.duration_days)"
                      >
                        Оформить
                      </VBtn>
                      <div class="text-left w-100">
                        <p class="text-h6 font-weight-bold ma-0">
                          {{ data.initial_price }} ₽
                          <span v-if="index === 0">в месяц</span>
                          <span v-else-if="index === 1">в 3 мес.</span>
                          <span v-else-if="index === 2">в год</span>
                        </p>
                        <p
                          class="ma-0"
                          style="font-size: 10px;"
                        >
                          Далее {{ data.recurring_price }} ₽
                          <span v-if="index === 0">/месяц</span>
                          <span v-else-if="index === 1">/ 3 месяца</span>
                          <span v-else-if="index === 2">/ в год</span>
                        </p>
                      </div>
                    </div>
                  </VCard>
                </div>
              </template>
            </template>
          </VRow>
        </div>
      </div>
      <!--        / Тарифы -->

      <!-- Transaction Filters -->
      <div class="filters-box mt-10 mb-6">
        <h1 class="text-h4 mb-4  font-weight-bold">
          Транзакции:
        </h1>
      </div>
    </div>
    <!--        / Тарифы -->

    <!-- Transaction Filters -->
    <div class="filters-box mt-10 mb-6">
      <h1 class="text-h4 mb-4  font-weight-bold">
        Транзакции:
      </h1>
    </div>

    <!-- Transactions Table -->
    <div class="transactions-box py-4">
      <h3 class="text-h6 mb-4">
        Детализация
      </h3>
      <VTable class="mt-5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Сумма</th>
            <th>Тип</th>
            <th>Тип операции</th>
            <th>Статус</th>
            <th>Дата и время</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="transaction in transactions"
            :key="transaction.id"
          >
            <td>{{ transaction.id }}</td>
            <td>
              {{ Math.floor(+transaction.amount) }}
              <span v-if="transaction.currency_type === 'cash'">₽</span>
            </td>
            <td>{{ formatCurrencyType(transaction.currency_type) }}</td>
            <td
              :class="{
                'text-success': transaction.transaction_type === 'deposit',
                'text-error': transaction.transaction_type === 'withdraw'
              }"
            >
              {{ formatOperationType(transaction.transaction_type) }}
            </td>
            <td>{{ translateStatus(transaction.status) }}</td>
            <td>{{ formatDate(transaction.created_at) }}</td>
            <td>{{ transaction.description }}</td>
          </tr>
        </tbody>
      </VTable>
    </div>

    <!-- Top-Up Modal -->
    <VDialog
      v-model="showTopUpModal"
      max-width="400px"
    >
      <VSheet class="pa-6">
        <h2 class="text-h5 mb-4">
          Пополнить баланс
        </h2>
        <VTextField
          v-model="topUpAmount"
          label="Сумма (₽)"
          type="number"
          min="1"
          outlined
        />
        <div class="d-flex justify-end mt-4">
          <VBtn
            color="secondary"
            class="mr-2"
            @click="showTopUpModal = false"
          >
            Отмена
          </VBtn>
          <VBtn
            color="primary"
            @click="topUpBalance"
          >
            Пополнить
          </VBtn>
        </div>
      </VSheet>
    </VDialog>

    <!--      Вывод средств -->
    <VDialog
      v-model="showWithdrawModal"
      max-width="400px"
    >
      <VSheet class="pa-6">
        <h2 class="text-h5 mb-4">
          Вывести деньги
        </h2>
        <VTextField
          v-model="withdrawAmount"
          label="Сумма (₽)"
          type="number"
          min="1000"
          outlined
        />
        <VTextField
          v-model="cardNumber"
          v-mask="'#### #### #### ####'"
          label="Номер карты"
          class="mt-2"
          type="text"
          outlined
        />
        <div class="d-flex justify-end mt-4">
          <VBtn
            color="secondary"
            class="mr-2"
            @click="showWithdrawModal = false"
          >
            Отмена
          </VBtn>
          <VBtn
            color="primary"
            @click="withdraw"
          >
            Вывести
          </VBtn>
        </div>
      </VSheet>
    </VDialog>

    <!-- Promo Code Modal -->
    <VDialog
      v-model="showPromoModal"
      max-width="400px"
    >
      <VSheet class="pa-6">
        <h2 class="text-h5 mb-4">
          Ввести промокод
        </h2>
        <VTextField
          v-model="promoCode"
          label="Промокод"
          outlined
        />
        <div class="d-flex justify-end mt-4">
          <VBtn
            color="secondary"
            class="mr-2"
            @click="showPromoModal = false"
          >
            Отмена
          </VBtn>
          <VBtn
            color="primary"
            @click="applyPromoCode"
          >
            Применить
          </VBtn>
        </div>
      </VSheet>
    </VDialog>

    <!-- Product Selection Modal -->
    <VDialog
      v-model="showProductModal"
      max-width="600px"
    >
      <VSheet class="pa-6">
        <h2 class="text-h5 mb-4">
          Выберите товар
        </h2>
        <VTextField
          v-model="productSearch"
          label="Поиск по названию"
          outlined
          class="mb-4"
          @input="productPage = 1; fetchProducts()"
        />
        <VList>
          <VListItem
            v-for="product in products"
            :key="product.id"
            class="product-item"
            @click="selectProduct(product.id)"
          >
            <VListItemTitle>{{ product.name }}</VListItemTitle>
            <VListItemSubtitle>ID: {{ product.id }}</VListItemSubtitle>
          </VListItem>
        </VList>
        <VPagination
          v-model="productPage"
          :length="productLastPage"
          class="mt-4"
          @update:model-value="fetchProducts"
        />
        <div class="d-flex justify-end mt-4">
          <VBtn
            color="secondary"
            @click="showProductModal = false"
          >
            Закрыть
          </VBtn>
        </div>
      </VSheet>
    </VDialog>
  </VContainer>
</template>

<style scoped lang="scss">
.balance-box{
  display: flex;
  gap: 30px;
  padding: 11px 17px;
  border: 1px solid #D0D5DD;
  border-radius: 15px;
  align-items: center;
  justify-content: space-between;
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

.tariff-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  padding: 18px 13px;
}

.card-content {
  display: flex;
  flex-direction: column;
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


.d-none{
  display: none!important;
}

@media screen and (max-width: 960px){
  .tariff-wrap{
    flex-wrap: wrap;
  }
}

@media screen and (max-width: 804px){
  .card-wrap {
    justify-content: center;
  }
}
</style>
