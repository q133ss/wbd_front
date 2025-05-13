<script setup>
import { ref } from 'vue'

// FAQ data (replace with your actual FAQs)
const faqs = ref([
  {
    question: 'Как пополнить баланс?',
    answer: 'Для пополнения баланса перейдите на страницу "Баланс" в вашем дашборде, нажмите кнопку "Пополнить", введите сумму и следуйте инструкциям для оплаты.'
  },
  {
    question: 'Что такое выкупы и как их использовать?',
    answer: 'Выкупы — это количество доступных покупок с кэшбеком, которые вы можете предложить в объявлениях. Вы можете приобрести дополнительные выкупы на странице тарифов.'
  },
  {
    question: 'Как создать объявление с кэшбеком?',
    answer: 'Перейдите в раздел "Объявления", выберите товар и нажмите "Создать объявление". Укажите процент кэшбека, количество выкупов и другие параметры.'
  },
  {
    question: 'Почему мой баланс заморожен?',
    answer: 'Часть баланса может быть заморожена, если транзакции находятся на стадии подтверждения. Это временная мера, и средства станут доступны после завершения операций.'
  },
  {
    question: 'Как связаться с поддержкой?',
    answer: 'Вы можете написать нам в Telegram, нажав на кнопку ниже, или проверить популярные вопросы в этом разделе FAQ.'
  }
])
</script>

<template>
  <div class="support-container">
    <div class="content-wrapper">
      <h1 class="text-h4 mb-4">Появились вопросы?</h1>
      <p class="text-body-1 mb-8">
        Посмотрите популярные вопросы в FAQ или свяжитесь с нами в Telegram и мы оперативно поможем решить вашу проблему!
      </p>

      <!-- Telegram Contact Button -->
      <div class="mb-8">
        <v-btn
          color="primary"
          href="https://t.me/your_support_channel"
          target="_blank"
          prepend-icon="ri-telegram-fill"
          size="large"
        >
          Связаться в Telegram
        </v-btn>
      </div>

      <!-- FAQ Section -->
      <div class="faq-box pa-6">
        <h2 class="text-h5 mb-4">Часто задаваемые вопросы</h2>
        <v-expansion-panels>
          <v-expansion-panel
            v-for="(faq, index) in faqs"
            :key="index"
            class="mb-2"
          >
            <v-expansion-panel-title>
              {{ faq.question }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              {{ faq.answer }}
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.support-container {
  padding: 24px;
}

.content-wrapper {
  max-width: 800px;
  margin-left: 0;
}

.faq-box {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

:deep(.v-expansion-panel) {
  background-color: #f5f5f5;
  border-radius: 4px;
}

:deep(.v-expansion-panel-title) {
  font-weight: 500;
  color: #333;
}

:deep(.v-expansion-panel-text) {
  color: #555;
}
</style>
