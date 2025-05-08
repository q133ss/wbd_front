<script setup>
const userData = useCookie('userData')

definePage({
  meta: {
    authRequired: true,
  },
})
</script>

<template>
<VCard>
  <VImg
    src="/src/assets/images/pages/user-profile-header-bg.png"
    min-height="125"
    max-height="250"
    cover
  />

  <VCardText class="d-flex align-bottom flex-sm-row flex-column justify-center gap-x-6">
    <div class="d-flex h-0">
      <VAvatar
        rounded
        color="primary"
        size="130"
        class="user-profile-avatar mx-auto"
      >
        <span class="text-lg">{{ userData.shop.wb_name.slice(0, 2).toUpperCase() }}</span>
      </VAvatar>
    </div>

    <div class="user-profile-info w-100 mt-16 pt-6 pt-sm-0 mt-sm-0">
      <h4 class="text-h4 text-center text-sm-start mb-2">
        {{ userData.shop.wb_name }}

        <VDialog
          v-model="isDialogVisible"
          width="500"
        >
          <!-- Activator -->
          <template #activator="{ props }">
            <VBtn v-bind="props" variant="text" color="primary" class="details-btn">
              <VIcon
                size="20"
                icon="ri-question-line"
              />
            </VBtn>
          </template>

          <!-- Dialog Content -->
          <VCard title="Информация о продавце">
            <DialogCloseBtn
              variant="text"
              size="default"
              @click="isDialogVisible = false"
            />

            <VCardText>
              <VList :items="['ИНН: '+userData.shop.inn, 'Юр.лицо: '+userData.shop.legal_name]" />
            </VCardText>
          </VCard>
        </VDialog>
      </h4>

      <div class="d-flex align-center justify-center justify-sm-space-between flex-wrap gap-6">
        <div class="d-flex flex-wrap justify-center justify-sm-start flex-grow-1 gap-6">
          <div class="d-flex align-center gap-x-2">
            <VIcon
              size="24"
              icon="ri-id-card-line"
            />
            <div class="text-body-1 font-weight-medium">
              ID: {{ userData.id }}
            </div>
          </div>

          <div class="d-flex align-center gap-x-2">
            <VIcon
              size="24"
              icon="ri-star-line"
            />
            <div class="text-body-1 font-weight-medium">
              Рейтинг: {{ userData.rating }}
            </div>
          </div>

          <div class="d-flex align-center gap-x-2">
            <VIcon
              size="24"
              icon="ri-calendar-line"
            />
            <div class="text-body-1 font-weight-medium">
              Дата регистрации: {{ formatDate(userData.shop.created_at) }}
            </div>
          </div>
        </div>

        <VBtn prepend-icon="ri-user-follow-line">
          Страница на wildberries
        </VBtn>
      </div>
    </div>
  </VCardText>
</VCard>
</template>

<style scoped lang="scss">

</style>
