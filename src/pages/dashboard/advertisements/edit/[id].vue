<script setup>
import api from '@/api/index'
import { useSnackbarStore } from '@/stores/snackbar'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePage({
  meta: {
    authRequired: true,
  },
})

const snackbar = useSnackbarStore()
const route = useRoute()
const router = useRouter()

const ad = ref(null)

const adData = ref({
  name: '',
  cashback_percentage: 0,
  redemption_count: 1,
  order_conditions: '',
  redemption_instructions: '',
  review_criteria: '',
  size: [],
  color: [],
})

const balance = ref(null)
const loading = ref(true)
const templates = ref({})

// Modal state
const showEditModal = ref(false)
const editingTemplateType = ref('')
const editingTemplateContent = ref('')

// Safely access route parameter
const adId = computed(() => route.params.id || null)

// Redirect if no adId
onMounted(() => {
  if (!adId.value) {
    snackbar.notify({
      text: 'Неверный идентификатор объявления',
      color: 'error',
    })
    router.push('/dashboard/advertisements')
  }
})

const product = ref(null)

const isKeywords = ref(false)

const toggleKeywords = () => {
  isKeywords.value = !isKeywords.value
}

const keywords = ref([])

let nextId = 0

// Fetch ad, balance, and templates
onMounted(async () => {
  if (!adId.value) return
  try {
    const [adResponse, balanceResponse, templatesResponse] = await Promise.all([
      api.ads.getAdById(adId.value), // Assuming this method exists
      api.balance.getBalance(),
      api.template.getAllTemplates(),
    ])

    ad.value = adResponse

    keywords.value = (adResponse.keywords || []).map((item, index) => ({
      id: index + 1,
      text: item.word,
      count: item.redemption_count,
    }))
    nextId = keywords.value.length + 1

    if(keywords.value.length != 0){
      isKeywords.value = true
    }


    balance.value = balanceResponse
    templates.value = templatesResponse || {}

    // Pre-populate form with ad data
    adData.value = {
      name: adResponse.name || '',
      cashback_percentage: parseFloat(adResponse.cashback_percentage) || 0,
      redemption_count: adResponse.redemption_count || 1,
      order_conditions: adResponse.order_conditions.replace(/<br\s*\/?>/gi, '\n') || '',
      redemption_instructions: adResponse.redemption_instructions.replace(/<br\s*\/?>/gi, '\n') || '',
      review_criteria: adResponse.review_criteria.replace(/<br\s*\/?>/gi, '\n') || '',
      size: adResponse.size || '',
      color: adResponse.color || '',
    }

    product.value = adResponse.product || {}
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки данных',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
})

// Function to get first image safely
const getFirstImage = images => {
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
  if (!ad.value?.product) return 0
  const price = parseFloat(ad.value.product.price)
  
  return Math.floor(price * (1 - adData.value.cashback_percentage / 100))
})

const totalCost = computed(() => {
  if (!ad.value?.product) return 0
  const price = parseFloat(ad.value.product.price)
  const cashbackAmount = price * (adData.value.cashback_percentage / 100)
  const neededRedemptions = adData.value.redemption_count
  const availableRedemptions = balance.value?.redemption_count || 0
  const additionalRedemptions = Math.max(0, neededRedemptions - availableRedemptions)

  return Math.floor(cashbackAmount * neededRedemptions + additionalRedemptions * 95)
})

const additionalRedemptions = computed(() => {
  const needed = adData.value.redemption_count
  const available = balance.value?.redemption_count || 0
  
  return Math.max(0, needed - available)
})

const availableRedemptions = computed(() => {
  return ad.value?.product?.quantity_available || 0
})

const cashbackPerRedemption = computed(() => {
  if (!ad.value?.product) return 0
  const price = parseFloat(ad.value.product.price)
  
  return Math.floor(price * adData.value.cashback_percentage / 100)
})

// Handlers
const incrementRedemptions = () => {
  adData.value.redemption_count++
}

const decrementRedemptions = () => {
  if (adData.value.redemption_count > 1) {
    adData.value.redemption_count--
  }
}

const setMaxRedemptions = () => {
  adData.value.redemption_count = availableRedemptions.value
}

const insertTemplate = async field => {
  try {
    const template = await api.template.getTemplateByType(field)
    if (template?.text) {
      adData.value[field] = template.text.replace(/<br\s*\/?>/gi, '\n')
    } else {
      snackbar.notify({
        text: 'Шаблон не найден',
        color: 'warning',
      })
    }
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки шаблона',
      color: 'error',
    })
  }
}

const openEditTemplateModal = field => {
  editingTemplateType.value = field
  editingTemplateContent.value = adData.value[field] || ''
  showEditModal.value = true
}

