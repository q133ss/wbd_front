<template>
  <span
    :class="[
      'badge',
      variantClasses,
      sizeClasses,
    ]"
  >
    <component
      v-if="icon"
      :is="icon"
      class="w-4 h-4 mr-1"
    />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  icon?: any
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }
  return sizes[props.size]
})
</script>