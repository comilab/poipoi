<template lang="pug">
section.container.position-center.text-center
  template(v-if="error.statusCode === 404")
    h1.text-4xl.md_text-6xl.text-gray-600.font-black 404 Not found
    .my-4 ページが見つかりませんでした
  template(v-else)
    h1.text-6xl.text-gray-600.font-black エラーが発生しました
    .my-4 ページを更新して再度お試しください
  AppButton.my-16(
    to="/",
    color="blue"
  ) トップページに戻る
</template>

<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'

import AppButton from '~/components/atoms/AppButton.vue'

export default defineComponent({
  components: {
    AppButton
  },
  props: {
    error: {
      required: true
    }
  },
  setup () {
    //
  }
})
</script>
