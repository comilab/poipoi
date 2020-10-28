<template lang="pug">
div
  .absolute.inset-0.h-full(v-if="loading", data-testid="overlay")
    .position-center
      font-awesome-icon.fa-6x.text-black.opacity-50(
        :icon="faSpinner",
        pulse
      )
  slot(v-else)
</template>

<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  props: {
    loading: {
      type: Boolean,
      required: true
    }
  },
  setup () {
    return {
      faSpinner
    }
  }
})
</script>
