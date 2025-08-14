<template>
  <div
    :class="[
      'text-center',
      {
        'mb-16': !noMargin,
        'mb-8': compact,
      },
    ]"
  >
    <component
      :is="tag"
      :class="[
        'font-semibold text-gray-900 mb-4',
        titleClasses,
      ]"
    >
      {{ title }}
    </component>
    <p
      v-if="subtitle"
      :class="[
        'text-gray-600 max-w-3xl mx-auto',
        subtitleClasses,
      ]"
    >
      {{ subtitle }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  subtitle?: string
  tag?: 'h1' | 'h2' | 'h3' | 'h4'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  noMargin?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'h2',
  size: 'lg',
  noMargin: false,
  compact: false,
})

const titleClasses = computed(() => {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-h2',
    xl: 'text-h1',
  }
  return sizes[props.size]
})

const subtitleClasses = computed(() => {
  const sizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  }
  return sizes[props.size]
})
</script>
