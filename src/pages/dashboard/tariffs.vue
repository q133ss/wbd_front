<script setup>
import { ref, onMounted } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'
import api from '@/api/Index'

const snackbar = useSnackbarStore()
const tariffs = ref([])
const loading = ref(true)

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
              <h2 class="text-h5 mb-4">{{ tariff.name }}</h2>
              <p class="text-h6 font-weight-bold mb-2">{{ tariff.price }} ₽</p>
              <p class="text-body-1 mb-4">
                {{ tariff.buybacks_count }} {{ getBuybackDeclension(tariff.buybacks_count) }}
              </p>
              <v-divider class="mb-4" />
              <ul class="advantages-list mb-4 flex-grow">
                <li
                  v-for="(advantage, index) in tariff.advantages"
                  :key="index"
                  class="text-body-2"
                >
                  {{ advantage }}
                </li>
              </ul>
              <p class="text-body-1 mb-4">
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
</template>

<style scoped lang="scss">
.tariffs-container {
  padding: 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin-left: 0;
}

.tariff-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

  li {
    margin-bottom: 8px;
  }
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}
</style>
