<template lang="pug">
AppSection.max-w-screen-sm.mx-auto(title="ログイン")
  ValidationObserver(
    ref="form",
    v-slot="{ invalid }",
    slim
  )
    form(
      @submit.prevent="login",
      name="login"
    )
      AppInput.my-4(
        vid="email",
        label="メールアドレス",
        type="email",
        v-model="input.email",
        :rules="{ required: true, email: true }"
      )
      AppInput.my-4(
        vid="password",
        label="パスワード"
        type="password",
        v-model="input.password",
        :rules="{ required: true }"
      )
      .text-center
        AppButton(
          type="submit",
          color="blue",
          :icon="faSignInAlt",
          :indeterminate="sending",
          :disabled="invalid || sending"
        ) ログイン
</template>

<script lang="ts">
import { defineComponent, reactive, useContext, toRefs, ref } from 'nuxt-composition-api'
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'

import { useStore } from '~/store'
import AppSection from '~/components/atoms/AppSection.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppInput from '~/components/molecules/AppInput.vue'

export default defineComponent({
  components: {
    AppSection,
    AppInput,
    AppButton
  },
  setup () {
    const store = useStore()

    const { redirect } = useContext()

    const localState = reactive({
      input: {
        email: '',
        password: ''
      },
      sending: false
    })

    const form = ref<any>()

    const login = async () => {
      localState.sending = true
      try {
        await store.session.create(localState.input)
        await store.session.load()
        redirect(200, '/')
      } catch (error) {
        form.value!.setErrors({
          email: 'メールアドレスかパスワードが違います',
          password: 'メールアドレスかパスワードが違います'
        })
      }
      localState.sending = false
    }

    return {
      ...toRefs(localState),
      form,
      login,
      faSignInAlt
    }
  }
})
</script>
