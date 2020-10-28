<template lang="pug">
.flex.flex-col
  AppLabel(
    v-if="label",
    data-testid="label"
  ) {{ label }}
  .mb-2
    AppTwemojiPicker(
      :disabled="disabled",
      @select="onSelect",
      data-testid="twemoji-picker"
    )
      slot(name="button")
  .w-full.border.rounded.px-2(data-testid="emojis")
    .text-gray-700.m-2(v-if="!value.length") 全ての絵文字を使用
    .emoji-list.flex.flex-wrap.overflow-auto(v-else)
      AppEmoji.w-5.h-5.m-2(
        v-for="emoji in value",
        :key="emoji",
        :text="emoji",
        :class="{ 'cursor-pointer': !disabled }",
        @click.native="remove(emoji)",
        data-testid="emoji"
      )
</template>

<script lang="ts">
import { defineComponent } from 'nuxt-composition-api'
import { PropType } from '@vue/composition-api'
import uniq from 'lodash/uniq'
import { faSmile } from '@fortawesome/free-solid-svg-icons'

import AppLabel from '~/components/atoms/AppLabel.vue'
import AppTwemojiPicker from '~/components/atoms/AppTwemojiPicker.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppEmoji from '~/components/atoms/AppEmoji.vue'

export default defineComponent({
  components: {
    AppTwemojiPicker,
    AppLabel,
    AppButton,
    AppEmoji
  },
  props: {
    value: {
      type: Array as PropType<string[]>,
      required: true
    },
    label: {
      type: String,
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
    const onSelect = (emoji: string) => {
      props.value.push(emoji)
      emit('input', uniq(props.value))
    }

    const remove = (emoji: string) => {
      if (!props.disabled) {
        emit('input', props.value.filter(char => char !== emoji))
      }
    }

    return {
      onSelect,
      remove,
      faSmile
    }
  }
})
</script>

<style lang="postcss" scoped>
.emoji-list {
  min-height: 1rem;
  max-height: 10rem;
}
</style>
