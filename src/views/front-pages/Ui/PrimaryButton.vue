<template>
  <button
    :type="type"
    :class="[
      'btn-primary',
      {
        'opacity-50 cursor-not-allowed': disabled,
        'w-full': fullWidth,
      },
      sizeClasses,
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <component
      v-if="icon"
      :is="icon"
      :class="iconClasses"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  icon?: any
  iconPosition?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  disabled: false,
  fullWidth: false,
  size: 'md',
  iconPosition: 'left',
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }
  return sizes[props.size]
})

const iconClasses = computed(() => {
  const baseClasses = 'w-5 h-5'
  const positionClasses = {
    left: 'mr-2 -ml-1',
    right: 'ml-2 -mr-1',
  }
  return `${baseClasses} ${positionClasses[props.iconPosition]}`
})
</script>