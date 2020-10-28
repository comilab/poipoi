<template lang="pug">
</template>

<script lang="ts">
import { defineComponent, useMeta, useContext, watch } from 'nuxt-composition-api'

import { useStore } from '~/store'

export default defineComponent({
  head: {},
  setup () {
    const store = useStore()

    const { titleTemplate, title, meta, link } = useMeta()

    const { route } = useContext()

    watch(
      route,
      () => {
        const routeName = route.value.name

        const settings = store.setting.data.value!

        titleTemplate.value = `%s - ${settings.siteTitle}`

        if (routeName === 'login') {
          title.value = 'ログイン'
        } else if (routeName === 'posts-new') {
          title.value = '投稿'
        } else if (routeName === 'posts-id-edit') {
          title.value = '編集'
        } else if (routeName === 'notifications') {
          title.value = 'お知らせ'
        } else if (routeName === 'settings') {
          title.value = '設定'
        }

        meta.value.push({ hid: 'description', name: 'description', content: settings.siteDescription })

        if (settings.denyRobot) {
          meta.value.push({ hid: 'robots', name: 'robots', content: 'noindex, nofollow, noarchive' })
        }

        if (settings.enableFeed) {
          link.value.push(
            { rel: 'alternate', type: 'application/rss+xml', title: settings.siteTitle, href: '/feed' }
          )
        }
      },
      { immediate: true }
    )
  }
})
</script>
