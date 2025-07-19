import { useChatStore } from './chat'
import { ref } from 'vue'

export const useTimer = () => {
  const chatStore = useChatStore()
  const timer = ref('')
  const timerInterval = ref(null)

  const updateStatusTimer = () => {
    if (timerInterval.value) clearInterval(timerInterval.value)
    timer.value = ''
    if (!chatStore.activeChat) return

    const status = chatStore.activeChat.status
    if (!['pending', 'awaiting_receipt', 'on_confirmation'].includes(status)) return

    const startTime = chatStore.activeChat.updated_at || chatStore.activeChat.created_at
    const start = new Date(startTime).getTime()
    if (isNaN(start)) return

    const durations = {
      pending: 30 * 60 * 1000,
      awaiting_receipt: 10 * 24 * 60 * 60 * 1000,
      on_confirmation: 24 * 60 * 60 * 1000,
    }

    const duration = durations[status]

    const update = () => {
      const remaining = start + duration - Date.now()
      if (remaining <= 0) {
        timer.value = 'Истек'
        clearInterval(timerInterval.value)
        
        return
      }
      const seconds = Math.floor((remaining / 1000) % 60)
      const minutes = Math.floor((remaining / (1000 * 60)) % 60)
      const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)
      const days = Math.floor(remaining / (1000 * 60 * 60 * 24))

      timer.value =
        days > 0
          ? `${days} д : ${hours} ч : ${minutes} м`
          : hours > 0
            ? `${hours} ч : ${minutes} м : ${seconds} с`
            : `${minutes} : ${seconds} `
    }

    update()
    timerInterval.value = setInterval(update, 1000)
  }

  return { updateStatusTimer, timer, timerInterval }
}
