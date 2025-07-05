<script setup>
import sittingGirlWithLaptop from '@images/front-pages/landing-page/sitting-girl-with-laptop.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageElement from '@images/svg/front-page-element.svg'

const faqData = [
  {
    question: 'Как начать продвижение товара?',
    answer: 'Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping. Sesame snaps icing marzipan gummi bears macaroon dragée danish caramels powder. Bear claw dragée pastry topping soufflé. Wafer gummi bears marshmallow pastry pie.',
  },
  {
    question: 'А что если покупатель в процессе сделки обманет меня?',
    answer: 'Regular license can be used for end products that do not charge users for access or service(access is free and there will be no monthly subscription fee). Single regular license can be used for single end product and end product can be used by you or your client. If you want to sell end product to multiple clients then you will need to purchase separate license for each client. The same rule applies if you want to use the same end product on multiple domains(unique setup). For more info on regular license you can check official description.',
  },
  {
    question: 'Как быстро происходит продвижение товара?',
    answer: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis et aliquid quaerat possimus maxime! Mollitia reprehenderit neque repellat deleniti delectus architecto dolorum maxime, blanditiis earum ea, incidunt quam possimus cumque.',
  },
  {
    question: 'Как выплачивать кэшбек?',
    answer: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sequi molestias exercitationem ab cum nemo facere voluptates veritatis quia, eveniet veniam at et repudiandae mollitia ipsam quasi labore enim architecto non!',
  },
  {
    question: 'Не хочу настраивать сам, поможете?',
    answer: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sequi molestias exercitationem ab cum nemo facere voluptates veritatis quia, eveniet veniam at et repudiandae mollitia ipsam quasi labore enim architecto non!',
  }
]
</script>

<template>
  <hr style="margin-top: 100px">
  <VContainer id="faq">
    <!-- 👉 Header  -->
    <div class="faq-section">
      <div class="text-center feature-text-block">
        <span class="feature-subheading">
          FAQ
        </span>
        <h3 class="feature-heading">
          Отвечаем на популярные вопросы
        </h3>
        <span class="feature-subheading">
        Приобретайте выкупы с выгодой до 20%
    </span>
      </div>

      <div
        class="d-flex align-center justify-space-between flex-wrap flex-md-nowrap pb-4"
        style="gap: 6.25rem;"
      >
        <VImg
          :src="sittingGirlWithLaptop"
          height="340"
          width="320"
          class="flip-in-rtl"
        />

        <div>
          <VExpansionPanels class="py-4">
            <VExpansionPanel
              v-for="faq in faqData"
              :key="faq.question"
            >
              <VExpansionPanelTitle>
                {{ faq.question }}
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                {{ faq.answer }}
              </VExpansionPanelText>
            </VExpansionPanel>
          </VExpansionPanels>
        </div>
      </div>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.faq-section {
  position: relative;
  margin-block: 5.25rem 4.25rem;
}

.front-page-element {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
}
</style>
