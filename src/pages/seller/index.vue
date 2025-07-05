<script setup>
import Footer from "@/views/front-pages/front-page-footer.vue"
import Navbar from "@/views/front-pages/front-page-navbar.vue"
import HeroSection from "@/views/front-pages/landing-page/hero-section.vue"
import CustomersReview from "@/views/front-pages/landing-page/customers-review.vue"
import Features from "@/views/front-pages/landing-page/features.vue"
import ProductStats from "@/views/front-pages/landing-page/product-stats.vue"
import Banner from "@/views/front-pages/landing-page/banner.vue"
import FaqSection from "@/views/front-pages/landing-page/faq-section.vue"
import ContactUs from "@/views/front-pages/landing-page/contact-us.vue"
import OurTeam from "@/views/front-pages/landing-page/our-team.vue"
import PricingPlans from "@/views/front-pages/landing-page/pricing-plans.vue"

definePage({
  meta: {
    layout: 'blank',
    authRequired: false
  },
})

import { useTheme } from 'vuetify'

const theme = useTheme()

// Принудительно включить светлую тему при монтировании
theme.global.name.value = 'light'
</script>

<template>
  <Navbar />
<!--  start-->
  <!-- 👉 Hero Section  -->
  <HeroSection ref="refHome" />

  <!-- 👉 Useful features  -->
  <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
    <Features ref="refFeatures" />
  </div>

  <hr>
  <!-- 👉 Customer Review -->
  <CustomersReview />

  <!-- 👉 Our Team -->
  <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
    <OurTeam ref="refTeam" />
  </div>

  <!-- 👉 Pricing Plans -->
  <PricingPlans />

  <!-- 👉 FAQ Section -->
  <FaqSection ref="refFaq" />

  <!-- 👉 Banner  -->
  <Banner />

  <!-- 👉 Contact Us  -->
  <ContactUs ref="refContact" />
<!--  end-->
  <Footer />
</template>

<style scoped lang="scss">
.page-container{
  padding-top: 80px;
}
</style>
