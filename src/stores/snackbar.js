import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    show: false,
    text: '',
    color: 'success',
    timeout: 4000
  }),
  actions: {
    notify({ text, color = 'success', timeout = 4000 }) {
      this.text = text
      this.color = color
      this.timeout = timeout
      this.show = true
    },
    error(message) {
      this.notify({ text: message, color: 'error' })
    }
  }
})
