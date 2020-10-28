<template lang="pug">
.is-square.relative
  .content.absolute.inset-0
    slot
</template>

<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'

export default defineComponent({})
</script>

<style lang="postcss" scoped>
.is-square {
  padding-top: 100%;

  & .content > * {
    @apply w-full h-full;
  }
}
</style>
