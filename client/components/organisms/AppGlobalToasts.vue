<template lang="pug">
.fixed.bottom-0.right-0.m-4
  AppToast.mt-4(
    v-for="(toast, i) in toasts",
    :key="i",
    :type="toast.type",
    @closed="onClosed(toast)"
  )
    div(v-html="toast.message")
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'

import { useStore } from '~/store'
import { Toast } from '~/store/toast'
import AppToast from '~/components/molecules/AppToast.vue'

export default defineComponent({
  components: {
    AppToast
  },
  setup () {
    const store = useStore()

    const toasts = computed(() => {
      return store.toast.toasts.value.reverse()
    })

    const onClosed = (toast: Toast) => {
      store.toast.remove(toast)
    }

    return {
      toasts,
      onClosed
    }
  }
})
</script>
