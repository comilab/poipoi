<template lang="pug">
ValidationObserver(
  ref="form",
  v-slot="{ invalid }",
  slim
)
  form.max-w-screen-md.text-center.bg-white.rounded.mx-auto.p-8(
    @submit.prevent="onSubmit",
    name="one-cushion",
    aria-label="ワンクッション"
  )
    font-awesome-icon.fa-10x.text-red-700(
      :icon="icon"
    )

    .my-8
      div(v-if="post.rating === 'r18'") 18歳未満の方は以降の内容を閲覧することができません。
      div(v-else-if="post.rating === 'nsfw'") 閲覧に注意が必要な内容が含まれます。

      template(v-if="requirePassword")
        div 閲覧にはパスワードが必要です。
        AppInput.text-left.my-4(
          vid="password",
          label="パスワード",
          v-model="input.password",
          type="password",
          :rules="{ required: true }"
        )

    AppButton(
      type="submit",
      color="red",
      :icon="faCheck",
      :indeterminate="verifying",
      :disabled="invalid || verifying"
    )
      .inline-flex.flex-col.md_inline(
        v-if="post.rating === 'r18'"
      )
        span 18歳以上であることに
        span 同意した上で閲覧する
      span(v-else) 閲覧する
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, ref } from 'nuxt-composition-api'
import { faExclamationTriangle, faLock, faCheck } from '@fortawesome/free-solid-svg-icons'

import Post from '~/models/Post'
import usePostsApi from '~/composables/use-posts-api'
import AppButton from '~/components/atoms/AppButton.vue'
import AppInput from '~/components/molecules/AppInput.vue'

export default defineComponent({
  components: {
    AppButton,
    AppInput
  },
  props: {
    post: {
      type: Post,
      required: true
    }
  },
  setup (props, { emit }) {
    const { post, verify, verifying } = usePostsApi(props.post)

    const form = ref<any>()

    const localState = reactive({
      input: {
        password: ''
      }
    })

    const icon = computed(() => {
      if (props.post.rating) {
        return faExclamationTriangle
      }
      return faLock
    })

    const requirePassword = computed(() => props.post.scope === 'password')

    const onSubmit = async () => {
      if (!requirePassword.value) {
        emit('passed', props.post)
      } else {
        try {
          await verify(localState.input)
          emit('passed', post.value)
        } catch (err) {
          form.value!.setErrors({
            password: 'パスワードが違います'
          })
        }
      }
    }

    return {
      form,
      verifying,
      ...toRefs(localState),
      icon,
      requirePassword,
      onSubmit,
      faCheck
    }
  }
})
</script>
