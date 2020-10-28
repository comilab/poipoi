<template lang="pug">
ul.flex.justify-end
  li.mx-1(v-if="post.actualEnableTwitterShare")
    AppTwitterShareButton(
      :url="post.url",
      :text="post.caption",
      append-site-title,
      size="sm",
      breakpoint="md"
    )
  li.mx-1(v-if="store.session.isLogin")
    AppButton(
      :to="`${post.path}/edit`",
      :icon="faEdit",
      color="gray",
      size="sm",
      breakpoint="md"
    ) 編集
  li.mx-1(v-if="store.session.isLogin")
    AppButton(
      :icon="faTrashAlt",
      color="gray",
      size="sm",
      breakpoint="md",
      @click="showDeleteModal = true"
    ) 削除
  AppModal(
    v-model="showDeleteModal",
    :persistent="destroying"
  )
    template(#default="{ close }")
      .text-center.my-8 この投稿を削除してよろしいですか？
      .flex.justify-center
        AppButton.mx-2(
          color="blue",
          :icon="faTrashAlt",
          :indeterminate="destroying",
          :disabled="destroying",
          @click="deletePost"
        ) 削除する
        AppButton.mx-2(
          color="gray",
          :disabled="destroying",
          @click="close"
        ) キャンセル
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'nuxt-composition-api'
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

import Post from '~/models/Post'
import { useStore } from '~/store'
import usePostsApi from '~/composables/use-posts-api'
import AppButton from '~/components/atoms/AppButton.vue'
import AppTwitterShareButton from '~/components/molecules/AppTwitterShareButton.vue'
import AppModal from '~/components/molecules/AppModal.vue'

export default defineComponent({
  components: {
    AppButton,
    AppTwitterShareButton,
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

    const { destroy, destroying } = usePostsApi(props.post)

    const localState = reactive({
      showDeleteModal: false
    })

    const deletePost = async () => {
      await destroy()
      emit('deleted')
    }

    return {
      store,
      destroying,
      ...toRefs(localState),
      deletePost,
      faEdit,
      faTrashAlt
    }
  }
})
</script>
