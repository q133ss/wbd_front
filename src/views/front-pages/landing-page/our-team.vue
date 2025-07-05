<script setup>
import teamPerson1 from '@images/front-pages/landing-page/team-member-1.png'
import teamPerson2 from '@images/front-pages/landing-page/team-member-2.png'
import teamPerson3 from '@images/front-pages/landing-page/team-member-3.png'
import teamPerson4 from '@images/front-pages/landing-page/team-member-4.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageElement from '@images/svg/front-page-element.svg'

const teamData = ref([
  {
    name: 'Sophie Gilbert',
    position: 'Project Manager',
    image: teamPerson1,
    backgroundColor: 'rgba(144, 85, 253, 0.16)',
    borderColor: 'rgba(144, 85, 253,0.38)',
    isHover: false,
  },
  {
    name: 'Nannie Ford',
    position: 'Development Lead',
    image: teamPerson2,
    backgroundColor: 'rgba(255, 76, 81, 0.16)',
    borderColor: 'rgba(255, 76, 81,0.38)',
    isHover: false,
  },
  {
    name: 'Chris Watkins',
    position: 'Marketing Manager',
    image: teamPerson3,
    backgroundColor: 'rgba(86, 202, 0, 0.16)',
    borderColor: 'rgba(86, 202, 0,0.38)',
    isHover: false,
  },
  {
    name: 'Paul Miles',
    position: 'UI Designer',
    image: teamPerson4,
    backgroundColor: 'rgba(22, 177, 255, 0.16)',
    borderColor: 'rgba(22, 177, 255,0.38)',
    isHover: false,
  },
])

const statData = ref([
  {
    title: 'Загрузите товар по артикулу, укажите размер кэшбека, ключевые слова для поиска и критерии к отзыву',
    value: 'Выложите объявление',
    icon: 'ri-layout-line',
    color: 'primary',
    isHover: false,
  },
  {
    title: 'Полная автоматизация. Вам остается только проверять фотографии которые отправляют покупатели',
    value: 'Получайте заявки от покупателей',
    icon: 'ri-time-line',
    color: 'success',
    isHover: false,
  },
  {
    title: 'Отпраляйте кэшбек только тем покупателям, которые полностью выполнили все условия выкупа с отзывом',
    value: 'Выплачивайте кэшбек',
    icon: 'ri-user-smile-line',
    color: 'warning',
    isHover: false,
  }
])
</script>

<template>
  <hr>
  <VContainer id="team">
    <div class="text-center step-headers">
      <h3 class="feature-heading">
        Сделай 1-2-3 и получи результат
      </h3>
    </div>


    <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
      <VContainer>
        <div class="py-12">
          <VRow>
            <VCol
              v-for="(product, index) in statData"
              :key="index"
            >
              <VCard flat>
                <VCardText class="text-center">
                  <VAvatar
                    size="82"
                    :color="product.color"
                    :variant="product.isHover ? 'elevated' : 'tonal'"
                    class="mb-6 cursor-pointer"
                    @mouseenter="() => product.isHover = true"
                    @mouseleave="product.isHover = false"
                  >
                    <VIcon
                      :icon="product.icon"
                      size="42"
                    />
                  </VAvatar>
                  <div class="product-stat-text">
                    {{ product.value}}
                  </div>
                  <div class="text-body-1 font-weight-medium product-stat-title mt-2">
                    {{ product.title }}
                  </div>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </div>
      </VContainer>
    </div>

  </VContainer>
</template>

<style lang="scss" scoped>
.team-image {
  position: absolute;
  inset-block-start: -3.4rem;
  inset-inline: 0;
}

.headers {
  margin-block-end: 1.25rem;
}

.our-team {
  position: relative;
  margin-block: 5.25rem;
}

.front-page-element {
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
}

.product-stat-text {
  color: #33465A;
  font-size: 20px;
  font-weight: 700;
}

.product-stat-title{
  font-size: 15px;
  font-weight: 700;
  color: #33465A;
}

.step-headers{
  margin-top: 50px;
  margin-bottom: 0;
}
</style>
