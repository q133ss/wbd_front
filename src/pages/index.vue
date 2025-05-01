<script setup>
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'

// Данные товаров
const products = ref([
  {
    id: 1,
    name: 'Умные часы Xiaomi Mi Band 7',
    category: 'Гаджеты',
    price: 8990,
    discount: 25,
    image: '@/assets/images/products/smartwatch.jpg',
    description: 'Фитнес-браслет с AMOLED-экраном и 15-дневным временем работы'
  },
  {
    id: 2,
    name: 'Беспроводные наушники Sony WH-1000XM4',
    category: 'Аудио',
    price: 24990,
    discount: 15,
    image: '@/assets/images/products/headphones.jpg',
    description: 'Наушники с шумоподавлением и 30-часовой работой'
  },
  {
    id: 3,
    name: 'Смартфон Samsung Galaxy S22',
    category: 'Смартфоны',
    price: 79990,
    discount: 10,
    image: '@/assets/images/products/phone.jpg',
    description: 'Флагманский смартфон с камерой 108 МП'
  },
  {
    id: 4,
    name: 'Ноутбук ASUS ZenBook 14',
    category: 'Ноутбуки',
    price: 89990,
    discount: 20,
    image: '@/assets/images/products/laptop.jpg',
    description: 'Ультрабук с процессором Intel Core i7 и OLED-экраном'
  },
  {
    id: 5,
    name: 'Фотоаппарат Canon EOS R6',
    category: 'Фототехника',
    price: 159990,
    discount: 12,
    image: '@/assets/images/products/camera.jpg',
    description: 'Зеркальная камера с матрицей 20 МП'
  },
  {
    id: 6,
    name: 'Игровая консоль PlayStation 5',
    category: 'Игры',
    price: 59990,
    discount: 5,
    image: '@/assets/images/products/ps5.jpg',
    description: 'Новейшая игровая консоль от Sony'
  },
  {
    id: 7,
    name: 'Умная колонка Яндекс Станция',
    category: 'Умный дом',
    price: 19990,
    discount: 18,
    image: '@/assets/images/products/speaker.jpg',
    description: 'Голосовой помощник с Алисой'
  },
  {
    id: 8,
    name: 'Электросамокат Xiaomi Pro 2',
    category: 'Транспорт',
    price: 34990,
    discount: 22,
    image: '@/assets/images/products/scooter.jpg',
    description: 'Мощный самокат с пробегом 45 км'
  }
])

// Вычисляем цену со скидкой
products.value = products.value.map(product => ({
  ...product,
  discountedPrice: Math.round(product.price * (100 - product.discount) / 100)
}))

const addToCart = (product) => {
  console.log('Добавлен товар:', product.name)
  // Здесь логика добавления в корзину
}
</script>

<template>
  <div class="landing-page-wrapper">
    <Navbar :active-id="activeSectionId" />

    <div class="banner-container">
      <div class="banner-wrap">
        <img
          src="@/assets/images/index/banner.png"
          alt="WB Discount баннер"
          class="banner-img"
        >
      </div>
    </div>

    <!-- Товары -->

    <!-- Контейнер для товаров -->
    <VContainer class="products-container">
      <VRow>
        <VCol
          v-for="product in products"
          :key="product.id"
          cols="6"
          sm="4"
          md="3"
          lg="2"
          xl="2"
        >
          <VCard
            class="product-card"
            hover
            border
          >
            <div class="discount-badge">
              -{{ product.discount }}%
            </div>

            <VImg
              :src="product.image"
              cover
              height="200"
              class="product-image"
            />

            <VCardItem>
              <VChip
                size="small"
                color="orange-lighten-5"
                text-color="orange-darken-2"
                class="mb-2"
              >
                {{ product.category }}
              </VChip>

              <VCardTitle class="text-body-1">
                <RouterLink
                  :to="`/products/${product.id}`"
                  class="product-title"
                >
                  {{ product.name }}
                </RouterLink>
              </VCardTitle>
            </VCardItem>

            <VCardText>
              <div class="d-flex align-center gap-2 mt-2">
                <span class="text-h6 text-primary">{{ product.discountedPrice }} ₽</span>
                <span class="text-body-2 text-disabled text-decoration-line-through">{{ product.price }} ₽</span>
              </div>

              <VBtn
                block
                color="primary"
                class="mt-4"
                prepend-icon="mdi-cart-plus"
                @click="addToCart(product)"
              >
                В корзину
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </VContainer>

    <!-- Товары -->

    <Footer />
  </div>
</template>

<style lang="scss">
/* Основной контейнер для баннера с теми же отступами, что и у навбара */
.banner-container {
  width: 100%;
  max-width: calc(1440px - 32px);
  margin: 0 auto;
  padding: 0 16px;
  margin-top: 80px;
}

/* Стили для баннера */
.banner-wrap {
  width: 100%;
  overflow: hidden;
  border-radius: 8px; /* Опционально: скругление углов */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Опционально: тень */
}

.banner-img {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* Адаптивные стили как у навбара */
@media (min-width: 1920px) {
  .banner-container {
    max-width: calc(1440px - 32px);
  }
}

@media (min-width: 1280px) and (max-width: 1919px) {
  .banner-container {
    max-width: calc(1200px - 32px);
  }
}

@media (min-width: 960px) and (max-width: 1279px) {
  .banner-container {
    max-width: calc(900px - 32px);
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .banner-container {
    max-width: calc(100% - 62px);
  }
}

@media (max-width: 600px) {
  .banner-container {
    max-width: calc(100% - 32px);
    padding: 0 8px;
  }
}

// Товары
.product-card {
  position: relative;
  transition: transform 0.3s ease;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff5722;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 1;
}

.product-image {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.product-title {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.product-title:hover {
  color: var(--v-primary);
}
</style>
