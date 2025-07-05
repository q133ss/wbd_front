<script setup>
import ConnectImg from '@images/front-pages/landing-page/lets-contact.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageVectorImg from '@images/svg/front-page-vector.svg'

const name = ref('')
const email = ref('')
const message = ref('')
</script>

<template>
  <VContainer id="contact-us">
    <!-- 👉 Headers  -->
    <div class="contact-us-section">

      <div class="text-center feature-text-block">
        <span class="feature-subheading">
          Обратная связь
        </span>
        <h3 class="feature-heading">
          Свяжитесь с нами
        </h3>
        <span class="feature-subheading">
        Остались вопросы по работе сервиса или хотите предложить идею или сотрудничество?
      </span>
      </div>

      <div class="mb-15">
        <VRow class="match-height">
          <VCol
            cols="12"
            md="4"
            sm="6"
          >
            <VCard
              flat
              elevation="0"
              color="primary"
              theme="dark"
            >
              <VCardText class="pa-8">
                <h6 class="text-h6 mb-1">
                  Напишите нам
                </h6>

                <h4 class="text-h4">
                  Остались вопросы?
                  Наша команда поддержки ответит вам!
                </h4>

                <VImg
                  :src="ConnectImg"
                  class="my-5"
                />

                <div class="text-body-1">
                  Хотите предложить сотрудничество? Предложить идею? Узнать информацию о работе сервиса? Свяжитесь с нами и получите ответ в течение 24 часов
                </div>
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            md="8"
            sm="6"
          >
            <VCard>
              <VCardText>
                <div class="text-h5 mb-5">
                  Форма обратной связи
                </div>
                <VForm @submit.prevent="() => {}">
                  <VRow>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="name"
                        placeholder="Иван Иванов"
                        label="Имя"
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="email"
                        placeholder="mail@email.ru"
                        label="Email"
                      />
                    </VCol>

                    <VCol cols="12">
                      <VTextarea
                        v-model="message"
                        placeholder="Введите ваше сообщение"
                        label="Сообщение"
                      />
                    </VCol>

                    <VCol>
                      <VBtn type="submit">
                        Отправить
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.contact-us-section {
  position: relative;
  margin-block: 5.25rem;
}

.front-page-vector {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
}
</style>
