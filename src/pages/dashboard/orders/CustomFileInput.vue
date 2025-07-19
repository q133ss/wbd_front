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
    class="mb-2"
    @click:clear="barcodeFile = null"
  />

  <!-- Если файла нет — кастомный блок -->
  <div
    v-else
    class="d-flex justify-center align-center gap-2 border rounded-lg py-2 cursor-pointer"
    @click="triggerFileInput"
  >
    <VIcon size="28">
      ri-upload-cloud-2-line
    </VIcon>
    <span class="upload-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.upload-label {
  font-size: 16px;
}
</style>
