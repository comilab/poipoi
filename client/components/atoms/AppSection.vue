<template lang="pug">
component.rounded.bg-white.my-8.p-4(
  :is="tag",
  data-testid="section"
)
  h3.text-lg(
    v-if="hasTitle",
    data-testid="title"
  )
    slot(name="title") {{ title }}
  slot
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'

export default defineComponent({
  props: {
    title: {
      type: String,
      required: false,
      default: null
    },
    tag: {
      type: String,
      required: false,
      default: 'section'
    }
  },
  setup (props, context) {
    const hasTitle = computed(() => {
      return props.title || context.slots.title
    })

    return {
      hasTitle
    }
  }
})
</script>
