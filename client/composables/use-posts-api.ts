import { reactive, toRefs } from 'nuxt-composition-api'
import axios from 'axios'

import Post from '~/models/Post'
import useApi from '~/composables/use-api'

export default function usePostsApi (post: Post|null = null) {
  const state = reactive({
    verifying: false
  })

  const api = useApi('/posts', Post, post)

  async function verify (payload: any) {
    if (api.item.value) {
      state.verifying = true
      try {
        const { data } = await axios.post(`/posts/${api.item.value.id}/verify`, payload)
        api.item.value = new Post(data)
      } finally {
        state.verifying = false
      }
    }
  }

  return {
    ...api,
    post: api.item,
    posts: api.items,
    ...toRefs(state),
    verify
  }
}
