<template>
  <VFooter height="auto">
    <VContainer>
      <VRow dense>
        <!-- Колонка 1: бренд + реквизиты -->
        <VCol
          cols="12"
          md="3"
        >
          <RouterLink
            to="/"
            class="d-flex gap-2 py-1 mb-6"
          >
            <VNodeRenderer :nodes="themeConfig.app.logo" />
            <h1 class="footer-title">
              {{ themeConfig.app.title }}
            </h1>
          </RouterLink>

          <div class="text-caption mb-4">
            Общество с ограниченной ответственностью "Маркет Ревью"<br>
            ИНН: 9722092663
          </div>

          <div class="d-flex flex-column">
            <RouterLink
              to="/legal/user-agreement"
              class="text-caption  text-decoration-none"
            >
              Пользовательское соглашение
            </RouterLink>
            <RouterLink
              to="/legal/privacy"
              class="text-caption my-2 text-decoration-none"
            >
              Политика конфиденциальности
            </RouterLink>
            <RouterLink
              to="/sitemap"
              class="text-caption  text-decoration-none"
            >
              Карта сайта
            </RouterLink>
          </div>
        </VCol>

        <!-- Колонка 2: Покупателям -->
        <VCol
          cols="12"
          md="3"
        >
          <h3 class="text-subtitle-1 font-weight-bold mb-3">
            Покупателям
          </h3>
          <div class="d-flex flex-column">
            <RouterLink
              to="/"
              class="text-body-1 text-decoration-none"
            >
              Главная
            </RouterLink>
            <RouterLink
              to="/categories"
              class="text-body-1 my-2 text-decoration-none"
            >
              Категории
            </RouterLink>
            <RouterLink
              to="/login"
              class="text-body-1 text-decoration-none"
            >
              Вход
            </RouterLink>
          </div>
        </VCol>

        <!-- Колонка 3: Продавцам -->
        <VCol
          cols="12"
          md="3"
        >
          <h3 class="text-subtitle-1 font-weight-bold mb-3">
            Продавцам
          </h3>
          <div class="d-flex flex-column">
            <RouterLink
              to="/seller/login"
              class="text-body-1 hover-primary mb-2 text-decoration-none"
            >
              Вход
            </RouterLink>
            <RouterLink
              to="/support"
              class="text-body-1 mb-1 text-decoration-none"
            >
              Поддержка
            </RouterLink>
          </div>
        </VCol>

        <!-- Колонка 4: Контакты -->
        <VCol
          cols="12"
          md="3"
        >
          <h3 class="text-subtitle-1 font-weight-bold mb-3">
            Контакты
          </h3>
          <div class="d-flex flex-column">
            <a
              href="mailto:contact@wbdiscount.pro"
              class="text-caption d-flex align-center"
            >
              <VIcon
                size="18"
                class="mr-1"
              >ri-mail-line</VIcon>
              contact@wbdiscount.pro
            </a>
            <a
              href="tel:+79776875892"
              class="text-caption my-3 d-flex align-center"
            >
              <VIcon
                size="18"
                class="mr-1"
              >ri-phone-line</VIcon>
              +7 (977) 687 58 92
            </a>
            <div class="text-caption d-flex align-start">
              <VIcon
                size="18"
                class="mr-1 mt-1"
              >
                ri-map-pin-line
              </VIcon>
              г. Москва, вн. тер. г. муниципальный округ Лефортово,<br>
              ул. Авиамоторная, д. 50 стр. 2, помещение 29/2
            </div>
          </div>
        </VCol>
      </VRow>

      <!-- Нижняя плашка -->
      <VDivider class="my-6" />
      <VRow
        align="center"
        justify="space-between"
      >
        <VCol cols="10">
          <span class="text-caption">Wbdiscount.pro | Все права защищены © {{ currentYear }}</span>
        </VCol>
        <VCol
          cols="2"
          class="d-flex justify-end"
        >
          <a
            href="https://t.me/wbdiscount"
            target="_blank"
            class="mr-3"
            aria-label="Telegram"
          >
            <VIcon size="24">ri-telegram-line</VIcon>
          </a>
          <a
            href="mailto:contact@wbdiscount.pro"
            aria-label="Email"
          >
            <VIcon size="24">ri-mail-line</VIcon>
          </a>
        </VCol>
      </VRow>
    </VContainer>
  </VFooter>
</template>

<script setup lang="ts">
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer-title {
  color: rgb(103,106,123);
  //color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.27px;
  line-height: 1.5rem;
  text-transform: capitalize;
}
</style>