const saveTemplate = async () => {
  try {
    await api.template.updateTemplate(editingTemplateType.value, {
      text: editingTemplateContent.value,
    })
    adData.value[editingTemplateType.value] = editingTemplateContent.value
    snackbar.notify({
      text: 'Шаблон сохранен',
      color: 'success',
    })
    showEditModal.value = false
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка сохранения шаблона',
      color: 'error',
    })
  }
}

const submitAd = async () => {
  const payload = {
    ...adData.value,
  }

  // 🔽 Замена переносов строк на <br> для полей с текстом
  const FIELDS_WITH_TEXTAREA = ['order_conditions', 'redemption_instructions', 'review_criteria']

  FIELDS_WITH_TEXTAREA.forEach(field => {
    if (payload[field]) {
      payload[field] = payload[field].replace(/\n/g, '<br>')
    }
  })
  try {
    if (isKeywords.value && keywords.value.length) {
      // Собираем массив для ключевых слов
      payload.keywords = keywords.value
        .filter(k => k.text.trim())
        .map(k => ({
          word: k.text.trim(),
          redemption_count: k.count || 1,
        }))
    }

    await api.ads.updateAd(adId.value, payload)
    snackbar.notify({
      text: 'Объявление обновлено',
      color: 'success',
    })
    router.push('/dashboard/advertisements')
  } catch (error) {
    console.error(error)
    snackbar.notify({
      text: 'Ошибка при обновлении объявления',
      color: 'error',
    })
  }
}

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

const textAreas = computed(() => {
  const fields = [
    {
      key: 'order_conditions',
      label: 'Условия заказа',
      desc: 'Если у вас есть особые условия, то обозначьте тут. Их увидят пользователи до того как оформят заказ',
    },
    {
      key: 'redemption_instructions',
      label: 'Инструкции для выкупа',
      desc: 'Предоставьте инструкцию как найти и выкупить ваш товар. Эта инструкция будет отправлена автоматически покупателю в момент создания сделки',
    },
    {
      key: 'review_criteria',
      label: 'Критерии отзыва',
      desc: 'Предоставьте критерии отзыва, которые покупатель должен соблюсти, когда будет составлять отзыв',
    },
  ]

  if (isKeywords.value) {
    return fields.filter(f => f.key !== 'redemption_instructions')
  }
  
  return fields
})
</script>

