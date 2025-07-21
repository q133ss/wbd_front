<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/index.js'

const categories = ref([])
const partners = ref([])
const selectedCategoryId = ref(0)
const searchQuery = ref('')

// Загрузка категорий и первой категории
onMounted(async () => {
  try {
    categories.value = await api.partners.categories()
    await loadPartnersByCategoryId(selectedCategoryId.value)
  } catch (e) {
    console.error('Ошибка при загрузке', e)
  }
})

// Загрузка партнёров по id категории
const loadPartnersByCategoryId = async (categoryId) => {
  selectedCategoryId.value = categoryId
  const response = await api.partners.list(categoryId)
  partners.value = response.data
}

// Локальная фильтрация по поиску
const filteredPartners = computed(() => {
  return partners.value.filter(partner =>
    partner.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="partners-page">
    <h1 class="text-2xl font-bold mb-4">Партнёры</h1>

    <!-- Категории -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="loadPartnersByCategoryId(category.id)"
        :class="[
      'px-4 py-2 rounded-full border text-sm',
      selectedCategoryId === category.id
        ? 'bg-purple-100 text-purple-700 border-purple-300'
        : 'bg-gray-100 text-gray-700 border-gray-300'
    ]"
      >
        {{ category.name }}
      </button>
    </div>


    <!-- Поиск -->
    <div class="mb-6">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="🔍 Поиск по партнёрам"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
    </div>

    <!-- Сетка карточек: 3 колонки -->
    <v-row dense>
      <v-col
        v-for="partner in filteredPartners"
        :key="partner.id"
        cols="12"
        sm="6"
        md="4"
      >
        <div class="rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition h-full flex flex-col">
          <img
            :src="partner.img?.src"
            alt="Логотип партнёра"
            class="w-full h-20 object-contain bg-gray-100"
          />
          <div class="p-4 flex flex-col flex-grow justify-between">
            <div>
              <h3 class="text-lg font-semibold mb-1">{{ partner.name }}</h3>
              <p class="text-sm text-gray-600 mb-4">
                {{ partner.description }}
              </p>
            </div>
            <div class="flex justify-between items-center mt-auto">
              <a
                :href="partner.link"
                target="_blank"
                class="text-sm text-purple-600 font-medium hover:underline"
              >
                Перейти
              </a>
              <span class="text-xs px-2 py-1 bg-gray-100 rounded-full">
                {{ partner.category?.name }}
              </span>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Нет результатов -->
    <div v-if="filteredPartners.length === 0" class="text-center text-gray-500 mt-10">
      Ничего не найдено
    </div>
  </div>
</template>

<style scoped>
.partners-page {
  padding: 24px;
}
</style>
