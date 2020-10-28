<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'

import Post from '~/models/Post'
import usePostRenderer from '~/composables/use-post-renderer'

export default defineComponent({
  props: {
    post: {
      type: Post,
      required: true
    }
  },
  render (createElement) {
    const { split } = usePostRenderer(this, createElement)
    const children = split(this.$props.post.caption, ['break', 'hashtag'])
    return createElement('div', {
      class: 'caption'
    }, children)
  }
})
</script>

<style lang="postcss" scoped>
.caption {
  & a {
    @apply text-blue-500 transition-colors duration-300;

    &:hover {
      @apply text-blue-700 underline;
    }
  }
}
</style>
