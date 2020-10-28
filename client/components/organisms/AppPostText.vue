<template lang="pug">
div
  AppPostTextPage.my-4(
    v-for="(page, i) in pages",
    :key="i",
    :post="post",
    :page="page",
    :id="getPageId(i)",
    v-show="!showAllButtonIsVisible || i === 0",
    @jump="onJump"
  )
  .text-center.-mt-2(v-if="showAllButtonIsVisible")
    AppButton(
      color="white",
      :icon="faCopy",
      pill,
      @click="isAllShown = true"
    ) すべて表示 ({{ pages.length }}ページ)
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs } from 'nuxt-composition-api'
import VueScrollTo from 'vue-scrollto'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

import Post from '~/models/Post'
import useUniqId from '~/composables/use-uniq-id'
import AppButton from '~/components/atoms/AppButton.vue'
import AppPostTextPage from '~/components/organisms/AppPostTextPage.vue'

export default defineComponent({
  components: {
    AppButton,
    AppPostTextPage
  },
  props: {
    post: {
      type: Post,
      required: true
    }
  },
  setup (props, { root }) {
    const { id } = useUniqId('post-text')

    const localState = reactive({
      isAllShown: false
    })

    const pages = computed(() => {
      return props.post.textPages
    })

    const showAllButtonIsVisible = computed(() => {
      return pages.value.length > 1 && !localState.isAllShown
    })

    const getPageId = (pageNum: number) => {
      return `${id}-${pageNum}`
    }

    const onJump = async (to: number) => {
      if (to > 0 && !localState.isAllShown) {
        localState.isAllShown = true
        await root.$nextTick()
      }
      VueScrollTo.scrollTo(`#${getPageId(to)}`)
    }

    return {
      ...toRefs(localState),
      pages,
      showAllButtonIsVisible,
      getPageId,
      onJump,
      faCopy
    }
  }
})
</script>