<template>
  <VContainer>
    <div class="mx-auto">
      <h1 class="text-h4 mb-2">
        Редактирование объявления
      </h1>
      <p class="text-body-1 mb-6">
        Отредактируйте объявление для продвижения вашего товара с кэшбеком за отзыв
      </p>

      <div
        v-if="loading"
        class="text-center"
      >
        <VProgressCircular
          indeterminate
          color="primary"
        />
      </div>

      <div v-else-if="ad?.product">
        <!-- Product Info -->
        <div class="product-info mb-6">
          <VRow>
            <VCol
              cols="4"
              md="2"
            >
              <VImg
                v-if="getFirstImage(ad.product.images)"
                :src="getFirstImage(ad.product.images)"
                width="112"
                height="150"
                contain
                class="product-img"
              />
              <VSheet
                v-else
                class="text-center pa-4"
              >
                <VIcon size="large">
                  mdi-image-off
                </VIcon>
                <p class="text-caption">
                  Изображение отсутствует
                </p>
              </VSheet>
            </VCol>
            <VCol
              cols="12"
              md="9"
            >
              <h3 class="mb-3">
                {{ ad.product.name }}
              </h3>
              <p class="text-subtitle-1 mb-0 pb-0">
                Цена: <span class="text-black"><span class="total-cost">{{ ad.product.price }} ₽</span></span>
              </p>
              <p class="text-subtitle-1 mb-0 pb-0">
                Бренд: <span class="text-black">{{ ad.product.brand }} </span>
              </p>
              <p class="text-subtitle-1">
                Артикул: <span class="text-black">{{ product?.wb_id }}</span>
              </p>
            </VCol>
          </VRow>
        </div>

        <!-- Ad Form -->
        <div class="ad-form">
          <VForm @submit.prevent="submitAd">
            <VTextField
              v-model="adData.name"
              label="Название объявления"
              hint="Это название видно только вам"
              persistent-hint
              class="ads-name"
              required
            />

            <div class="cashback-section">
              <VSlider
                v-model="adData.cashback_percentage"
                label="Процент кэшбека"
                min="10"
                step="5"
                max="100"
                thumb-label="always"
                class="mb-2 ml-0"
              />
              <p class="text-body-1">
                Цена для покупателя: <span class="total-cost user-price">{{ userPrice }} ₽</span>
                <br>
                Размер кэшбека: <span class="total-cost user-price">{{ cashbackPerRedemption }} ₽</span>
              </p>
            </div>

            <!-- Выбор цвета -->
            <VSelect
              v-model="adData.color"
              :items="product.colors"
              item-title="name"
              item-value="name"
              label="Цвет"
              persistent-hint
              multiple
              clearable
              class="mt-5"
            />

            <!-- Размер -->
            <VSelect
              v-model="adData.size"
              :items="product.sizes"
              item-title="name"
              item-value="id"
              label="Размер"
              persistent-hint
              clearable
              multiple
              class="mt-5 mb-5"
            />

            <!-- Textareas with Templates -->
            <VRow
              v-for="field in textAreas"
              :key="field.key"
              class="mb-4"
            >
              <VCol
                cols="12"
                md="8"
              >
                <VTextarea
                  v-model="adData[field.key]"
                  :label="field.label"
                  rows="4"
                  :placeholder="field.label"
                  required
                />
              </VCol>
              <VCol
                cols="12"
                md="4"
              >
                <VBtn
                  color="primary"
                  class="mb-2"
                  block
                  @click="insertTemplate(field.key)"
                >
                  Вставить шаблон
                </VBtn>
                <VBtn
                  color="primary"
                  variant="outlined"
                  class="mb-2"
                  block
                  @click="openEditTemplateModal(field.key)"
                >
                  Редактировать шаблон
                </VBtn>
                <p class="text-caption">
                  {{ field.desc }}
                </p>
              </VCol>
            </VRow>

            <!-- Redemption Count -->
            <label
              class="d-flex align-center mb-4"
              style="cursor: pointer;"
            >
              <VSwitch
                v-model="isKeywords"
                color="primary"
                hide-details
                class="mr-2"
              />
              Ключевые слова для поиска товара и продвижения
            </label>

            <div v-if="isKeywords">
              <Transition name="fade">
                <div v-if="isKeywords">
                  <VRow
                    v-for="(item, idx) in keywords"
                    :key="item.id"
                    class="align-center my-4"
                  >
                    <VCol cols="1">
                      {{ idx + 1 }}.
                    </VCol>
                    <VCol
                      cols="6"
                      class="p-0"
                    >
                      <VTextField
                        v-model="item.text"
                        placeholder="Введите ключевое слово"
                        dense
                      />
                    </VCol>
                    <VCol
                      cols="2"
                      class="d-flex align-center"
                    >
                      <VBtn
                        icon
                        @click="decrement(idx)"
                      >
                        <VIcon>ri-subtract-line</VIcon>
                      </VBtn>
                      <span class="mx-2">{{ item.count }}</span>
                      <VBtn
                        icon
                        @click="increment(idx)"
                      >
                        <VIcon>ri-add-line</VIcon>
                      </VBtn>
                    </VCol>
                    <VCol cols="2">
                      <VBtn
                        icon
                        color="error"
                        @click="remove(idx)"
                      >
                        <VIcon>ri-delete-bin-line</VIcon>
                      </VBtn>
                    </VCol>
                  </VRow>

                  <VBtn
                    outlined
                    color="primary"
                    class="mt-5"
                    @click="addKeyword"
                  >
                    <VIcon left>
                      mdi-plus
                    </VIcon>  
                    {{ keywords.length ? 'Добавить еще' : 'Добавить' }}
                  </VBtn>
                </div>
              </Transition>

              <div
                v-if="isKeywords"
                class="my-4 text-subtitle-1 grey--text"
              >
                При активации функции ключевых слов вы не можете управлять инструкцией к выкупу.
              </div>
            </div>
            <VRow
              v-else
              class="mb-4"
            >
              <VCol
                cols="12"
                md="6"
              >
                <div class="d-flex align-center">
                  <button
                    type="button"
                    class="increment-btn mr-2"
                    @click="decrementRedemptions"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-6 h-6"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <VTextField
                    v-model.number="adData.redemption_count"
                    label="Количество выкупов"
                    type="number"
                    min="1"
                    class="mx-2"
                    style="max-width: 150px"
                  />
                  <button
                    type="button"
                    class="increment-btn ml-2"
                    @click="incrementRedemptions"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-6 h-6"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  </button>
                </div>
              </VCol>
            </VRow>

            <!-- Cost Breakdown -->
            <VBtn
              color="primary"
              type="submit"
              block
              :disabled="loading"
            >
              Сохранить изменения
            </VBtn>
          </VForm>
        </div>
      </div>
    </div>

    <!-- Edit Template Modal -->
    <VDialog
      v-model="showEditModal"
      max-width="600px"
    >
      <VSheet class="pa-6">
        <h2 class="text-h5 mb-4">
          Редактировать шаблон
        </h2>
        <VTextarea
          v-model="editingTemplateContent"
          label="Содержимое шаблона"
          rows="6"
          outlined
        />
        <div class="d-flex justify-end mt-4">
          <VBtn
            color="secondary"
            class="mr-2"
            @click="showEditModal = false"
          >
            Отмена
          </VBtn>
          <VBtn
            color="primary"
            @click="saveTemplate"
          >
            Сохранить
          </VBtn>
        </div>
      </VSheet>
    </VDialog>
  </VContainer>
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

.cashback-section{
  margin-bottom: 55px;
}
</style>
