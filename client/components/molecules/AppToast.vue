<template lang="pug">
transition(
  enter-class="opacity-0",
  leave-to-class="opacity-0"
)
  .relative.flex.items-start.w-64.text-sm.text-white.text-opacity-75.rounded.shadow.translate-opacity.duration-300.p-4(
    v-if="isVisible"
    :class="wrapperClass"
  )
    font-awesome-icon.fa-2x.fa-fw(
      :icon="icon",
      :class="iconClass"
    )
    .flex-auto.mx-2
      slot {{ message }}
    button.cursor-pointer.focus_outline-none(
      type="button",
      @click="close"
    )
      font-awesome-icon(:icon="faTimes")
</template>

<script lang="ts">
import { defineComponent, computed, reactive, toRefs } from 'nuxt-composition-api'
import { PropType } from '@vue/composition-api'
import { faTimes, faCheck, faInfoCircle, faExclamationTriangle, faBan } from '@fortawesome/free-solid-svg-icons'

import { Toast } from '~/store/toast'
import AppButton from '~/components/atoms/AppButton.vue'

export default defineComponent({
  components: {
    AppButton
  },
  props: {
    message: {
      type: String,
      required: false,
      default: null
    },
    type: {
      type: String as PropType<Toast['type']>,
      required: true
    }
  },
  setup (props, { emit }) {
    const localState = reactive({
      isVisible: true
    })

    const wrapperClass = computed(() => {
      const classes = []
      if (props.type === 'success') {
        classes.push('bg-teal-900')
      } else if (props.type === 'info') {
        classes.push('bg-blue-900')
      } else if (props.type === 'warning') {
        classes.push('bg-yellow-900')
      } else if (props.type === 'danger') {
        classes.push('bg-red-900')
      }
      return classes
    })

    const icon = computed(() => {
      if (props.type === 'success') {
        return faCheck
      } else if (props.type === 'info') {
        return faInfoCircle
      } else if (props.type === 'warning') {
        return faExclamationTriangle
      } else if (props.type === 'danger') {
        return faBan
      }
    })

    const iconClass = computed(() => {
      const classes = []
      if (props.type === 'success') {
        classes.push('text-teal-600')
      } else if (props.type === 'info') {
        classes.push('text-blue-600')
      } else if (props.type === 'warning') {
        classes.push('text-yellow-600')
      } else if (props.type === 'danger') {
        classes.push('text-red-600')
      }
      return classes
    })

    const close = () => {
      localState.isVisible = false
      emit('closed')
    }

    return {
      ...toRefs(localState),
      wrapperClass,
      icon,
      iconClass,
      close,
      faTimes
    }
  }
})
</script>
