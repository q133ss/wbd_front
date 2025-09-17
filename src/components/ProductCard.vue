<template>
  <VCol
    :cols="gridConfig.cols"
    :sm="gridConfig.sm"
    :md="gridConfig.md"
    :lg="gridConfig.lg"
    :xl="gridConfig.xl"
  >
    <div style="display: flex; flex-direction: column; height: 100%;">
      <template v-if="item.product.images?.length">
        <router-link :to="`/products/${item.id}`" class="text-decoration-none">
          <VImg
            :src="item.product.images[0]"
            cover
            height="100%"
            class="product-image"
          />
        </router-link>
      </template>

      <!-- Показываем плейсхолдер если нет картинок -->
      <template v-else>
        <div class="product-image-placeholder" style="height: 200px; background: #f2f2f2; display: flex; align-items: center; justify-content: center;">
          <span style="color: #999;">Нет изображения</span>
        </div>
      </template>
      <VChip
        size="small"
        color="rgb(var(--v-theme-primary))"
        variant="flat"
        class="product-percentage"
      >
        {{parseInt(item.cashback_percentage)}}% / кэшбек {{parseInt(item.price_without_cashback - item.price_with_cashback)}} ₽
      </VChip>

      <div class="product-info-wrap">
        <div class="d-flex align-center gap-2 mt-1">
          <span class="text-h4 text-primary product-price">
            {{ parseInt(item.price_with_cashback) }}₽
          </span>
          <span class="text-body-2 text-disabled text-decoration-line-through">
            {{ parseInt(item.product.price) }}₽
          </span>

          <VTooltip location="top">
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                variant="text"
                color="primary"
                icon
                size="small"
              >
                <VIcon
                  size="20"
                  icon="ri-question-line"
                />
              </VBtn>
            </template>

            <!-- Содержимое подсказки -->
            <div class="price-tooltip">
              <div class="d-flex align-center mb-2">
                <span class="font-weight-bold text-primary">{{ parseInt(item.price_with_cashback) }} ₽</span>
                <span class="ml-2">- цена для вас с учетом кэшбека</span>
              </div>

              <div class="d-flex align-center mb-2">
                <span class="font-weight-bold text-primary">{{ parseInt(item.product.price) - parseInt(item.price_with_cashback) }} ₽</span>
                <span class="ml-2">- продавец вернет вам на карту</span>
              </div>

              <div class="d-flex align-center">
                <span class="font-weight-bold text-primary">{{ parseInt(item.product.price) }} ₽</span>
                <span class="ml-2">- цена на Wildberries</span>
              </div>
            </div>
          </VTooltip>

        </div>
      </div>

      <div>
        <router-link :to="`/products/${item.id}`" class="text-decoration-none mb-2">
          <h3 class="text-body-1 product-name">
            {{ item.product.name }}
          </h3>
        </router-link>
      </div>
    </div>
  </VCol>
</template>

<script setup>
import { ref } from "vue"

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  gridConfig: {
    type: Object,
    default: () => ({
      cols: '6', // 1 колонка на мобильных (12/12 = 1)
      sm: '4',    // 2 колонки (12/6 = 2)
      md: '3',    // 3 колонки (12/4 = 3)
      lg: '2',    // 4 колонки (12/3 = 4)
      xl: '2'     // 6 колонок (12/2 = 6)
    })
  }
});
const isDialogVisible = ref(false)
</script>

<style scoped>
.product-image {
  object-fit: cover;
  border-radius: 15px;
  background: hsl(0, 0%, 90%);
}

.product-info-wrap{
  margin-top: -20px;
}

.product-price{
  font-size: 1.2rem!important;
  font-weight: 700;
}

.product-name{
  font-size: 0.8rem !important;
  font-weight: 200;
  line-height: 1rem;
}

.product-percentage{
  color: #ffffff;
  width: 90%;
  position: relative;
  bottom: 40px;
  left: 10px;
  text-align: center;
  //background: rgb(38,43,67)!important;
}

@media screen and (max-width: 1440px) {
  .product-percentage {
    font-size: 11px!important;
  }
}
</style>
<style>
.product-percentage .v-chip__content{
  display: block!important;
  width: 100%!important;
  text-align: center!important;
}
</style>
