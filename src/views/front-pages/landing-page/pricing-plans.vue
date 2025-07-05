<script setup>
import { onMounted, ref } from "vue"
import api from "@/api/index.js"

const tariffs = ref([])

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

onMounted(async () => {
  try {
    const response = await api.tariff.getLandingTariffList()
    tariffs.value = response || []
  } catch (error) {
    snackbar.notify({
      text: 'Ошибка загрузки тарифов',
      color: 'error'
    })
  }
})
</script>

<template>
  <hr>
  <div class="text-center feature-text-block">
        <span class="feature-subheading">
          Тарифные планы:
        </span>
    <h3 class="feature-heading">
      Сколько это стоит?
    </h3>
    <span class="feature-subheading">
      Приобретайте выкупы с выгодой до 20%
    </span>
  </div>

  <VContainer id="pricing-plan">
    <v-row>
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
            width="100%"
            color="primary"
            to="/seller/login"
          >
            начать продвижение
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </VContainer>
</template>

<style lang="scss">
.card-list {
  --v-card-list-gap: 12px;
}
</style>

<style lang="scss" scoped>
.plan-price-text {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 48px;
  font-weight: 700;
  line-height: 56px;
}

.pricing-plans {
  position: relative;
  margin-block: 5.25rem;
}

.front-page-vector {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
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
</style>
