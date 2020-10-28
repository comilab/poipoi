<template lang="pug">
TwemojiPicker.twemoji-picker(
  :emojiData="emojiData",
  :emojiGroups="EmojiGroups",
  :pickerWidth="pickerWidth",
  :searchEmojisFeat="true",
  :emojiPickerDisabled="disabled",
  @emojiUnicodeAdded="onSelect"
)
  template(#twemoji-picker-button)
    slot
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'
import { PropType } from '@vue/composition-api'
// @ts-ignore
import { TwemojiPicker } from '@kevinfaguiar/vue-twemoji-picker'
import EmojiPack from '@kevinfaguiar/vue-twemoji-picker/src/interfaces/EmojiPack'
import EmojiAllData from '@kevinfaguiar/vue-twemoji-picker/emoji-data/ja/emoji-all-groups.json'
import EmojiGroups from '@kevinfaguiar/vue-twemoji-picker/emoji-data/emoji-groups.json'
import { useWindowSize } from '@vueuse/core'

export default defineComponent({
  components: {
    TwemojiPicker
  },
  props: {
    emojis: {
      type: Array as PropType<string[]>,
      required: false,
      default: null
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup (props, { emit }) {
    const { width } = useWindowSize()

    const emojiData = computed(() => {
      if (!props.emojis?.length) {
        return EmojiAllData
      }
      return (EmojiAllData as EmojiPack[])
        .map((pack) => {
          const emojiList = pack.emojiList.filter((emojiData) => {
            const emoji = emojiData.unicode
            return props.emojis.includes(emoji)
          })
          return {
            ...pack,
            emojiList
          }
        })
        .filter(pack => !!pack.emojiList.length)
    })

    const pickerWidth = computed(() => {
      if (width.value > 532) {
        return 500
      }
      return width.value - 32
    })

    const onSelect = (emoji: string) => {
      emit('select', emoji)
    }

    return {
      emojiData,
      pickerWidth,
      onSelect,
      EmojiGroups
    }
  }
})
</script>

<style lang="postcss" scoped>
.twemoji-picker {
  & >>> img {
    @apply inline;
  }

  & >>> #search-header > span {
    @apply box-content;
  }
}
</style>
