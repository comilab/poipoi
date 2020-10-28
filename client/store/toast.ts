import { reactive, toRefs } from 'nuxt-composition-api'

export type Toast = {
  type: 'success'|'info'|'warning'|'danger'
  message: string
  timeout?: number
}

export default function toastStore () {
  const state = reactive({
    toasts: [] as Toast[]
  })

  function push ({ type, message, timeout = 5000 }: Toast) {
    const toast = {
      type,
      message,
      timeout
    }
    state.toasts.push(toast)
    if (timeout) {
      setTimeout(() => {
        remove(toast)
      }, timeout)
    }
  }

  function remove (toast: Toast) {
    const index = state.toasts.findIndex(t => t === toast)
    if (index >= 0) {
      state.toasts.splice(index, 1)
    }
  }

  return {
    ...toRefs(state),
    push,
    remove
  }
}
