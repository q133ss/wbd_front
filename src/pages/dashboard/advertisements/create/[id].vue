<script setup>
import api from '@/api/Index'
import { useSnackbarStore } from '@/stores/snackbar'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePage({
  meta: {
    authRequired: true,
  },
})

const snackbar = useSnackbarStore()
const route = useRoute() // Correctly use useRoute
const router = useRouter()

const product = ref(null)
const adData = ref({
  name: '',
  cashback_percentage: 10,
  redemption_count: 1,
  order_conditions: '',
  redemption_instructions: '',
  review_criteria: '',
  size: '',
  color: ''
})
const balance = ref(null)
const loading = ref(true)
const templates = ref({})

// Modal state
const showEditModal = ref(false)
const editingTemplateType = ref('')
const editingTemplateContent = ref('')

// Safely access route parameter
const productId = computed(() => route.params.id || null)

// Redirect if no productId
onMounted(() => {
  if (!productId.value) {
    snackbar.notify({
      text: 'Неверный идентификатор продукта',
      color: 'error'
    })
    router.push('/dashboard/advertisements')
  }
})
const user = useCookie('userData').value
// Fetch product, balance, and templates
onMounted(async () => {
  if (!productId.value) return
  try {
    const [productResponse, balanceResponse, templatesResponse] = await Promise.all([
      api.products.getProductById(productId.value),
      api.balance.getBalaceOnly(),
      api.template.getAllTemplates()
    ])
    product.value = productResponse
    balance.value = balanceResponse
    templates.value = templatesResponse || {}
  } catch (error) {
    console.log(error)
    snackbar.notify({
      text: 'Ошибка загрузки данных',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
})

// Function to get first image safely
const getFirstImage = (images) => {
  if (!images) return ''
  if (Array.isArray(images)) return images[0] || ''
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed[0] || '' : ''
  } catch {
    return ''
  }
}

// Computed properties for calculations
const userPrice = computed(() => {
  if (!product) return 0
  const price = parseFloat(product.value.price)
  return Math.floor(price * (1 - adData.value.cashback_percentage / 100))
})

const totalCost = computed(() => {
  // Получаем необходимое количество байбеков из формы
  const neededRedemptions = adData.value.redemption_count

  // Получаем доступное количество байбеков у пользователя
  const availableRedemptions = balance.value?.redemption_count || 0

  // Вычисляем сколько нужно докупить (не может быть отрицательным)
  const additionalRedemptions = Math.max(0, neededRedemptions - availableRedemptions)

  // Стоимость одного байбека фиксирована - 95 руб
  const redemptionPrice = 95

  // Общая стоимость = количество докупаемых байбеков * цена одного
  return additionalRedemptions * redemptionPrice
})

const additionalRedemptions = computed(() => {
  const needed = adData.value.redemption_count
  const available = balance.value?.redemption_count || 0
  return Math.max(0, needed - available)
})

const availableRedemptions = computed(() => {
  return product.value?.quantity_available || 0
})

const cashbackPerRedemption = computed(() => {
  const price = parseFloat(product.value.price)
  return Math.floor(price * adData.value.cashback_percentage / 100)
})

// Handlers
const incrementRedemptions = () => {
  if (adData.value.redemption_count < balance.value.redemption_count) {
    adData.value.redemption_count++
  }
}

const decrementRedemptions = () => {
  if (adData.value.redemption_count > 1) {
    adData.value.redemption_count--
  }
}

const insertTemplate = async (field) => {
  try {
    const template = await api.template.getTemplateByType(field)
    if (template?.text) {
      adData.value[field] = template.text
    } else {
      snackbar.notify({
        text: 'Шаблон не найден',
        color: 'warning'
      })
    }
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки шаблона',
      color: 'error'
    })
  }
}

const openEditTemplateModal = (field) => {
  editingTemplateType.value = field
  editingTemplateContent.value = adData.value[field] || ''
  showEditModal.value = true
}

const saveTemplate = async () => {
  try {
    await api.template.updateTemplate(editingTemplateType.value, {
      text: editingTemplateContent.value
    })
    adData.value[editingTemplateType.value] = editingTemplateContent.value
    snackbar.notify({
      text: 'Шаблон сохранен',
      color: 'success'
    })
    showEditModal.value = false
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка сохранения шаблона',
      color: 'error'
    })
  }
}

const submitAd = async () => {
  const payload = {
    ...adData.value,
    product_id: productId.value,
  }

  if (isKeywords.value && keywords.value.length) {
    // Собираем массив для ключевых слов
    payload.keywords = keywords.value
      .filter(k => k.text.trim())
      .map(k => ({
        word: k.text.trim(),
        redemption_count: k.count || 1
      }))
  }

  try {
    await api.ads.createAd(payload)
    snackbar.notify({
      text: 'Объявление создано',
      color: 'success'
    })
    router.push('/dashboard/advertisements')
  } catch (error) {
    console.error(error)
    if (error.response?.status === 400) {
      snackbar.notify({
        text: 'У вас недостаточно средств',
        color: 'error'
      })
      return
    }
    snackbar.notify({
      text: error.response._data.message || 'Ошибка при создании объявления',
      color: 'error'
    })
  }
}

