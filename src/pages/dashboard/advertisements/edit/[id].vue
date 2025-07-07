<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/api/index'

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
const adId = computed(() => route.params.id || null)

// Redirect if no adId
onMounted(() => {
  if (!adId.value) {
    snackbar.notify({
      text: 'Неверный идентификатор объявления',
      color: 'error'
    })
    router.push('/dashboard/advertisements')
  }
})

const product = ref(null)

// Fetch ad, balance, and templates
onMounted(async () => {
  if (!adId.value) return
  try {
    const [adResponse, balanceResponse, templatesResponse] = await Promise.all([
      api.ads.getAdById(adId.value), // Assuming this method exists
      api.balance.getBalance(),
      api.template.getAllTemplates()
    ])
    ad.value = adResponse
    balance.value = balanceResponse
    templates.value = templatesResponse || {}
    // Pre-populate form with ad data
    adData.value = {
      name: adResponse.name || '',
      cashback_percentage: parseFloat(adResponse.cashback_percentage) || 0,
      redemption_count: adResponse.redemption_count || 1,
      order_conditions: adResponse.order_conditions || '',
      redemption_instructions: adResponse.redemption_instructions || '',
      review_criteria: adResponse.review_criteria || '',
      size: adResponse.size || '',
      color: adResponse.color || ''
    }

    product.value = adResponse.product || {}
  } catch (error) {
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
  if (adData.value.redemption_count < availableRedemptions.value) {
    adData.value.redemption_count++
  }
}

const decrementRedemptions = () => {
  if (adData.value.redemption_count > 1) {
    adData.value.redemption_count--
  }
}

const setMaxRedemptions = () => {
  adData.value.redemption_count = availableRedemptions.value
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
  try {
    await api.ads.updateAd(adId.value, adData.value)
    snackbar.notify({
      text: 'Объявление обновлено',
      color: 'success'
    })
    router.push('/dashboard/advertisements')
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка при обновлении объявления',
      color: 'error'
    })
  }
}
</script>

<template>
  <div class="edit-ad-container">
    <div class="content-wrapper m0-auto">
      <h1 class="text-h4 mb-2">Редактирование объявления</h1>
      <p class="text-body-1 mb-6">Отредактируйте объявление для продвижения вашего товара с кэшбеком за отзыв</p>

      <div v-if="loading" class="text-center">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div v-else-if="ad?.product">
        <!-- Product Info -->
        <div class="product-info mb-6">
          <v-row>
            <v-col cols="4" md="2">
              <v-img
                v-if="getFirstImage(ad.product.images)"
                :src="getFirstImage(ad.product.images)"
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
            <v-col cols="12" md="9">
              <h3 class="mb-3">{{ ad.product.name }}</h3>
              <p class="text-subtitle-1 mb-0 pb-0">Цена: <span class="text-black"><span class="total-cost">{{ ad.product.price }} ₽</span></span> </p>
              <p class="text-subtitle-1 mb-0 pb-0">Бренд: <span class="text-black">{{ ad.product.brand }} </span></p>
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
              label="Название объявления"
              hint="Это название видно только вам"
              persistent-hint
              class="ads-name"
              required
            />

            <div class="cashback-section">
              <v-slider
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
            <v-row class="mb-4">
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
            <!-- Cost Breakdown -->
            <v-btn
              color="primary"
              type="submit"
              block
              :disabled="loading"
            >
              Сохранить изменения
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

.cashback-section{
  margin-bottom: 55px;
}
</style>
