<template lang="pug">
.flex.flex-wrap.items-center.-mx-2
  AppButton.more-button.mx-2.mb-2(
    v-if="hasMoreReactions",
    title="古いリアクションを表示",
    color="white",
    size="sm",
    :icon="faAngleDoubleUp",
    :indeterminate="indexing",
    :disabled="indexing",
    @click="onClickMore"
  )
  AppEmoji.w-6.h-6.m-2(
    v-for="reaction in displayedReactions",
    :key="reaction.id",
    :text="reaction.emoji",
    :class="{ 'cursor-pointer': store.session.isLogin }",
    @click.native="onClickEmoji(reaction)"
  )
  AppTwemojiPicker(
    :emojis="post.emojis",
    @select="onSelect"
  )
    AppButton.ml-2(
      title="リアクションを追加",
      :icon="faPlus",
      color="gray",
      size="sm",
      :indeterminate="creating",
      :disabled="creating"
    )

  AppModal(
    v-model="showDeleteModal",
    :persistent="destroying"
  )
    template(#default="{ close }")
      .text-center.my-8 このリアクションを削除してよろしいですか？
      .flex.justify-center
        AppButton.mx-2(
          color="blue",
          :icon="faTrashAlt",
          :indeterminate="destroying",
          :disabled="destroying",
          @click="deleteReaction"
        ) 削除する
        AppButton.mx-2(
          color="gray",
          :disabled="destroying",
          @click="close"
        ) キャンセル
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed } from 'nuxt-composition-api'
import { faAngleDoubleUp, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

import { useStore } from '~/store'
import Post from '~/models/Post'
import Reaction from '~/models/Reaction'
import useReactionsApi from '~/composables/use-reactions-api'
import AppEmoji from '~/components/atoms/AppEmoji.vue'
import AppTwemojiPicker from '~/components/atoms/AppTwemojiPicker.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppModal from '~/components/molecules/AppModal.vue'

export default defineComponent({
  components: {
    AppEmoji,
    AppTwemojiPicker,
    AppButton,
    AppModal
  },
  props: {
    post: {
      type: Post,
      required: true
    }
  },
  setup (props, { emit }) {
    const store = useStore()

    const {
      reaction,
      reactions,
      pagination,
      index,
      indexing,
      create,
      creating,
      destroy,
      destroying
    } = useReactionsApi(props.post)

    const localState = reactive({
      loadedReactions: [] as Reaction[],
      showDeleteModal: false
    })

    const hasMoreReactions = computed(() => {
      if (pagination.value) {
        return pagination.value.lastPage > 1
      }
      return props.post.reactionsCount > 100
    })

    const displayedReactions = computed(() => {
      return props.post.reactions
        .concat(localState.loadedReactions)
        .reverse()
    })

    const onClickMore = async () => {
      await index({
        lt: displayedReactions.value[0].createdAt!.toDate()
      })
      localState.loadedReactions.push(...reactions.value)
    }

    const onClickEmoji = (target: Reaction) => {
      if (!store.session.isLogin.value) {
        return
      }
      reaction.value = target
      localState.showDeleteModal = true
    }

    const deleteReaction = async () => {
      const reactionId = reaction.value!.id
      await destroy()
      const key = props.post.reactions.findIndex(r => r.id === reactionId)
      if (key >= 0) {
        props.post.reactions.splice(key, 1)
      }
      emit('deleted', props.post)
      localState.showDeleteModal = false
    }

    const onSelect = async (emoji: string) => {
      await create({
        emoji
      })
      props.post.reactions.unshift(reaction.value!)
      props.post.reactionsCount++
      emit('added', props.post)
    }

    return {
      store,
      indexing,
      creating,
      destroying,
      ...toRefs(localState),
      hasMoreReactions,
      displayedReactions,
      onClickMore,
      onClickEmoji,
      deleteReaction,
      onSelect,
      faAngleDoubleUp,
      faPlus,
      faTrashAlt
    }
  }
})
</script>

<style lang="postcss" scoped>
.more-button {
  @apply w-full;
}
</style>
