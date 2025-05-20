<template>
  <VCol
    :cols="gridConfig.cols"
    :sm="gridConfig.sm"
    :md="gridConfig.md"
    :lg="gridConfig.lg"
    :xl="gridConfig.xl"
  >
    <VCard class="product-card">
      <template v-if="item.product.images?.length">
        <VCarousel
          :continuous="false"
          :show-arrows="item.product.images.length > 1"
          height="100%"
          hide-delimiters
        >
          <VCarouselItem
            v-for="(image, idx) in item.product.images"
            :key="idx"
          >
            <VImg
              :src="image"
              cover
              height="100%"
              class="product-image"
            />
          </VCarouselItem>
        </VCarousel>
      </template>

      <!-- Показываем плейсхолдер если нет картинок -->
      <template v-else>
        <div class="product-image-placeholder" style="height: 200px; background: #f2f2f2; display: flex; align-items: center; justify-content: center;">
          <span style="color: #999;">Нет изображения</span>
        </div>
      </template>

      <VCardItem>
        <router-link :to="`/products/${item.id}`" class="text-decoration-none">
          <VCardTitle class="text-body-1">
            {{ item.product.name }}
          </VCardTitle>
        </router-link>
        <router-link v-if="item.product?.category" :to="`/categories/${item.product?.category?.id}`" class="text-decoration-none">
          <VChip
            size="small"
            color="orange-lighten-5"
            text-color="orange-darken-2"
            class="mt-2"
          >
            {{ item.product.category.name }}
          </VChip>
        </router-link>
      </VCardItem>

      <VCardText>
        <div class="d-flex align-center gap-2 mb-2">
                <span class="text-h6 text-primary">
                  {{ item.price_with_cashback }} ₽
                </span>
          <span class="text-body-2 text-disabled text-decoration-line-through">
                  {{ item.product.price }} ₽
                </span>
        </div>

        <div class="d-flex align-center mb-2">
          <VIcon icon="ri-money-dollar-circle-line" color="success" size="20" class="me-1" />
          <span class="text-caption">
              Кешбек {{ item.cashback_percentage }}%
          </span>
        </div>

        <div class="d-flex align-center mb-4">
          <VRating
            :model-value="parseFloat(item.product.rating)"
            density="compact"
            size="small"
            readonly
            half-increments
          />
          <span class="text-caption ms-1">
                  ({{item.product.rating}})
                </span>
        </div>

        <VBtn block color="primary" prepend-icon="mdi-cart-plus" @click="goToProduct(item.id)">
          Перейти
        </VBtn>
      </VCardText>
    </VCard>
  </VCol>
</template>

<script setup>
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

const router = useRouter()

const goToProduct = (productId) => {
  router.push(`/products/${productId}`)
}

defineEmits(['go-to-product']);
</script>

<style scoped>
.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-image {
  object-fit: cover;
}
</style>
