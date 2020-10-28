<template lang="pug">
button(type="button")
  font-awesome-icon(:icon="faQuestionCircle")
</template>

<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  setup () {
    return {
      faQuestionCircle
    }
  }
})
</script>
