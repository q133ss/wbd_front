<template>
  <div
    :class="[
      'card',
      {
        'hover:shadow-xl/30': hover,
        'border border-gray-200': bordered,
        'p-8': padding === 'lg',
        'p-4': padding === 'sm',
      },
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  hover?: boolean
  bordered?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  hover: true,
  bordered: false,
  padding: 'md',
})
</script>