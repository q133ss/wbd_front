<script setup>
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import SelectSolid from '@images/svg/3d-select-solid.svg'
import Edit from '@images/svg/edit.svg'
import GoogleDocs from '@images/svg/google-docs.svg'
import LaptopCharging from '@images/svg/laptop-charging.svg'
import Lifebelt from '@images/svg/lifebelt.svg'
import TransitionUp from '@images/svg/transition-up.svg'

const featuresData = [
  {
    title: 'Только живые покупатели',
    desc: 'География ПВЗ по всей России делает продвижение органичным для алгоритмов WB.',
    img: LaptopCharging,
  },
  {
    title: 'Живые фото и видео в отзывах',
    desc: 'Повышайте конверсию карточки за счет живых отзывов с уникальными медиа отзывами.',
    img: TransitionUp,
  },
  {
    title: 'Автоматизация выкупов',
    desc: 'Настройте продвижение один раз и получайте выкупы и отзывы в полуавтоматическом режиме.',
    img: Edit,
  },
  {
    title: 'Антифрод система',
    desc: 'Умная система рейтинга, мониторинга, модерации спорных ситуаций.',
    img: SelectSolid,
  },
  {
    title: 'Оплата за результат',
    desc: 'Вы платите только за успешный выкуп, а не за размещение, как в Telegram.',
    img: Lifebelt,
  },
  {
    title: 'Оплата за результат',
    desc: 'Вы платите только за успешный выкуп, а не за размещение, как в Telegram.',
    img: GoogleDocs,
  },
]

const stats = {
  customers: 1039,
  customerIncrease: 30,
  sales: 320,
  salesIncrease: 23,
  ads: 3902,
  adsIncrease: 58,
  cashback: '100 493',
  cashbackIncrease: 5093,
}
</script>

<template>
  <VContainer id="features">
    <div class="feature-cards">

      <v-row>
        <v-col cols="12" sm="6" md="6" lg="3" style="border-right: 1px solid #00000080">
          <div class="text-center">
            <h6 class="feature-title">Покупателей</h6>
            <h2 class="text-primary fz-35">{{ stats.customers }}</h2>
            <p class="feature-footer-text">
              <span class="feature-count">
                +{{ stats.customerIncrease }}
              </span>
              за 24 часа
            </p>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="6" lg="3"  style="border-right: 1px solid #00000080">
          <div class="text-center">
            <h6 class="feature-title">Продавцов</h6>
            <h2 class="text-primary fz-35">{{ stats.sales }}</h2>
            <p class="feature-footer-text">
              <span class="feature-count">+{{ stats.salesIncrease }}</span> за час</p>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="6" lg="3"  style="border-right: 1px solid #00000080">
          <div class="text-center">
            <h6 class="feature-title">Объявлений</h6>
            <h2 class="text-primary fz-35">{{ stats.ads }}</h2>
            <p class="feature-footer-text"><span class="feature-count">+{{ stats.adsIncrease }}</span> за 24 часа</p>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="6" lg="3" >
          <div class="text-center">
            <h6 class="feature-title">Выплачено кэшбэка</h6>
            <h2 class="text-primary fz-35">{{ stats.cashback }} Р</h2>
            <p class="feature-footer-text"><span class="feature-count">+{{ stats.cashbackIncrease }}</span> за 24 часа</p>
          </div>
        </v-col>
      </v-row>

      <div class="text-center feature-text-block">
        <span class="feature-subheading">
          Все лучшее в одном месте:
        </span>
        <h3 class="feature-heading">
          Это как TG группы с кэшбеком за отзыв, только лучше:
        </h3>
        <span class="feature-subheading">
          Автоматизации, антифрод, статистика, аналитика - все то, чего вам не хватало при работе с телеграм группами
        </span>
      </div>

      <VRow>
        <VCol
          v-for="(data, index) in featuresData"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <div class="feature d-flex flex-column gap-y-2 align-center justify-center mt-2">
            <VAvatar
              variant="outlined"
              size="82"
              color="primary"
              class="mb-2"
            >
              <Component :is="data.img" />
            </VAvatar>

            <h5 class="text-h5">
              {{ data.title }}
            </h5>
            <p
              class="text-center text-medium-emphasis"
              style="max-inline-size: 360px;"
            >
              {{ data.desc }}
            </p>
          </div>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.feature-cards {
  margin-block-end: 4.25rem;
}

#features {
  padding-block-start: 13rem;
}

@media (max-width: 960px) {
  #features {
    padding-block-start: 6rem;
  }
}

@media (max-width: 600px) {
  #features {
    padding-block-start: 2rem;
  }
}
</style>

<style lang="scss" scoped>
.feature {
  .v-avatar {
    &.v-avatar--variant-outlined {
      border: 2px solid rgba(var(--v-theme-primary), 0.32);

      &:hover {
        background: rgba(var(--v-theme-primary), 0.16);
        cursor: pointer;
      }
    }
  }
}

.feature-title{
  font-size: 16px;
  font-weight: 600;
  color: #000000CC;
}

.fz-35{
  font-size: 35px;
  font-weight: 700;
}

.feature-footer-text{
  font-size: 10px;
  font-weight: 400;
  color: #00000099;
}

.feature-count{
  font-size: 16px;
  font-weight: 400;
  color: #7958D280;
}

.feature-text-block{
  margin-top: 150px;
  margin-bottom: 100px;
}

.feature-subheading{
  font-size: 20px;
  font-weight: 700;
  color: #33465A
}

.feature-heading{
  font-weight: 900;
  font-size: 30px;
  color: #7958D2;
}
</style>
