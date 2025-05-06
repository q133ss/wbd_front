<template>
  <VCol
    cols="12"
    sm="6"
    md="4"
    lg="3"
  >
    <VCard class="product-card">
      <template v-if="item.product.images?.length">
        <VCarousel
          :continuous="false"
          :show-arrows="item.product.images.length > 1"
          height="200"
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
        <VChip
          v-if="item.product.category"
          size="small"
          color="orange-lighten-5"
          text-color="orange-darken-2"
          class="mt-2"
        >
          {{ item.product.category.name }}
        </VChip>
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
          <VIcon icon="mdi-cashback" color="success" size="20" class="me-1" />
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
                  ({{ item.reviews.length }})
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
defineProps({
  item: {
    type: Object,
    required: true,
  },
});

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
