<script setup>
import api from '@/api/index.js'
import { onMounted, ref } from 'vue'

const categories = ref([])
const partners = ref([])
const selectedCategoryId = ref('')
const searchQuery = ref('')

// Загрузка категорий и первой категории
onMounted(async () => {
  try {
    categories.value = await api.partners.categories()
    console.log('Категории загружены:', categories.value)    
    await loadPartnersByCategoryId(selectedCategoryId.value)
  } catch (e) {
    console.error('Ошибка при загрузке', e)
  }
})

// Загрузка партнёров по id категории
const loadPartnersByCategoryId = async categoryId => {
  selectedCategoryId.value = categoryId

  const response = await api.partners.list(categoryId)

  partners.value = response.data
}

// Локальная фильтрация по поиску
const filteredPartners = computed(() => {
  
  return partners.value.filter(partner =>
    partner.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})
</script>

<template>
  <div class="partners-page">
    <h1 class="text-2xl font-bold mb-7">
      Партнеры
    </h1>
    <h3 class="text-h6 font-weight-bold mb-3">
      Фильтры
    </h3>
    <!-- Категории -->
    <div class="d-flex flex-wrap gap-3 mb-6">
      <VBadge
        v-if="partners.length"
        color="currentColor"
        content=""
        offset-x="-2"
        offset-y="-2"
        class="badge-small"
      >
        <VBtn
          size="small"
          variant="flat"
          class="px-3 py-1 text-sm font-weight-medium rounded-xl"
          :color="selectedCategoryId === '' ? 'primary' : 'secondary'"
          @click="loadPartnersByCategoryId('')"
        >
          Все
        </VBtn>
      </VBadge>

      <VBadge        
        v-for="category in categories"        
        v-if="partner?.category?.id === category?.id"
        :key="category.id"
        content="" 
        color="currentColor"
        offset-x="-2"
        offset-y="-2"
        class="badge-small"
      >
        <VBtn
          size="small"
          variant="flat"
          class="px-3 py-1 text-sm font-weight-medium rounded-xl"
          :color="selectedCategoryId === category.id ? 'primary' : 'secondary'"
          @click="loadPartnersByCategoryId(category.id)"
        >
          {{ category.name }}
        </VBtn>
      </VBadge>
    </div>


    <!-- Поиск -->
    <VTextField
      v-model="searchQuery"
      placeholder="Поиск по партнёрам"
      variant="outlined"
      density="compact"
      prepend-inner-icon="ri-search-line"
      max-width="404"
      :rounded="100"
      class="mb-6 rounded-xl"
    />

    <!-- Сетка карточек: 3 колонки -->
    <div class="d-flex flex-wrap justify-start gap-5">
      <VCard
        v-for="partner in filteredPartners"
        :key="partner.id"
        variant="text"
        width="295"
        class="rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition h-full flex flex-col"
      >
        <VImg
          :src="partner.img?.src"
          alt="Логотип партнёра"
          max-height="191"
          max-width="295"
          position="center center"
          class="w-full h-20 object-contain bg-gray-100"
        />
        <VCardText class="px-6 py-3 pb-6">
          <div class="d-flex flex-column flex-grow justify-between">
            <div>
              <h3 class="text-lg font-weight-semibold mb-1">
                {{ partner.name }}
              </h3>
              <p class="text-caption text-secondary mb-4">
                {{ partner.description }}
              </p>
            </div>
            <div class="d-flex justify-space-between  w-100 items-center mt-auto">
              <a
                :href="partner.link"
                target="_blank"
                class="text-sm text-purple-600 font-medium hover:underline"
              >
                Перейти
              </a>
              <VChip
                color="secondary"
                size="23"
                class="px-2"
                style="font-size: 12px;"
              >
                {{ partner.category?.name }}
              </VChip>
            </div>
          </div>
        </VCardText>
      </VCard>
    </div>

    <!-- Нет результатов -->
    <div
      v-if="filteredPartners.length === 0"
      class="text-center text-gray-500 mt-10"
    >
      Ничего не найдено
    </div>
  </div>
</template>

<style scoped>
.partners-page {
  padding: 24px;
}

:deep(.v-badge__badge) {
  height: 15px !important;
  min-width: 15px !important;
  width: 15px !important;
}
</style>
