<template lang="pug">
AppLoadingOverlay(:loading="fetchState.pending")
  AppSection(v-if="posts")
    .text-center.text-gray-700(
      v-if="!posts.length"
    ) 作品がありません
    .grid.gap-4.grid-cols-2.md_grid-cols-4.lg_grid-cols-6(v-else)
      nuxt-link.post-link.inline-block.relative(
        v-for="post in posts",
        :key="post.id",
        :to="post.path"
      )
        AppPostThumbnail(:post="post")
  AppPagination.justify-center.my-4(
    v-if="pagination",
    :pagination="pagination",
    @selected="onSelected"
  )
</template>

<script lang="ts">
import { defineComponent, useContext, useMeta, useFetch, watch } from 'nuxt-composition-api'
import VueScrollTo from 'vue-scrollto'

import { useStore } from '~/store'
import usePostsApi from '~/composables/use-posts-api'
import AppLoadingOverlay from '~/components/atoms/AppLoadingOverlay.vue'
import AppSection from '~/components/atoms/AppSection.vue'
import AppPagination from '~/components/molecules/AppPagination.vue'
import AppPostThumbnail from '~/components/organisms/AppPostThumbnail.vue'

export default defineComponent({
  components: {
    AppLoadingOverlay,
    AppSection,
    AppPostThumbnail,
    AppPagination
  },
  head: {},
  setup () {
    const { route, redirect } = useContext()

    const store = useStore()

    const { title } = useMeta()
    title.value = store.setting.data.value!.siteTitle

    const { posts, pagination, index } = usePostsApi()

    const { fetch, fetchState } = useFetch(async () => {
      await index(route.value.query)
      VueScrollTo.scrollTo('#top')
    })

    const onSelected = (page: number) => {
      redirect('/', {
        ...route.value.query,
        page: page.toString()
      })
    }

    watch(
      () => route.value.query,
      async () => {
        await fetch()
      }
    )

    return {
      posts,
      pagination,
      fetchState,
      onSelected
    }
  }
})
</script>
