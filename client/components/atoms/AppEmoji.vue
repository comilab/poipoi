<template lang="pug">
.emoji-wrapper.inline-block(
  v-html="img"
)
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'
import Twemoji from 'twemoji'

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const img = computed(() => Twemoji.parse(props.text))

    return {
      img
    }
  }
})
</script>

<style lang="postcss" scoped>
.emoji-wrapper {
  line-height: 0;

  & >>> img {
    @apply inline-block;
  }
}

</style>
