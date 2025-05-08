<template>
  <div class="h-100 d-flex align-center justify-space-between text-medium-emphasis">
    <!-- 👉 Footer: left content -->
    <div class="d-flex align-center text-base">
      &copy;
      {{ new Date().getFullYear() }},
      Все права защищены
    </div>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a
        href="/terms"
        target="noopener noreferrer"
      >Пользовательское соглашение</a>
      <a
        href="/privacy"
        target="noopener noreferrer"
      >Политика конфидициальности</a>
      <a
        href="/dashboard/support"
        target="noopener noreferrer"
      >Поддержка</a>
    </span>
  </div>
</template>
