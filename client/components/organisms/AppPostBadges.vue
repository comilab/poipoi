<template lang="pug">
ul.flex
  li.mx-1(v-if="post.pinned")
    AppButton(
      type="badge",
      color="blue",
      size="sm",
      :icon="faThumbtack",
      pill,
      aria-label="固定"
    )
  li.mx-1(v-if="post.rating === 'nsfw'")
    AppButton(
      type="badge",
      color="red",
      size="sm",
      :icon="faExclamationTriangle",
      :breakpoint="breakpoint",
      pill
    )
      span(v-show="!iconOnly") 閲覧注意
  li.mx-1(v-else-if="post.rating === 'r18'")
    AppButton(
      type="badge",
      color="red",
      size="sm",
      icon="r18",
      :breakpoint="breakpoint",
      pill
    )
      span(v-show="!iconOnly") R-18
  li.mx-1(v-if="post.scope === 'password'")
    AppButton(
      type="badge",
      color="yellow",
      size="sm",
      :icon="faLock",
      :breakpoint="breakpoint",
      pill
    )
      span(v-show="!iconOnly") パスワード
  li.mx-1(v-else-if="post.scope === 'private'")
    AppButton(
      type="badge",
      color="gray",
      size="sm",
      :icon="faEyeSlash",
      :breakpoint="breakpoint",
      pill
    )
      span(v-show="!iconOnly") 非公開
  li.mx-1(v-if="isOutOfDate")
    AppButton(
      type="badge",
      color="gray",
      size="sm",
      :icon="faCalendarTimes",
      :breakpoint="breakpoint",
      pill
    )
      span(v-show="!iconOnly") 公開期間外
</template>

<script lang="ts">
import { defineComponent, computed } from 'nuxt-composition-api'
import dayjs from 'dayjs'
import { faThumbtack, faEyeSlash, faCalendarTimes, faExclamationTriangle, faLock } from '@fortawesome/free-solid-svg-icons'

import Post from '~/models/Post'
import AppButton from '~/components/atoms/AppButton.vue'

export default defineComponent({
  components: {
    AppButton
  },
  props: {
    post: {
      type: Post,
      required: true
    },
    iconOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup (props) {
    const isOutOfDate = computed(() => {
      return (
        (props.post.publishStart && dayjs().isBefore(props.post.publishStart)) ||
        (props.post.publishEnd && dayjs().isAfter(props.post.publishEnd))
      )
    })

    const breakpoint = computed(() => props.iconOnly ? null : 'md')

    return {
      isOutOfDate,
      breakpoint,
      faThumbtack,
      faEyeSlash,
      faCalendarTimes,
      faExclamationTriangle,
      faLock
    }
  }
})
</script>
