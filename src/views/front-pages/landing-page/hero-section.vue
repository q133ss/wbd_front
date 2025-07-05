<script setup>
import { useMouse } from '@vueuse/core'
import { useTheme } from 'vuetify'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import darkBg from '@images/front-pages/backgrounds/hero-bg-dark.png'
import lightBg from '@images/front-pages/backgrounds/hero-bg.png'
import heroDashboardImgDark from '@images/front-pages/landing-page/banner.png'
import heroDashboardImgLight from '@images/front-pages/landing-page/banner.png'
import heroElementsImgDark from '@images/front-pages/landing-page/hero-elements-dark.png'
import heroElementsImgLight from '@images/front-pages/landing-page/hero-elements-light.png'

const theme = useTheme()
const isDark = ref(theme.name)

const heroBgUrl = computed(() => {
  if (isDark.value === 'dark')
    return darkBg
  else
    return lightBg
})

const heroElementsImg = useGenerateImageVariant(heroElementsImgLight, heroElementsImgDark)
const heroDashboardImg = useGenerateImageVariant(heroDashboardImgLight, heroDashboardImgDark)
const { x, y } = useMouse({ touch: false })

const translateMouse = computed(() => speed => {
  if (typeof window !== 'undefined') {
    const positionX = computed(() => (window.innerWidth - x.value * speed) / 100)
    const positionY = computed(() => Math.max((window.innerHeight - y.value * speed) / 100, -40))
    
    return { transform: `translate(${ positionX.value }px,${ positionY.value }px` }
  }
})
</script>

<template>
  <section
    id="home"
    :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }"
  >
    <div
      id="landingHero"
      class="landing-hero"
      :style="{ backgroundImage: `url(${heroBgUrl})` }"
    >
      <VContainer>
        <div class="text-center pt-6 pb-16">
          <div class="mb-4 landing-page-title">
            <div>
              Биржа живых отзывов и выкупов
            </div>
            от реальных покупателей
          </div>
          <div class="text-body-1 font-weight-medium text-high-emphasis pb-8">
            <p class="mb-0">
              WBdiscount — это инструмент, который помогает вам быстро поднимать карточки в поиске,
            </p>
            <p class="mb-0">
              увеличивать продажи и собирать качественные отзывы без риска и ручной рутины.
            </p>
          </div>
          <VBtn
            to="/seller/login"
            size="large"
            :active="false"
          >
            Начать продвижение
          </VBtn>
        </div>

        <div class="position-relative hero-animation-img">
          <div class="hero-dashboard-img text-center">
            <RouterLink
              to="/"
              target="_blank"
            >
              <img
                :src="heroDashboardImg"
                data-allow-mismatch
                class="mx-auto cursor-pointer"
                :style="translateMouse(3)"
              >
            </RouterLink>
          </div>

          <div class="hero-elements-img">
            <RouterLink
              to="/"
              target="_blank"
            >
              <img
                class="cursor-pointer"
                data-allow-mismatch
                :src="heroElementsImg"
                :style="translateMouse(5)"
                target="_blank"
              >
            </RouterLink>
          </div>
        </div>
      </VContainer>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use "@layouts/styles/mixins" as layoutMixins;

section {
  display: block;
  padding-block-end: 6.25rem;
}

.landing-hero {
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: cover;
  padding-block-start: 5.5rem;
}

.hero-dashboard-img {
  img {
    inline-size: 85%;
  }
}

.hero-elements-img {
  position: absolute;
  inline-size: 100%;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  transform: translate(-50%, -50%);

  @include layoutMixins.rtl {
    transform: translate(50%, -50%);
  }

  img {
    inline-size: 100%;
  }
}

.container {
  margin-inline: auto;
  max-inline-size: 85vw;
}

.feature-cards {
  margin-block-start: 6.25rem;
}

.landing-page-title {
  color: rgb(var(--v-theme-primary));
  font-size: 2.375rem;
  font-weight: 800;
  line-height: 2.75rem;
}

.hero-animation-img {
  inset-block-start: 0;
  margin-block-end: -16rem;
}

@media (max-width: 960px) {
  .hero-animation-img {
    inset-block-start: 2rem;
    margin-block-end: -8rem;
  }
}

@media (max-width: 600px) {
  section {
    padding-block-end: 4.25rem;
  }

  .hero-animation-img {
    inset-block-start: 1rem;
    margin-block-end: -2rem;
  }

  .landing-page-title {
    font-size: 1.75rem;
    line-height: 2.25rem;
  }
}
</style>
