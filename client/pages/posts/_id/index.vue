<template lang="pug">
AppLoadingOverlay(:loading="$fetchState.pending")
  template(v-if="post")
    AppPostMeta(:post="post")
    article
      figure
        figcaption.max-w-screen-md.mx-auto.my-8
          AppSection(tag="div")
            .flex.flex-col.md_flex-row.-mx-1
              .flex-auto
                AppPostBadges(:post="post")
              nav
                AppPostLinks(
                  :post="post",
                  @deleted="onDeleted"
                )
            h2.text-lg.font-bold.my-4 {{ post.title }}
            AppPostCaption.my-4(:post="post")
            aside.text-sm.text-right
              .md_inline 投稿日: {{ post.createdAt.format('YYYY-MM-DD HH:mm') }}
              .md_inline.ml-2(v-if="isUpdated") ({{ post.updatedAt.format('YYYY-MM-DD HH:mm') }} 更新)

        AppFormOneCushion(
          v-if="showOneCushion",
          :post="post",
          @passed="onPassed"
        )

        template(v-else)
          AppPostImages.-mx-4.my-8(
            v-if="post.showImagesList",
            :post="post"
          )
          AppPostText.max-w-screen-md.mx-auto.mt-8.mb-12(
            v-if="post.text",
            :post="post"
          )

      AppSection.max-w-screen-md.mx-auto(
        v-if="post.actualEnableReaction && !showOneCushion",
        title="リアクション"
      )
        AppFormReaction.my-4(
          :post="post",
          @added="onAddedReaction",
          @deleted="onDeletedReaction"
        )
</template>

<script lang="ts">
import { defineComponent, useContext, useFetch, reactive, toRefs, computed } from 'nuxt-composition-api'

import Post from '~/models/Post'
import usePostsApi from '~/composables/use-posts-api'
import AppLoadingOverlay from '~/components/atoms/AppLoadingOverlay.vue'
import AppSection from '~/components/atoms/AppSection.vue'
import AppPostMeta from '~/components/organisms/AppPostMeta.vue'
import AppPostCaption from '~/components/organisms/AppPostCaption.vue'
import AppPostBadges from '~/components/organisms/AppPostBadges.vue'
import AppPostLinks from '~/components/organisms/AppPostLinks.vue'
import AppPostImages from '~/components/organisms/AppPostImages.vue'
import AppPostText from '~/components/organisms/AppPostText.vue'
import AppFormOneCushion from '~/components/organisms/AppFormOneCushion.vue'
import AppFormReaction from '~/components/organisms/AppFormReaction.vue'

export default defineComponent({
  components: {
    AppLoadingOverlay,
    AppPostCaption,
    AppSection,
    AppPostMeta,
    AppPostBadges,
    AppPostLinks,
    AppPostImages,
    AppPostText,
    AppFormOneCushion,
    AppFormReaction
  },
  setup () {
    const { params, redirect } = useContext()

    const { post, show } = usePostsApi()

    useFetch(async () => {
      await show(params.value.id)
    })

    const localState = reactive({
      cushionPassed: false
    })

    const isUpdated = computed(() => {
      if (!post.value!.updatedAt) {
        return false
      }
      return !post.value!.createdAt!.isSame(post.value!.updatedAt)
    })

    const showOneCushion = computed(() => {
      if (localState.cushionPassed) {
        return false
      }
      return !!post.value!.rating || post.value!.scope === 'password'
    })

    const onDeleted = () => {
      redirect('/')
    }

    const onPassed = (newPost: Post) => {
      post.value = newPost
      localState.cushionPassed = true
    }

    const onAddedReaction = (newPost: Post) => {
      post.value = newPost
    }

    const onDeletedReaction = (newPost: Post) => {
      post.value = newPost
    }

    return {
      post,
      ...toRefs(localState),
      isUpdated,
      showOneCushion,
      onDeleted,
      onPassed,
      onAddedReaction,
      onDeletedReaction
    }
  }
})
</script>
