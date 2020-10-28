<template lang="pug">
AppLoadingOverlay(:loading="fetchState.pending")
  AppSection.max-w-screen-md.divide-y.mx-auto.px-2.md_px-4
    div(v-if="!notifications.length") お知らせがありません
    template(v-else)
      .pt-2.mb-2(
        v-for="notification in notifications",
        :key="notification.id"
      )
        AppButton.w-full(
          :to="notification.post.path",
          color="white",
          text-class="w-full flex"
        )
          AppEmoji.flex-shrink-0.w-8.h-8(:text="notification.emoji")
          .flex-auto.overflow-hidden.ml-2.md_ml-4
            .mb-1
              .block.md_inline リアクションがありました
              .block.md_inline.text-sm.md_ml-2 ({{ notification.createdAt.format('YYYY-MM-DD HH:mm') }})
            .text-sm.truncate {{ notification.post.caption }}
          img.hidden.md_block.self-center.w-12.h-12.object-cover.rounded.ml-2(
            v-if="notification.post.images.length",
            :src="notification.post.images[0].paths.small"
          )
  AppPagination.justify-center.my-4(
    v-if="pagination",
    :pagination="pagination",
    @selected="onSelected"
  )
</template>

<script lang="ts">
import { defineComponent, useContext, useFetch, watch } from 'nuxt-composition-api'

import useNotificationsApi from '~/composables/use-notifications-api'
import AppLoadingOverlay from '~/components/atoms/AppLoadingOverlay.vue'
import AppSection from '~/components/atoms/AppSection.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppEmoji from '~/components/atoms/AppEmoji.vue'
import AppPagination from '~/components/molecules/AppPagination.vue'

export default defineComponent({
  middleware: ['auth'],
  components: {
    AppLoadingOverlay,
    AppSection,
    AppButton,
    AppEmoji,
    AppPagination
  },
  setup () {
    const { route, redirect } = useContext()

    const { notifications, pagination, index } = useNotificationsApi()

    const { fetch, fetchState } = useFetch(async () => {
      await index(route.value.query)
    })

    const onSelected = (page: number) => {
      redirect('/notifications', {
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
      notifications,
      pagination,
      fetchState,
      onSelected
    }
  }
})
</script>
