<template lang="pug">
AppFormPost(@submitted="onSubmitted")
</template>

<script lang="ts">
import { defineComponent, useContext } from 'nuxt-composition-api'

import Post from '~/models/Post'
import AppFormPost from '~/components/organisms/AppFormPost.vue'

export default defineComponent({
  middleware: ['auth'],
  components: {
    AppFormPost
  },
  head: {
    title: '投稿'
  },
  setup () {
    const { redirect } = useContext()

    const onSubmitted = (post: Post) => {
      redirect(post.path)
    }

    return {
      onSubmitted
    }
  }
})
</script>
