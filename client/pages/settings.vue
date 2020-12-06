<template lang="pug">
AppLoadingOverlay(:loading="$fetchState.pending")
  ValidationObserver(
    v-if="input.settings",
    v-slot="{ invalid }",
    slim
  )
    form.max-w-screen-md.mx-auto(
      @submit.prevent="onSubmit",
      name="settings"
    )
      AppSection(title="ユーザ設定")
        AppInput.my-4(
          label="ユーザ名",
          type="text",
          v-model="input.user.name",
          :rules="{ required: true }"
        )
        AppInput.my-4(
          label="メールアドレス",
          type="email",
          v-model="input.user.email",
          :rules="{ required: true, email: true }"
        )
        AppInput.my-4(
          label="パスワード",
          type="password",
          v-model="input.user.password"
        )
      AppSection(title="サイト設定")
        AppInput.my-4(
          label="サイト名",
          type="text",
          v-model="input.settings.siteTitle",
          :rules="{ required: true, max: 32 }"
        )
        AppInput.my-4(
          label="サイト概要",
          type="textarea",
          v-model="input.settings.siteDescription",
          :rules="{ required: false, max: 200 }"
        )
        AppInput.my-4(
          label="1ページあたりの表示件数",
          type="number",
          v-model="input.settings.perPage",
          :rules="{ required: true, numeric: true }",
          min="1"
        )
        AppInput.my-4(
          label="トップページの検索避け",
          type="radio",
          v-model="input.settings.denyRobot",
          :options="denyRobotOptions"
        )
        AppInput.my-4(
          label="RSS配信",
          type="radio",
          v-model="input.settings.enableFeed",
          :options="enableFeedOptions"
        )
      AppSection(title="投稿基本設定")
        AppInput.my-4(
          type="checkboxgroup",
          v-model="input.settings.postDefault.denyRobotScope",
          :options="denyRobotScopeOptions"
        )
          template(#label)
            span デフォルトで検索避けを行う対象
            AppPopoverHelp チェックを入れた公開範囲・レーティングが設定された投稿ページに対して、検索避けのmetaタグを挿入します。
        AppInput.my-4(
          label="リアクション",
          type="radio",
          v-model="input.settings.postDefault.enableReaction",
          :options="enableReactionOptions"
        )
          template(#label)
            span リアクション
            AppPopoverHelp 「受け付ける」に設定すると、投稿ページで閲覧者が絵文字を使ったリアクションを送信できるようになります。
        .flex.flex-col.my-4
          AppLabel
            span リアクションに利用する絵文字
            AppPopoverHelp
              | 「利用する絵文字を選択」すると、その絵文字のみがリアクションに利用できるようになります。
              br
              | 「利用しない絵文字を選択」すると、その絵文字以外の全てがリアクションに利用できるようになります。
              br
              | 両方設定すると、「利用する絵文字」から「利用しない絵文字」を除外した絵文字がリアクションに利用できるようになります。
          .md_grid.gap-4.grid-cols-2
            AppInputEmoji(
              v-model="input.settings.postDefault.allowedEmojis"
            )
              template(#button)
                AppButton(
                  color="blue",
                  :icon="faSmile"
                ) 利用する絵文字を選択
            AppInputEmoji.mt-4.md_mt-0(
              v-model="input.settings.postDefault.deniedEmojis"
            )
              template(#button)
                AppButton(
                  color="blue",
                  :icon="faBan"
                ) 利用しない絵文字を選択
        AppInput.my-4(
          type="radio",
          v-model="input.settings.postDefault.enableTwitterShare",
          :options="enableTwitterShareOptions"
        )
          template(#label)
            span Twitterシェア
            AppPopoverHelp 「有効」に設定すると、投稿ページにシェアボタンが表示され、Twitterカードが有効になります。
      .text-center
        AppButton(
          type="submit",
          color="blue",
          :icon="faCheck",
          :indeterminate="sending",
          :disabled="invalid || sending"
        ) 保存
</template>

<script lang="ts">
import { defineComponent, reactive, useFetch, toRefs } from 'nuxt-composition-api'
import VueScrollTo from 'vue-scrollto'
import { faCheck, faSmile, faBan } from '@fortawesome/free-solid-svg-icons'

import { useStore } from '~/store'
import AppLoadingOverlay from '~/components/atoms/AppLoadingOverlay.vue'
import AppSection from '~/components/atoms/AppSection.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppLabel from '~/components/atoms/AppLabel.vue'
import AppInput from '~/components/molecules/AppInput.vue'
import AppInputEmoji from '~/components/molecules/AppInputEmoji.vue'
import AppPopoverHelp from '~/components/molecules/AppPopoverHelp.vue'

export default defineComponent({
  middleware: ['auth'],
  components: {
    AppLoadingOverlay,
    AppSection,
    AppLabel,
    AppInput,
    AppButton,
    AppInputEmoji,
    AppPopoverHelp
  },
  setup () {
    const store = useStore()

    const localState = reactive({
      input: {
        settings: {
          ...store.setting.data.value!
        },
        user: {
          password: '',
          ...store.session.user.value!
        }
      },
      sending: false
    })

    useFetch(async () => {
      await store.setting.load()
      localState.input.settings = {
        ...store.setting.data.value!
      }
    })

    const onSubmit = async () => {
      localState.sending = true
      await store.setting.save(localState.input)
      await store.session.load()
      localState.sending = false
      VueScrollTo.scrollTo('#top')
      store.toast.push({
        type: 'success',
        message: '保存しました'
      })
    }

    return {
      store,
      ...toRefs(localState),
      onSubmit,
      denyRobotOptions: [
        { label: 'する', value: true },
        { label: 'しない', value: false }
      ],
      enableFeedOptions: [
        { label: '配信する', value: true },
        { label: '配信しない', value: false }
      ],
      denyRobotScopeOptions: [
        { label: '全体公開', value: 'public' },
        { label: 'パスワード', value: 'password' },
        { label: '閲覧注意', value: 'nsfw' },
        { label: 'R-18', value: 'r18' }
      ],
      enableReactionOptions: [
        { label: '受け付ける', value: true },
        { label: '受け付けない', value: false }
      ],
      enableTwitterShareOptions: [
        { label: '表示する', value: true },
        { label: '表示しない', value: false }
      ],
      faCheck,
      faSmile,
      faBan
    }
  }
})
</script>
