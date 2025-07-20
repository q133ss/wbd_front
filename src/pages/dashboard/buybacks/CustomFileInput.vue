<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: File || null,
  label: {
    type: String,
    default: 'Загрузить',
  },
  pending: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const barcodeFile = ref(props.modelValue || null)
const fileInputEl = ref(null)

watch(() => props.modelValue, val => {
  barcodeFile.value = val
})

watch(barcodeFile, val => {
  emit('update:modelValue', val)
})

function triggerFileInput() {
  fileInputEl.value?.click()
}

function handleFileChange(e) {
  const file = e.target.files?.[0] || null

  barcodeFile.value = file
}
</script>

<template>
  <!-- Скрытый input -->
  <input
    ref="fileInputEl"
    type="file"
    accept=".jpeg,.png,.jpg,.gif"
    style="display: none"
    @change="handleFileChange"
  >

  <!-- Если файл есть — показываем VFileInput -->
  <VFileInput
    v-if="barcodeFile"
    v-model="barcodeFile"
    :label="pending ? '' : label"
    accept=".jpeg,.png,.jpg,.gif"
    variant="outlined"
    show-size
    prepend-icon=""
    prepend-inner-icon="ri-file-3-line"
    class="mb-2 text-body-3"
    @click:clear="barcodeFile = null"
  >
    <template #selection="{ fileNames }">
      <div class="text-left">
        <p
          style="font-size: 10px; line-height: 1.4; max-width: 220px;"
          class="text-no-wrap text-truncate ma-0"
        >
          {{ fileNames[0] }}
        </p>

        <p
          v-if="barcodeFile"
          style="font-size: 10px; line-height: 1.4"
          class="text-no-wrap ma-0"          
        >
          ({{ (barcodeFile.size / 1024).toFixed(1) }} KB)
        </p>
      </div>
    </template>
  </VFileInput>

  <!-- Если файла нет — кастомный блок -->
  <div
    v-else
    class="d-flex justify-center align-center gap-2 rounded-lg py-2 cursor-pointer"
    style="border: 2px solid rgb(var(--v-theme-primary))"
    @click="triggerFileInput"
  >
    <VIcon
      size="20"
      color="primary"
    >
      ri-upload-cloud-2-line
    </VIcon>
    <span class="upload-label text-primary">{{ label }}</span>
  </div>
</template>

<style scoped>
:deep(.v-file-input .v-file-input__text) {
  font-size: 10px !important;
  line-height: 1.4;
}

.upload-label {
  font-size: 14px;
}
</style>
