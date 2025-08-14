<template>
  <section
    id="faq"
    class="py-16"
  >
    <VContainer>
      <SectionTitle
        title="Часто задаваемые вопросы"
        subtitle="Ответы на самые популярные вопросы о WBdiscount"
        class="mb-10"
      />

      <VExpansionPanels multiple>
        <VExpansionPanel
          v-for="(item, index) in faqItems"
          :key="index"
        >
          <VExpansionPanelTitle class="d-flex justify-space-between align-center">
            <span class="text-body-1 font-weight-medium">{{ item.question }}</span>
          </VExpansionPanelTitle>

          <VExpansionPanelText>
            <div class="text-body-1 text--secondary">
              {{ item.answer }}
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>

      <div class="text-center mt-12">
        <p class="text-body-1 text--secondary mb-2">
          Не нашли ответ на свой вопрос?
        </p>
        <VBtn
          color="primary"
          size="large"
          class="text-none"
          href="https://t.me/WBDiscountPro"
          target="_blank"
        >
          Связаться с поддержкой
        </VBtn>
      </div>
    </VContainer>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import SectionTitle from '../Ui/SectionTitle.vue'

const faqItems = [
  {
    question: 'Как начать продвижение товара?',
    answer: 'Зарегистрируйтесь на платформе, выберите подходящий тариф, добавьте товар и создайте объявление с указанияем размера кэшбэка и требований к отзыву. После публикации ваше объявление станет доступно покупателям.',
  },
  {
    question: 'А что если покупатель в процессе сделки обманет меня?',
    answer: 'У нас работает система антифрод с рейтингом покупателей и модерации спорных ситуаций. Вы платите кэшбэк только после получения подтверждения выполнения всех условий. В случае нарушений покупатель получает негативный рейтинг или блокировку аккаунта.',
  },
  {
    question: 'Как быстро происходит продвижение товара?',
    answer: 'Скорость зависит от размера кэшбэка (чем выше кэшбэк, тем больше покупателей) и популярности категории товара. В среднем первые выкупы начинаются в течение первых часов после публикации объявления.',
  },
  {
    question: 'Как выплачивать кэшбэк?',
    answer: 'На текущем этапе кэшбэк выплачивается вручную переводом от продавца покупателю по реквизитам в чате выкупа. Мы работаем над автоматизацией платежей и скоро добавим этот модуль.',
  },
  {
    question: 'Не хочу настраивать сам, поможете?',
    answer: 'Конечно! Наша команда поддержки поможет вам с настройкой первого объявления. Клиенты тарифа Superstar получают персонального менеджера, который возьмет на себя всю настройку и ведение кампаний.',
  },
]

// Отслеживание открытых панелей для анимации иконки
const panelOpen = reactive(faqItems.map(() => false))
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.3s ease;
}
</style>
