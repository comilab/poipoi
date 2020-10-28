<template lang="pug">
figure.relative
  AppSquare.w-full
    img.object-cover.border.rounded.select-none.pointer-events-none(
      v-if="showThumbnail",
      :src="post.images[0].paths.small"
    )
    .relative.border.rounded.p-4(
      v-else
    )
      figcaption.figcaption.text-sm.select-none.overflow-hidden(
        :class="{ 'has-title': post.title }"
      )
        .text-base.font-bold.truncate {{ post.title }}
        .caption {{ post.caption }}
  .absolute.top-0.px-1.py-2
    AppPostBadges(
      :post="post",
      icon-only
    )
  .absolute.right-0.bottom-0.text-right
    AppButton.border.mr-2.mb-2(
      v-if="post.imagesCount && post.showImagesList",
      type="badge",
      color="white",
      size="sm",
      :icon="faImages"
    ) {{ post.imagesCount }}
    AppButton.border.mr-2.mb-2(
      v-if="post.textCount",
      type="badge",
      color="white",
      size="sm"
    ) {{ formattedTextCount }} 字
  .absolute.inset-0.bg-white.bg-opacity-75.opacity-0.hover_opacity-100.transition-opacity.duration-300.border.rounded.p-4
    figcaption.figcaption.text-sm.select-none.overflow-hidden(
      :class="{ 'has-title': post.title }"
    )
      .text-base.font-bold.truncate {{ post.title }}
      .caption {{ post.caption }}
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'
import { faImages } from '@fortawesome/free-solid-svg-icons'

import Post from '~/models/Post'
import AppSquare from '~/components/atoms/AppSquare.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppPostBadges from '~/components/organisms/AppPostBadges.vue'

export default defineComponent({
  components: {
    AppSquare,
    AppButton,
    AppPostBadges
  },
  props: {
    post: {
      type: Post,
      required: true
    }
  },
  setup (props) {
    const showThumbnail = computed(() => {
      return props.post.imagesCount && props.post.showThumbnail
    })

    const formattedTextCount = computed(() => {
      return new Intl.NumberFormat().format(props.post.textCount)
    })

    return {
      showThumbnail,
      formattedTextCount,
      faImages
    }
  }
})
</script>

<style lang="postcss" scoped>
.figcaption {
  & .caption {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;

    @screen md {
      -webkit-line-clamp: 6;
    }

    @screen lg {
      -webkit-line-clamp: 5;
    }

    @screen xl {
      -webkit-line-clamp: 7;
    }
  }

  &.has-title .caption {
    -webkit-line-clamp: 3;

    @screen md {
      -webkit-line-clamp: 5;
    }

    @screen lg {
      -webkit-line-clamp: 4;
    }

    @screen xl {
      -webkit-line-clamp: 6;
    }
  }
}
</style>
