<script setup>
const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    required: true,
  },
  searchResults: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'update:isDialogVisible',
  'search',
])


// 👉 Hotkey

// eslint-disable-next-line camelcase
const { ctrl_k, meta_k } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 'k' && e.type === 'keydown')
      e.preventDefault()
  },
})

const refSearchList = ref()
const refSearchInput = ref()
const searchQueryLocal = ref('')

// 👉 watching control + / to open dialog

/* eslint-disable camelcase */
watch([
  ctrl_k,
  meta_k,
], () => {
  emit('update:isDialogVisible', true)
})

/* eslint-enable */

// 👉 clear search result and close the dialog
const clearSearchAndCloseDialog = () => {
  searchQueryLocal.value = ''
  emit('update:isDialogVisible', false)
}

const getFocusOnSearchList = e => {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    refSearchList.value?.focus('next')
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    refSearchList.value?.focus('prev')
  }
}

const dialogModelValueUpdate = val => {
  searchQueryLocal.value = ''
  emit('update:isDialogVisible', val)
}

watch(() => props.isDialogVisible, () => {
  searchQueryLocal.value = ''
})
</script>

<template>
  <VDialog
    max-width="600"
    :model-value="props.isDialogVisible"
    :height="$vuetify.display.smAndUp ? '65' : '100%'"
    :fullscreen="$vuetify.display.width < 600"
    class="app-bar-search-dialog"
    @update:model-value="dialogModelValueUpdate"
    @keyup.esc="clearSearchAndCloseDialog"
  >
    <VCard
      height="100%"
      width="100%"
      class="position-relative"
    >
      <VCardText class="py-3 px-4">
        <!-- 👉 Search Input -->
        <VTextField
          ref="refSearchInput"
          v-model="searchQueryLocal"
          autofocus
          density="compact"
          variant="plain"
          class="app-bar-search-input"
          @keyup.esc="clearSearchAndCloseDialog"
          @keydown="getFocusOnSearchList"
          @update:model-value="$emit('search', searchQueryLocal)"
        >
          <!-- 👉 Prepend Inner -->
          <template #prepend-inner>
            <div class="d-flex align-center text-high-emphasis me-1">
              <VIcon
                size="24"
                icon="ri-search-line"
                style="opacity: 1;"
              />
            </div>
          </template>

          <!-- 👉 Append Inner -->
          <template #append-inner>
            <div class="d-flex align-start">
              <div
                class="text-base text-disabled cursor-pointer me-2"
                @click="clearSearchAndCloseDialog"
              >
                [esc]
              </div>

              <IconBtn
                class="mt-n2"
                color="medium-emphasis"
                @click="clearSearchAndCloseDialog"
              >
                <VIcon icon="ri-close-line" />
              </IconBtn>
            </div>
          </template>
        </VTextField>
      </VCardText>

      <!-- 👉 Divider -->
      <VDivider />
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.app-bar-search-suggestions {
  .app-bar-search-suggestion {
    &:hover {
      color: rgb(var(--v-theme-primary));
    }
  }
}

.app-bar-search-dialog {
  .app-bar-search-input {
    .v-field__input {
      margin-block-start: -1px;
      padding-block-start: 0.2rem;
    }
  }

  .v-overlay__scrim {
    backdrop-filter: blur(4px);
  }

  .app-bar-search-list {
    .v-list-item,
    .v-list-subheader {
      font-size: 0.75rem;
      padding-inline: 1rem;
    }

    .v-list-item {
      .v-list-item__append {
        .enter-icon {
          visibility: hidden;
        }
      }

      &:hover,
      &:active,
      &:focus {
        .v-list-item__append {
          .enter-icon {
            visibility: visible;
          }
        }
      }
    }

    .v-list-subheader {
      line-height: 1;
      min-block-size: auto;
      padding-block: 16px 8px;
      padding-inline-start: 1rem;
      text-transform: uppercase;
    }
  }
}

@supports selector(:focus-visible) {
  .app-bar-search-dialog {
    .v-list-item:focus-visible::after {
      content: none;
    }
  }
}
</style>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 16px;
}
</style>
