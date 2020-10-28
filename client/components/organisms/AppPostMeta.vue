<template lang="pug">
</template>

<script lang="ts">
import { defineComponent, useMeta } from 'nuxt-composition-api'

import Post from '~/models/Post'
import { useStore } from '~/store'

export default defineComponent({
  props: {
    post: {
      type: Post,
      required: true
    }
  },
  head: {},
  setup (props) {
    const store = useStore()

    const { title, meta } = useMeta()

    const post = props.post
    const settings = store.setting.data.value!

    title.value = `${post.title || post.caption} - ${settings.siteTitle}`
    meta.value.push({ hid: 'description', name: 'description', content: post.caption })

    if (post.actualDenyRobot) {
      meta.value.push({ hid: 'robots', name: 'robots', content: 'noindex, nofollow, noarchive' })
    }

    if (post.actualEnableTwitterShare) {
      meta.value.push(
        { hid: 'og:url', property: 'og:url', content: post.url },
        { hid: 'og:title', property: 'og:title', content: `${post.title || post.caption} - ${settings.siteTitle}` },
        { hid: 'og:description', property: 'og:description', content: post.caption }
      )

      if (post.images.length && post.showThumbnail) {
        meta.value.push(
          { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
          { hid: 'og:image', property: 'og:image', content: post.images[0].publicPaths.medium }
        )
      } else {
        meta.value.push({ hid: 'twitter:card', name: 'twitter:card', content: 'summary' })
      }
    }
  }
})
</script>
