<template lang="pug">
.flex.flex-col.text-center.relative
  .my-4(
    v-for="(image, i) in post.images",
    :key="image.id",
    v-show="!showAllButtonIsVisible || i === 0"
  )
    AppImageZoomable(
      :src="image.paths.large",
      :large-src="image.paths.original",
      img-class="post-image"
    )

  AppButton.position-x-center.bottom-0.shadow-xl.mb-12.md_mb-16(
    v-if="showAllButtonIsVisible",
    color="white",
    pill,
    :icon="faImages",
    @click="isAllShown = true"
  ) すべて表示 ({{ post.images.length }}枚)
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from 'nuxt-composition-api'
import { faImages } from '@fortawesome/free-solid-svg-icons'

import Post from '~/models/Post'
import AppButton from '~/components/atoms/AppButton.vue'
import AppImageZoomable from '~/components/molecules/AppImageZoomable.vue'

export default defineComponent({
  components: {
    AppButton,
    AppImageZoomable
  },
  props: {
    post: {
      type: Post,
      required: true
    }
  },
  setup (props) {
    const localState = reactive({
      isAllShown: false
    })

    const showAllButtonIsVisible = computed(() => {
      return props.post.images.length > 1 && !localState.isAllShown
    })

    return {
      ...toRefs(localState),
      showAllButtonIsVisible,
      faImages
    }
  }
})
</script>

<style lang="postcss" scoped>
.post-image {
  max-height: 90vh;
}
</style>
