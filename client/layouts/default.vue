<template lang="pug">
StoreProvider
  AppGlobalMeta
  #top.bg-gray-200.min-h-screen
    AppGlobalHeader
    .container.mx-auto.px-4.py-8
      Nuxt
  AppGlobalToasts
</template>

<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'

import { StoreProvider } from '~/store'
import AppGlobalMeta from '~/components/organisms/AppGlobalMeta.vue'
import AppGlobalHeader from '~/components/organisms/AppGlobalHeader.vue'
import AppGlobalToasts from '~/components/organisms/AppGlobalToasts.vue'

export default defineComponent({
  components: {
    StoreProvider,
    AppGlobalMeta,
    AppGlobalHeader,
    AppGlobalToasts
  }
})
</script>
