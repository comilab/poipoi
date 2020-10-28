<template lang="pug">
.inline-block
  .zoomable-area.relative(
    @click="zoomed = true",
    data-testid="zoomable-area"
  )
    img.select-none.pointer-events-none(
      :src="src",
      :class="imgClass",
      data-testid="zoomable-area-img"
    )
    .caution.absolute.right-0.bottom-0.text-white.text-xs.p-2 無断転載禁止

  transition(
    enter-class="opacity-0",
    leave-to-class="opacity-0"
  )
    .zoomed-area.flex.fixed.inset-0.overflow-auto.bg-white.bg-opacity-75.z-50.transition-opacity.duration-300(
      v-if="zoomed",
      @click="zoomed = false",
      data-testid="zoomed-area"
    )
      .m-auto
        img.max-w-none.select-none.pointer-events-none.p-4(
          :src="largeSrc"
        )
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'nuxt-composition-api'

import { prop as classProp } from '~/composables/use-class-prop'

export default defineComponent({
  props: {
    src: {
      type: String,
      required: true
    },
    largeSrc: {
      type: String,
      required: true
    },
    imgClass: {
      ...classProp
    }
  },
  setup () {
    const localState = reactive({
      zoomed: false
    })

    return {
      ...toRefs(localState)
    }
  }
})
</script>

<style lang="postcss" scoped>
.zoomable-area {
  cursor: zoom-in;
}

.zoomed-area {
  cursor: zoom-out;
}

.caution {
  text-shadow: 0 0 5px #000;
}
</style>
