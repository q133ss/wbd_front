<script setup>
const userData = useCookie('userData')

definePage({
  meta: {
    authRequired: true,
  },
})
</script>

<template>
<h1>Профиль!!</h1>
<p>Привет, {{ userData }}!</p>
</template>

<style scoped lang="scss">

</style>
