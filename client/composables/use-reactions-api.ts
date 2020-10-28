import Reaction from '~/models/Reaction'
import Post from '~/models/Post'
import useApi from '~/composables/use-api'

export default function useReactionsApi (post: Post) {
  const api = useApi(`/posts/${post.id}/reactions`, Reaction)

  return {
    ...api,
    reaction: api.item,
    reactions: api.items
  }
}
