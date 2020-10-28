<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'

import Post from '~/models/Post'
import usePostRenderer from '~/composables/use-post-renderer'
import AppSection from '~/components/atoms/AppSection.vue'

export default defineComponent({
  components: {
    AppSection
  },
  props: {
    post: {
      type: Post,
      required: true
    },
    page: {
      type: String,
      required: true
    }
  },
  render (createElement) {
    const { split } = usePostRenderer(this, createElement)
    const children = split(this.$props.page, [
      'break',
      'chapter',
      'image',
      'jump',
      'ruby',
      'jumpuri'
    ])
    return createElement(AppSection, {
      class: 'text-page'
    }, children)
  }
})
</script>

<style lang="postcss" scoped>
.text-page {
  @apply leading-loose;

  & h3 {
    @apply text-lg font-bold;
  }

  & a {
    @apply text-blue-500 transition-colors duration-300 cursor-pointer;

    &:hover {
      @apply text-blue-700 underline;
    }
  }
}
</style>
