<template lang="pug">
AppButton.tweet-button(
  :href="twitterShareUrl",
  color="blue",
  :icon="faTwitter",
  target="_blank",
  v-bind="$attrs"
) Tweet
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import { useStore } from '~/store'
import AppButton from '~/components/atoms/AppButton.vue'

export default defineComponent({
  components: {
    AppButton
  },
  props: {
    url: {
      type: String,
      required: false,
      default: ''
    },
    text: {
      type: String,
      required: false,
      default: ''
    },
    appendSiteTitle: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  setup (props) {
    const store = useStore()

    const twitterShareUrl = computed(() => {
      const url = new URL('http://twitter.com/share')
      const texts = []

      let maxLength = 140
      if (props.url) {
        maxLength -= 11
        url.searchParams.append('url', props.url)
      }

      if (props.appendSiteTitle) {
        const siteTitle = store.setting.data.value!.siteTitle
        maxLength -= siteTitle.length
        if (props.text.length) {
          maxLength -= 3
          texts.push(' - ')
        }
        texts.push(siteTitle)
      }

      if (props.text.length > maxLength) {
        maxLength -= 1
        texts.unshift(`${props.text.substring(0, maxLength)}…`)
      } else {
        texts.unshift(props.text.substring(0, maxLength))
      }

      url.searchParams.append('text', texts.join(''))
      return url.toString()
    })

    return {
      twitterShareUrl,
      faTwitter
    }
  }
})
</script>

<style lang="postcss" scoped>
.tweet-button {
  background-color: #1da1f2;

  &:hover {
    @apply bg-blue-600;
  }
}
</style>
