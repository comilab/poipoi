<template lang="pug">
transition(
  enter-class="opacity-0",
  leave-to-class="opacity-0"
)
  .fixed.inset-0.bg-black.bg-opacity-75.z-50.translate-opacity.duration-300(
    v-if="innerValue",
    @click.self="!persistent && close()",
    data-testid="overlay"
  )
    .position-center.bg-white.rounded.max-w-screen-md.max-h-90.p-4
      AppButton.absolute.top-0.right-0.-mx-4.-my-4.shadow(
        v-if="!persistent",
        color="blue",
        size="sm",
        :icon="faTimes",
        pill,
        @click="close",
        aria-label="close",
        data-testid="close-button"
      )
      .overflow-auto(data-testid="content")
        slot(:close="close")
</template>

<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import useVModel from '~/composables/use-v-model'
import AppButton from '~/components/atoms/AppButton.vue'

export default defineComponent({
  components: {
    AppButton
  },
  props: {
    value: {
      type: Boolean,
      required: false,
      default: false
    },
    persistent: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup (props, { emit }) {
    const { innerValue } = useVModel(props, emit)

    const open = () => {
      innerValue.value = true
      emit('opened')
    }

    const close = () => {
      innerValue.value = false
      emit('closed')
    }

    return {
      innerValue,
      open,
      close,
      faTimes
    }
  }
})
</script>
