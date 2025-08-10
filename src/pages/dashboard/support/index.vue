<script setup>
import { computed, ref } from 'vue'


definePage({
  meta: {
    authRequired: true,
  },
})

// FAQ data (replace with your actual FAQs)
// const faqs = ref([
//   {
//     question: 'Как пополнить баланс?',
//     answer: 'Для пополнения баланса перейдите на страницу "Баланс" в вашем дашборде, нажмите кнопку "Пополнить", введите сумму и следуйте инструкциям для оплаты.',
//   },
//   {
//     question: 'Что такое выкупы и как их использовать?',
//     answer: 'Выкупы — это количество доступных покупок с кэшбеком, которые вы можете предложить в объявлениях. Вы можете приобрести дополнительные выкупы на странице тарифов.',
//   },
//   {
//     question: 'Как создать объявление с кэшбеком?',
//     answer: 'Перейдите в раздел "Объявления", выберите товар и нажмите "Создать объявление". Укажите процент кэшбека, количество выкупов и другие параметры.',
//   },
//   {
//     question: 'Почему мой баланс заморожен?',
//     answer: 'Часть баланса может быть заморожена, если транзакции находятся на стадии подтверждения. Это временная мера, и средства станут доступны после завершения операций.',
//   },
//   {
//     question: 'Как связаться с поддержкой?',
//     answer: 'Вы можете написать нам в Telegram, нажав на кнопку ниже, или проверить популярные вопросы в этом разделе FAQ.',
//   },
// ])

const buyerFaqs = ref([
  {
    question: 'Как заказать товар??',
    answer: 
   `1. На главной странице выбрать нужный товар
    2. Нажать на карточку товара 
    3. Нажать «Заказать» (Перед заказом убедитесь что заполнили реквизиты для выплаты кэшбэка) 
    4. Появится чат с продавцом с инструкцией выкупа
    5. Провести выкуп на Wildberries по инструкции продавца
    6. Загрузить скриншот заказа и отправить в чат
    7. После успешного размещения отзыва продавец переводит кэшбэк по вашим реквизитам`,
  },
  {
    question: 'Как подключиться к Телеграм боту?',
    answer: 
   `1. В левом меню выбрать «Профиль»
    2. Навести телефон на QR-код 
    3. Нажать «Старт» в тг боте`,
  },
  {
    question: 'Как внести платежные данные для получения кэшбэка?',
    answer: 
   `1. В левом меню выбрать «Профиль»
    2. В разделе «Платежные данные для кэшбэка» внесите свои реквизиты`,
  },
  {
    question: 'Как связаться с поддержкой?',
    answer: 'Вы можете написать нам в Telegram, нажав на кнопку выше, или проверить популярные вопросы в этом разделе FAQ.',
  },
])

const sellerFaqs = ref([
  {
    question: 'Как добавить товар?',
    answer: 
   `1. В левом меню вкладка «Товары»
    2. Кнопка «Добавить товар» 
    3. Внести артикул товара с WB 
    4. Нажать галочку «Связанные товары, если хотите перенести все карточки в склейке»`,
  },
  {
    question: 'Как создать объявление на выкуп?',
    answer: 
   `1. Вкладка «Объявления»
    2. Кнопка «Создать объявление» 
    3. Выбрать товар из списка 
    4. Ввести название объявления, указать процент кэшбэка, выбрать цвет и размер товара, прописать условия и инструкцию выкупа, описать формат отзыва
    5. Установить количество выкупов по продвижению
    6. Нажать «Создать объявление» `,
  },
  {
    question: 'Где увидеть данные по партнерской программе??',
    answer: 'Нажмите на вкладку «Партнерам» и вы попадете на страницу партнерской программы, где сможете скопировать свою индивидуальную реферальную ссылку, а также отслеживать статистику по её использованию и вашему заработку. ',
  },
  {
    question: 'Как связаться с поддержкой?',
    answer: 'Вы можете написать нам в Telegram, нажав на кнопку выше, или проверить популярные вопросы в этом разделе FAQ.',
  },
])

const questFaq = computed(()=> {
  const userData = useCookie('userData')
  const role = userData?.value?.role?.slug

  if (role) {
    return role === 'seller' ? sellerFaqs : buyerFaqs
  }

  return buyerFaqs
})
</script>

<template>
  <div class="support-container">
    <div class="content-wrapper">
      <h1 class="text-h4 mb-4">
        Появились вопросы?
      </h1>
      <p class="text-body-1 mb-8">
        Посмотрите популярные вопросы в FAQ или свяжитесь с нами в Telegram и мы оперативно поможем решить вашу проблему!
      </p>

      <!-- Telegram Contact Button -->
      <div class="mb-8">
        <VBtn
          color="primary"
          href="https://t.me/WBDiscountPro"
          target="_blank"
          rel="noopener noreferrer"
          prepend-icon="ri-telegram-fill"
          size="large"
        >
          Связаться в Telegram
        </VBtn>
      </div>

      <!-- FAQ Section -->
      <div class="faq-box">
        <h2 class="text-h5 mb-4">
          Часто задаваемые вопросы
        </h2>
        <VExpansionPanels>
          <VExpansionPanel
            v-for="(faq, index) in questFaq.value"
            :key="index"
            class="mb-2"
          >
            <VExpansionPanelTitle>
              {{ faq.question }}
            </VExpansionPanelTitle>
            <VExpansionPanelText style="white-space: pre-line">
              {{ faq.answer }}
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
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
  border-radius: 8px;
}

:deep(.v-btn) {
  text-transform: none;
  letter-spacing: normal;
}

:deep(.v-expansion-panel) {
  border-radius: 4px;
}

:deep(.v-expansion-panel-title) {
  font-weight: 500;
}
</style>
