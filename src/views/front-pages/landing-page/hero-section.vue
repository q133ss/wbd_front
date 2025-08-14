<script setup>
import SectionTitle from '../Ui/SectionTitle.vue'

const scrollToSection = sectionId => {
  const element = document.getElementById(sectionId)
  if (element) element.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section
    id="hero"
    class="bg-white"
    style="padding-bottom: 75px;"
  >
    <VContainer class="container-custom">
      <VRow justify="center">
        <VCol
          cols="12"
          md="8"
          class="text-center"
        >
          <div
            v-motion
            :initial="{ opacity: 0, y: 30 }"
            :enter="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          >
            <SectionTitle
              title="WBdiscount — умное продвижение карточек на WB"
              subtitle="Автоматизация выкупов и отзывов, антифрод, аналитика. Всё, что не хватало при работе с TG-группами."
              class="mb-10"
            />


            <div class="d-flex flex-wrap gap-4 justify-center items-center mb-12">
              <VBtn
                color="primary"
                variant="flat"
                size="x-large"
                class="text-none"
                to="/seller/login"
              >
                Начать продвижение
              </VBtn>

              <VBtn
                color="secondary"
                variant="flat"
                size="x-large"
                class="text-none"
                @click="scrollToSection('pricing')"
              >
                Посмотреть тарифы
              </VBtn>
            </div>

            <!-- Metrics badges -->
            <div class="d-flex flex-wrap justify-center gap-4 opacity-70 mb-16">
              <VChip
                variant="flat"
                size="md"
                class="text-no-wrap pa-1 px-2 "
                style="background-color: rgba(var(--v-theme-secondary), 0.1) !important; color: var(--v-theme-on-surface);"
              >
                <VIcon
                  icon="ri-arrow-right-up-long-fill"
                  class="w-4 h-4 mr-1"
                />
                1039 покупателей
              </VChip>
              <VChip
                variant="flat"
                size="md"
                class="text-no-wrap pa-1 px-2 "
                style="background-color: rgba(var(--v-theme-secondary), 0.1) !important; color: var(--v-theme-on-surface);"
              >
                <VIcon
                  icon="ri-group-line"
                  class="w-4 h-4 mr-1"
                />
                320 продавцов
              </VChip>
              <VChip
                variant="flat"
                size="md"
                class="text-no-wrap pa-1 px-2 "
                style="background-color: rgba(var(--v-theme-secondary), 0.1) !important; color: var(--v-theme-on-surface);"
              >
                <VIcon
                  icon="ri-shopping-bag-line"
                  class="w-4 h-4 mr-1"
                />
                3902 объявления
              </VChip>
              <VChip
                variant="flat"
                size="md"
                class="text-no-wrap pa-1 px-2 "
                style="background-color: rgba(var(--v-theme-secondary), 0.1) !important; color: var(--v-theme-on-surface);"
              >
                <VIcon
                  icon="ri-money-dollar-circle-line"
                  class="w-4 h-4 mr-1"
                />
                100 493 ₽ выплачено
              </VChip>
            </div>

            <!-- Floating Dashboard Illustration -->
            <div
              v-motion
              :initial="{ opacity: 0, y: 50, scale: 0.9 }"
              :enter="{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 800, delay: 400, ease: 'easeOut' }
              }"
              class="relative max-w-4xl mx-auto"
            >
              <!-- Background Glow -->
              <div class="absolute inset-0 bg-gradient-to-r from-primary-200/30 via-purple-200/30 to-primary-300/30 rounded-3xl blur-3xl transform scale-110" />

              <!-- Floating Container -->
              <!--
                <picture>
                <img
                src="/images/landing-hero.jpg"
                class="w-100 rounded-lg"
                >
                </picture> 
              -->
              <VCard
                rounded="lg"
                class="ma-0 pa-0 border border-secondary"
              >
                <VImg src="/images/landing-hero.jpg" />
              </VCard>

              

              <!-- Floating Elements -->
              <!--
                <VSheet
                width="32"
                height="32"
                color="info"
                rounded="circle"
                class="bounce circle-top-right opacity-80"
                />

                <VSheet
                width="24"
                height="24"
                color="success"
                rounded="circle"
                class="pulse circle-bottom-left opacity-60"
                />

                <VSheet
                width="14"
                height="14"
                color="info"
                rounded="circle"
                class="ping circle-middle-right opacity-40"
                /> 
              -->
            </div>
          </div>
        </VCol>
      </VRow>
    </VContainer>
  </section>
</template>

<style scoped>
.circle-top-right {
  position: absolute;
  top: -16px;   /* -top-4 */
  right: -16px; /* -right-4 */
}

.circle-bottom-left {
  position: absolute;
  bottom: -24px; /* -bottom-6 */
  left: -24px;   /* -left-6 */
}

.circle-middle-right {
  position: absolute;
  top: 50%;      /* top-1/2 */
  right: -32px;  /* -right-8 */
  transform: translateY(-50%);
}

/* Анимации */
.bounce {
  animation: bounce 1s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(-25%); }
  50% { transform: translateY(0); }
}

.pulse {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.ping {
  animation: ping 1s infinite;
}
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
