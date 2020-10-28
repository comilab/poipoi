<template lang="pug">
AppLoadingOverlay(:loading="fetchState.pending")
  AppFormPost(
    v-if="post",
    :post="post",
    @submitted="onSubmitted"
  )
</template>

<script lang="ts">
import { defineComponent, useContext, useFetch } from 'nuxt-composition-api'

import usePostsApi from '~/composables/use-posts-api'
import AppLoadingOverlay from '~/components/atoms/AppLoadingOverlay.vue'
import AppFormPost from '~/components/organisms/AppFormPost.vue'

export default defineComponent({
  middleware: ['auth'],
  components: {
    AppFormPost,
    AppLoadingOverlay
  },
  head: {
    title: '編集'
  },
  setup () {
    const { params, redirect } = useContext()

    const { post, show } = usePostsApi()

    const { fetchState } = useFetch(async () => {
      await show(params.value.id)
    })

    const onSubmitted = () => {
      redirect(post.value!.path)
    }

    return {
      post,
      fetchState,
      onSubmitted
    }
  }
})
</script>