const isKeywords = ref(false)

const toggleKeywords = () => {
  isKeywords.value = !isKeywords.value
}

const keywords = ref([
  { id: 1, text: '', count: 0 },
  { id: 2, text: '', count: 0 },
  { id: 3, text: '', count: 0 },
])

let nextId = 4

function addKeyword() {
  keywords.value.push({ id: nextId++, text: '', count: 0 })
}

function remove(idx) {
  keywords.value.splice(idx, 1)
}

function increment(idx) {
  keywords.value[idx].count++
}

function decrement(idx) {
  const cw = keywords.value[idx]
  if (cw.count > 0) cw.count--
}
</script>

<template>
  <div class="create-ad-container">
    <div class="content-wrapper m0-auto">
      <h1 class="text-h4 mb-2">Создание объявления</h1>
      <p class="text-body-1 mb-6">Создайте объявление для продвижения вашего товара с кэшбеком за отзыв</p>

      <div v-if="loading" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div v-else-if="product">
        <!-- Product Info -->
        <div class="product-info mb-6">
          <v-row>
            <v-col cols="4" md="2">
              <v-img
                v-if="getFirstImage(product?.images)"
                :src="getFirstImage(product?.images)"
                width="112"
                height="150"
                contain
                class="product-img"
              />
              <v-sheet v-else class="text-center pa-4">
                <v-icon size="large">mdi-image-off</v-icon>
                <p class="text-caption">Изображение отсутствует</p>
              </v-sheet>
            </v-col>
            <v-col cols="8" md="10">
              <h3 class="mb-3">{{ product?.name }}</h3>
              <p class="text-subtitle-1 mb-0 pb-0">Цена: <span class="text-black"><span class="total-cost">{{ product?.price }} ₽</span></span></p>
              <p class="text-subtitle-1 mb-0 pb-0">Бренд: <span class="text-black">{{ product?.brand }}</span></p>
              <p class="text-subtitle-1">
                Артикул: <span class="text-black">{{ product?.wb_id }}</span>
              </p>
            </v-col>
          </v-row>
        </div>

        <!-- Ad Form -->
        <div class="ad-form">
          <v-form @submit.prevent="submitAd">
            <v-text-field
              v-model="adData.name"
              label="Название объявления (видете только вы)"
              persistent-hint
              class="ads-name"
              required
            />

            <div class="mb-6">
              <v-slider
                v-model="adData.cashback_percentage"
                label="Процент кэшбека"
                min="10"
                max="100"
                step="5"
                thumb-label="always"
                class="mb-2 ml-0"
              />
              <p class="text-body-1 user-price-wrap">
                Цена для покупателя: <span class="total-cost user-price">{{ userPrice }} ₽</span>
                <br>
                Размер кэшбека: <span class="total-cost user-price">{{ cashbackPerRedemption }} ₽</span>
              </p>
            </div>

            <!-- Выбор цвета -->
            <v-select
              v-model="adData.color"
              :items="product.colors"
              item-title="name"
              item-value="name"
              label="Цвет"
              persistent-hint
              clearable
              class="mt-5"
            />

            <!-- Размер -->
            <v-select
              v-model="adData.size"
              :items="product.sizes"
              item-title="name"
              item-value="id"
              label="Размер"
              persistent-hint
              clearable
              class="mt-5 mb-5"
            />

            <!-- Textareas with Templates -->
            <v-row v-for="field in [
              { key: 'order_conditions', label: 'Условия заказа', desc: 'Если у вас есть особые условия, то обозначьте тут. Их увидят пользователи до того как оформят заказ' },
              { key: 'redemption_instructions', label: 'Инструкции для выкупа', desc: 'Предоставьте инструкцию как найти и выкупить ваш товар. Эта инструкция будет отправлена автоматически покупателю в момент создания сделки' },
              { key: 'review_criteria', label: 'Критерии отзыва', desc: 'Предоставьте критерии отзыва, которые покупатель должен соблюсти, когда будет составлять отзыв' }
            ]" :key="field.key" class="mb-4">
              <v-col cols="12" md="8">
                <v-textarea
                  v-model="adData[field.key]"
                  :label="field.label"
                  rows="4"
                  :placeholder="field.label"
                  required
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  color="primary"
                  class="mb-2"
                  block
                  @click="insertTemplate(field.key)"
                >
                  Вставить шаблон
                </v-btn>
                <v-btn
                  color="primary"
                  variant="outlined"
                  class="mb-2"
                  block
                  @click="openEditTemplateModal(field.key)"
                >
                  Редактировать шаблон
                </v-btn>
                <p class="text-caption">{{ field.desc }}</p>
              </v-col>
            </v-row>

            <!-- Redemption Count -->
            <label class="d-flex align-center mb-10" style="cursor: pointer;">
              <v-switch
                v-model="isKeywords"
                color="primary"
                hide-details
                class="mr-2"
              />
              Ключевые слова для поиска товара и продвижения
            </label>


            <div v-if="isKeywords">
              <transition name="fade">
                <div v-if="isKeywords">
                  <v-row
                    v-for="(item, idx) in keywords"
                    :key="item.id"
                    class="align-center"
                  >
                    <v-col cols="1">{{ idx + 1 }}.</v-col>
                    <v-col cols="6" class="p-0">
                      <v-text-field v-model="item.text" placeholder="Введите ключевое слово" dense />
                    </v-col>
                    <v-col cols="2" class="d-flex align-center">
                      <v-btn icon @click="decrement(idx)">
                        <v-icon>ri-subtract-line</v-icon>
                      </v-btn>
                      <span class="mx-2">{{ item.count }}</span>
                      <v-btn icon @click="increment(idx)">
                        <v-icon>ri-add-line</v-icon>
                      </v-btn>
                    </v-col>
                    <v-col cols="2">
                      <v-btn icon color="error" @click="remove(idx)">
                        <v-icon>ri-delete-bin-line</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-btn
                    outlined
                    color="primary"
                    class="mt-2"
                    @click="addKeyword"
                  >
                    <v-icon left>mdi-plus</v-icon>
                    Добавить еще
                  </v-btn>
                </div>
              </transition>

              <div v-if="isKeywords" class="mt-4 text-subtitle-1 grey--text">
                Если вы активируете эту функцию, то поиск и выкуп товаров покупателями будет происходить по этим ключевым словам. Активируйте в случае нужды продвижения карточки по ключевым запросам.
              </div>
            </div>
            <v-row class="mb-4" v-else>
              <v-col cols="12" md="6">
                <div class="d-flex align-center">
                  <button
                    type="button"
                    class="increment-btn mr-2"
                    @click="decrementRedemptions"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                      <path d="M5 12h14"></path>
                    </svg>
                  </button>
                  <v-text-field
                    v-model.number="adData.redemption_count"
                    label="Количество выкупов"
                    type="number"
                    min="1"
                    :max="availableRedemptions"
                    class="mx-2"
                    style="max-width: 150px"
                  />
                  <button
                    type="button"
                    class="increment-btn ml-2"
                    @click="incrementRedemptions"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
                      <path d="M5 12h14"></path>
                      <path d="M12 5v14"></path>
                    </svg>
                  </button>
                </div>
                <p class="text-body-1 mt-2">
                  Доступно выкупов: {{ balance.redemption_count }}
                </p>
              </v-col>
            </v-row>

            <hr class="total-hr">

            <v-btn
              color="primary"
              type="submit"
              block
              :disabled="loading"
            >
              Создать объявление
            </v-btn>
          </v-form>
        </div>
      </div>
    </div>

    <!-- Edit Template Modal -->
    <v-dialog v-model="showEditModal" max-width="600px">
      <v-sheet class="pa-6">
        <h2 class="text-h5 mb-4">Редактировать шаблон</h2>
        <v-textarea
          v-model="editingTemplateContent"
          label="Содержимое шаблона"
          rows="6"
          outlined
        />
        <div class="d-flex justify-end mt-4">
          <v-btn
            color="secondary"
            class="mr-2"
            @click="showEditModal = false"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="saveTemplate"
          >
            Сохранить
          </v-btn>
        </div>
      </v-sheet>
    </v-dialog>
  </div>
</template>

<style scoped lang="scss">

.content-wrapper {
  max-width: 800px;
  margin-left: 0;
}

.m0-auto{
  margin-left: 10%;
}

.product-info,
.ad-form,
.cost-breakdown {
  border-radius: 8px;
  margin-bottom: 24px;
}

:deep(.v-field) {
  border-radius: 4px;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

.increment-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgb(var(--v-theme-primary));
  border-radius: 4px;
  color: white;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1565c0;
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

.total-cost{
  color: rgb(var(--v-theme-primary));
}

.text-black{
  color: rgb(var(--v-theme-on-surface));
}

.total-hr{
  color: rgb(201, 202, 209);
  margin-bottom: 32px;
  opacity: 0.2;
}

.product-img{
  border-radius: 15px;
}

.ads-name{
  margin-top: 50px;
  margin-bottom: 50px;
}

.user-price-wrap{
  margin-bottom: 50px;
}

.user-price{
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.keywords-block {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.p-0{
  padding: 0 !important;
}
</style>
