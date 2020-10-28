<template lang="pug">
.relative.border.rounded.bg-white.cursor-move.p-1
  AppSquare
    img.object-contain(
      :src="thumbnail",
      data-testid="thumbnail"
    )
    .bg-white.opacity-50.absolute.inset-0(
      v-if="image.active || image.success",
      data-testid="progress"
    )
      font-awesome-icon.position-center.fa-2x.text-black(
        :icon="progressIcon",
        :pulse="image.active"
      )
  .absolute.right-0.bottom-0.bg-white.rounded.text-center.text-sm.w-8.h-6 {{ num }}
  AppButton.remove-button.absolute.shadow.w-8.h-8(
    color="blue",
    size="sm",
    :icon="faTimes",
    :disabled="image.active || image.success",
    pill,
    @click.stop="$emit('remove')",
    data-testid="remove-button"
  )
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'
import { PropType } from '@vue/composition-api'
import { faTimes, faSpinner, faCheck } from '@fortawesome/free-solid-svg-icons'

import Image from '~/models/Image'
import AppSquare from '~/components/atoms/AppSquare.vue'
import AppButton from '~/components/atoms/AppButton.vue'

export default defineComponent({
  components: {
    AppSquare,
    AppButton
  },
  props: {
    image: {
      type: Object as PropType<VUFile|Image>,
      required: true
    },
    num: {
      type: Number,
      required: true
    }
  },
  setup (props) {
    const URL = window.URL || window.webkitURL

    const thumbnail = computed(() => {
      if (props.image instanceof Image) {
        return props.image.paths.small
      } else if (URL && URL.createObjectURL) {
        return URL.createObjectURL(props.image.file)
      }
      return null
    })

    const progressIcon = computed(() => {
      if (!(props.image instanceof Image)) {
        if (props.image.active) {
          return faSpinner
        }
        if (props.image.success) {
          return faCheck
        }
      }
      return null
    })

    return {
      thumbnail,
      faTimes,
      progressIcon
    }
  }
})
</script>

<style lang="postcss" scoped>
.remove-button {
  top: -1rem;
  right: -1rem;
}
</style>
