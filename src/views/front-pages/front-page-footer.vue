<script setup>
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
</script>

<template>
  <div class="footer">
    <VSheet
      class="footer-top pt-8 pb-4"
      theme="dark"
    >
      <VContainer>
        <VRow>
          <!-- 👉 Footer  -->
          <VCol
            cols="12"
            md="5"
          >
            <div class="footer-form">
              <div class="d-flex gap-2 py-1 mb-6">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h1 class="footer-title">
                  {{ themeConfig.app.title }}
                </h1>
              </div>
              <div class="text-body-1 footer-text mb-6">
                Общество с ограниченной ответственностью “Маркет Ревью”
                <br>
                ИНН: 9722092663
              </div>

              <router-link to="/terms">Пользовательское соглашение</router-link>
              <br>
              <router-link to="/privacy">Политика конфидициальности</router-link>
              <br>
              <router-link to="/sitemap.xml">Карта сайта</router-link>
            </div>
          </VCol>

          <!-- 👉 Pages -->
          <VCol
            md="2"
            sm="4"
            xs="6"
          >
            <div class="footer-links">
              <div class="footer-heading mb-6">
                Покупателям
              </div>
              <ul style="list-style: none;">
                <li class="mb-4">
                  <RouterLink
                    class="text-body-1 footer-text text-no-wrap"
                    to="/"
                  >
                    <div class="d-flex align-center">
                      <div>
                        Главная
                      </div>
                    </div>
                  </RouterLink>
                </li>

                <li class="mb-4">
                  <RouterLink
                    class="text-body-1 footer-text text-no-wrap"
                    to="/categories"
                  >
                    <div class="d-flex align-center">
                      <div>
                        Категории
                      </div>
                    </div>
                  </RouterLink>
                </li>

                <li class="mb-4">
                  <RouterLink
                    class="text-body-1 footer-text text-no-wrap"
                    to="/buyer/login"
                  >
                    <div class="d-flex align-center">
                      <div>
                        Вход
                      </div>
                    </div>
                  </RouterLink>
                </li>
              </ul>
            </div>
          </VCol>

          <!-- 👉 Products  -->
          <VCol
            md="2"
            sm="4"
            xs="6"
          >
            <div class="footer-links">
              <div class="footer-heading mb-6">
                Продавцам
              </div>
              <ul>
                <li class="mb-4 text-body-1" style="list-style: none;">
                  <RouterLink
                    to="/login?role=seller"
                    class="footer-text text-no-wrap"
                  >
                    Вход
                  </RouterLink>
                </li>

                <li class="mb-4 text-body-1" style="list-style: none;">
                  <RouterLink
                    to="/seller/support"
                    class="footer-text text-no-wrap"
                  >
                    Поддержка
                  </RouterLink>
                </li>
              </ul>
            </div>
          </VCol>

          <!-- 👉 Download App -->
          <VCol
            cols="12"
            md="3"
            sm="4"
          >
            <div>
              <div class="footer-heading mb-6">
                Контакты
              </div>
              <div>
                <ul>
                  <li class="mb-4 text-body-1" style="list-style: none;">
                    <VIcon
                      icon="ri-mail-line"
                      size="16"
                      color="white"
                    />
                    contact@wbdiscount.pro
                  </li>
                  <li class="mb-4 text-body-1" style="list-style: none;">
                    <VIcon
                      icon="ri-phone-line"
                      size="16"
                      color="white"
                    />
                    +7 (977) 687 58 92
                  </li>
                  <li class="mb-4 text-body-1" style="list-style: none;">
                    <VIcon
                      icon="ri-map-pin-line"
                      size="16"
                      color="white"
                    />
                    г. Москва, вн. тер. г. муниципальный округ Лефортово, ул. Авиамоторная,д. 50 стр. 2, помещ. 29/2
                  </li>
                </ul>
              </div>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>

    <div class="footer-line w-100">
      <VContainer>
        <div class="d-flex justify-space-between flex-wrap gap-y-4">
          <span class="d-flex align-center text-body-2 footer-heading font-weight-regular">
            WBDiscount.pro | Все права защищены &copy; {{ new Date().getFullYear() }}
          </span>
          <div class="d-flex gap-x-1">
            <template
              v-for="(item, index) in [
                { title: 'Telegram', icon: 'ri-telegram-line', href: 'http://telegram.org' },
                { title: 'Instagram', icon: 'ri-instagram-line', href: 'https://www.instagram.com' },
                { title: 'VK', icon: 'ri-vk-line', href: 'https://vk.ru' },
              ]"
              :key="index"
            >
              <IconBtn
                :href="item.href"
                size="x-small"
                target="_blank"
                color="#fff"
                rel="noopener noreferrer"
              >
                <VIcon
                  :icon="item.icon"
                  size="16"
                  color="white"
                />
              </IconBtn>
            </template>
          </div>
        </div>
      </VContainer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer-top {
  background-color: rgba(var(--v-theme-background));
}

.footer-heading {
  color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));
  font-weight: 500;
  line-height: 22px;
}

.footer-text {
  color: rgba(255, 255, 255, var(--v-medium-emphasis-opacity));
}

.footer-title {
  color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.27px;
  line-height: 1.5rem;
  text-transform: capitalize;
}

.footer-line {
  background: #211b2c;
  color: rgba(255, 255, 255, var(--v-medium-emphasis-opacity));
  font-size: 13px;
  line-height: 20px;
}

.footer {
  color: rgba(255, 255, 255, 70%);
}

.footer-links {
  .footer-text:hover {
    color: #fff;
  }
}
</style>

<style lang="scss">
.footer {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }

    .footer-logo-buttons {
      gap: 0.5rem;
    }
  }
}

.footer-form {
  @media (min-width: 1280px) {
    max-inline-size: 400px;
  }
}
</style>
