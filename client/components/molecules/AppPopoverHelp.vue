<template lang="pug">
VPopover.inline-block(
  placement="top",
  trigger="click hover",
  v-bind="$attrs",
  :popper-options="popperOptions"
)
  AppButtonHelp.text-blue-600.cursor-pointer.focus_outline-none.ml-2
  template(#popover)
    .text-sm
      slot
</template>

<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'
import { VPopover } from 'v-tooltip'

import AppButtonHelp from '~/components/atoms/AppButtonHelp.vue'

export default defineComponent({
  components: {
    VPopover,
    AppButtonHelp
  },
  setup () {
    const popperOptions = {
      modifiers: {
        // 横幅が小さい時に配置がずれるので無理やり修正
        modifyLeftPosition: {
          order: 890,
          enabled: true,
          fn: (data: any) => {
            const matches = data.styles.transform.match(/translate3d\((-?[0-9]+?)(px.*?)\)/)
            if (matches) {
              const [left, others] = matches.slice(1)
              const newLeft = Math.max(0, parseInt(left))
              data.styles.transform = `translate3d(${newLeft}${others})`
            }
            return data
          }
        }
      }
    }

    return {
      popperOptions
    }
  }
})
</script>
