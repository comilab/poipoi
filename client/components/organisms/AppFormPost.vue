<template lang="pug">
ValidationObserver(v-slot="{ invalid }")
  form.max-w-screen-md.mx-auto(
    @submit.prevent="onSubmit",
    name="post"
  )
    AppSection
      AppInput.my-4(
        label="タイトル",
        type="text",
        v-model="input.title",
        :rules="{ max: 32 }"
      )
      AppInput.my-4(
        label="キャプション",
        type="textarea",
        v-model="input.caption",
        :rules="{ max: 200 }",
        placeholder="#を付けるとタグになります"
      )
    AppSection(title="画像")
      AppInputImages(
        ref="imagesInput",
        :images="input.images",
        @uploaded="onUploaded"
      )
      AppInput.my-4(
        type="radio",
        v-model="input.showImagesList",
        :options="showImagesListOptions"
      )
        template(#label)
          span 画像の一覧を表示
          AppPopoverHelp 「表示しない」に設定すると、投稿ページに画像の一覧を表示しません。サムネイル表示・本文への挿入のみに使用する場合に選択してください。
      AppInput.my-4(
        label="1枚目の画像をサムネイルとして表示",
        type="radio",
        v-model="input.showThumbnail",
        :options="showThumbnailOptions"
      )
        template(#label)
          span 1枚目の画像をサムネイルとして表示
          AppPopoverHelp 「表示する」に設定すると、1枚目の画像がトップページ・検索結果の一覧およびTwitterカードにサムネイルとして表示されるようになります。
    AppSection
      template(#title)
        span 本文
        AppPopoverHelp
          p 以下の記法が使えます。
          ul.list-disc.pl-6
            li [newpage] : 改ページ
            li [chapter:章タイトル] : 章タイトルの挿入
            li [image:画像の番号] : アップロード画像の挿入
            li [jump:ページ番号] : 指定ページヘのリンク
            li [[jumpuri:リンクテキスト&gt;リンクURL]] : 指定URLへのリンク
            li [[rb:文字&gt;ルビ]] : ルビを振る
      AppInput.my-4(
        name="本文",
        type="textarea",
        v-model="input.text",
        :rules="{ max: 300000 }"
      )
    AppSection(title="オプション")
      AppInput.my-4(
        label="公開範囲",
        type="radio",
        v-model="input.scope",
        :options="scopeOptions"
      )
      AppInput.my-4(
        v-if="input.scope === 'password'",
        label="パスワード",
        type="text",
        v-model="input.password",
        :rules="{ required: true, alpha_dash: true }"
      )
      .flex.flex-col.my-4
        AppLabel
          span 公開期間
          AppPopoverHelp 設定した期間内のみ投稿ページが閲覧可能になります。開始日時のみ設定したい場合は終了日時を空欄にしてください（終了時間のみ設定したい場合も同様です）。
        .flex.items-start.flex-wrap
          AppInput.mb-4.md_mb-0(
            vid="publishStart"
            type="datetime-local",
            v-model="input.publishStart",
            :rules="{ start_lt_end: ['@publishStart', '@publishEnd'] }",
            hide-errors
          )
          .self-center.mx-2 〜
          AppInput(
            vid="publishEnd",
            type="datetime-local",
            v-model="input.publishEnd",
            :rules="{ start_lt_end: ['@publishStart', '@publishEnd'] }"
          )
      AppInput.my-4(
        type="radio",
        v-model="input.rating",
        :options="ratingOptions"
      )
        template(#label)
          span レーティング
          AppPopoverHelp 「閲覧注意」もしくは「R-18」に設定すると、画像・本文を表示する前にワンクッション画面が表示されるようになります。
      AppInput.my-4(
        type="radio",
        v-model="input.pinned",
        :options="pinnedOptions"
      )
        template(#label)
          span トップページの先頭に固定
          AppPopoverHelp 「固定する」に設定すると、トップページ・検索での一覧表示時に、この投稿が先頭に表示されるようになります。
      AppInput.my-4(
        type="radio"
        v-model="input.denyRobot",
        :options="denyRobotOptions"
      )
        template(#label)
          span 検索避け
          AppPopoverHelp
            |  「する」に設定すると、投稿ページに検索避けのmetaタグを挿入します。
            br
            | 現在のデフォルト設定は「{{ defaultDenyRobotLabel }}」です。
      AppInput.my-4(
        type="radio"
        v-model="input.enableReaction",
        :options="enableReactionOptions"
      )
        template(#label)
          span リアクション
          AppPopoverHelp
            |  「受け付ける」に設定すると、投稿ページで閲覧者が絵文字を使ったリアクションを送信できるようになります。
            br
            | 現在のデフォルト設定は「{{ defaultEnableReactionLabel }}」です。
      .flex.flex-col.my-4
        AppLabel
          span リアクションに利用する絵文字
          AppPopoverHelp
            | 「利用する絵文字を選択」すると、その絵文字のみがリアクションに利用できるようになります。
            br
            | 「利用しない絵文字を選択」すると、その絵文字以外の全てがリアクションに利用できるようになります。
            br
            | 両方設定すると、「利用する絵文字」から「利用しない絵文字」を除外した絵文字がリアクションに利用できるようになります。
        AppInput.mb-2(
          type="checkbox",
          v-model="useDefaultEmojis",
          checkbox-label="デフォルト設定を使用"
        )
        .md_grid.gap-4.grid-cols-2
          AppInputEmoji(
            v-model="currentAllowedEmojis",
           :disabled="useDefaultEmojis"
          )
            template(#button)
              AppButton(
                color="blue",
                :icon="faSmile",
                :disabled="useDefaultEmojis"
              ) 利用する絵文字を選択
          AppInputEmoji.mt-4.md_mt-0(
            v-model="currentDeniedEmojis",
           :disabled="useDefaultEmojis"
          )
            template(#button)
              AppButton(
                color="blue",
                :icon="faBan",
                :disabled="useDefaultEmojis"
              ) 利用しない絵文字を選択
      AppInput.my-4(
        type="radio"
        v-model="input.enableTwitterShare",
        :options="enableTwitterShareOptions"
      )
        template(#label)
          span Twitterシェア
          AppPopoverHelp
            | 「有効」に設定すると、投稿ページにシェアボタンが表示され、Twitterカードが有効になります。
            br
            | 現在のデフォルト設定は「{{ defaultEnableTwitterShareLabel }}」です。
    .text-center
      AppButton(
        type="submit",
        color="blue",
        :icon="faCloudUploadAlt",
        :indeterminate="saving",
        :disabled="invalid || saving"
      ) 投稿する
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, toRefs } from 'nuxt-composition-api'
import dayjs from 'dayjs'
import { extend } from 'vee-validate'
import { faSmile, faBan, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons'

import { useStore } from '~/store'
import Post, { ScopeUnion, RatingUnion } from '~/models/Post'
import Image from '~/models/Image'
import usePostsApi from '~/composables/use-posts-api'
import AppSection from '~/components/atoms/AppSection.vue'
import AppLabel from '~/components/atoms/AppLabel.vue'
import AppButton from '~/components/atoms/AppButton.vue'
import AppButtonHelp from '~/components/atoms/AppButtonHelp.vue'
import AppInput from '~/components/molecules/AppInput.vue'
import AppInputImages from '~/components/molecules/AppInputImages.vue'
import AppInputEmoji from '~/components/molecules/AppInputEmoji.vue'
import AppPopoverHelp from '~/components/molecules/AppPopoverHelp.vue'

type LocalState = {
  input: Omit<Partial<Post>, 'images'> & {
    images: (string|Image)[]
  }
  useDefaultEmojis: boolean
  saving: boolean
}

const showImagesListOptions = [
  { label: '表示する', value: true },
  { label: '表示しない', value: false }
]
const showThumbnailOptions = [
  { label: '表示する', value: true },
  { label: '表示しない', value: false }
]
const scopeOptions = [
  { label: '全体公開', value: 'public' },
  { label: 'パスワード', value: 'password' },
  { label: '非公開', value: 'private' }
]
const ratingOptions = [
  { label: 'なし', value: null },
  { label: '閲覧注意', value: 'nsfw' },
  { label: 'R-18', value: 'r18' }
]
const pinnedOptions = [
  { label: '固定しない', value: false },
  { label: '固定する', value: true }
]
const denyRobotOptions = [
  { label: 'デフォルト', value: null },
  { label: 'する', value: true },
  { label: 'しない', value: false }
]
const enableReactionOptions = [
  { label: 'デフォルト', value: null },
  { label: '受け付ける', value: true },
  { label: '受け付けない', value: false }
]
const enableTwitterShareOptions = [
  { label: 'デフォルト', value: null },
  { label: '有効', value: true },
  { label: '無効', value: false }
]

export default defineComponent({
  components: {
    AppSection,
    AppLabel,
    AppInput,
    AppInputEmoji,
    AppButton,
    AppButtonHelp,
    AppInputImages,
    AppPopoverHelp
  },
  props: {
    post: {
      type: Post,
      required: false,
      default: null
    }
  },
  setup (props, { emit }) {
    const store = useStore()

    const { post, save } = usePostsApi(props.post)

    const imagesInput = ref<any>()

    const localState = reactive({
      input: {
        title: '',
        caption: '',
        showImagesList: true,
        text: '',
        scope: 'public' as ScopeUnion,
        password: '',
        publishStart: null as Date|null,
        publishEnd: null as Date|null,
        rating: null as RatingUnion,
        pinned: false,
        showThumbnail: true,
        denyRobot: null as boolean|null,
        enableReaction: null as boolean|null,
        allowedEmojis: null as string[]|null,
        deniedEmojis: null as string[]|null,
        enableTwitterShare: null as boolean|null,
        images: [] as (string|Image)[],
        ...(props.post || {})
      },
      useDefaultEmojis: !props.post?.allowedEmojis && !props.post?.deniedEmojis,
      saving: false
    })

    const defaultDenyRobotLabel = computed(() => {
      const denyRobotScope = store.setting.data.value!.postDefault.denyRobotScope
      const denyRobot = denyRobotScope.includes(localState.input.scope!) || denyRobotScope.includes(localState.input.rating!)
      return denyRobotOptions.find(option => option.value === denyRobot)!.label
    })

    const defaultEnableReactionLabel = computed(() => {
      return enableReactionOptions.find((option) => {
        return option.value === store.setting.data.value!.postDefault.enableReaction
      })!.label
    })

    const defaultEnableTwitterShareLabel = computed(() => {
      return enableTwitterShareOptions.find((option) => {
        return option.value === store.setting.data.value!.postDefault.enableTwitterShare
      })!.label
    })

    const currentAllowedEmojis = computed({
      get: () => {
        if (localState.useDefaultEmojis || !localState.input.allowedEmojis) {
          return store.setting.data.value!.postDefault.allowedEmojis
        }
        return localState.input.allowedEmojis
      },
      set: (emojis) => {
        localState.input.allowedEmojis = emojis
      }
    })

    const currentDeniedEmojis = computed({
      get: () => {
        if (localState.useDefaultEmojis || !localState.input.deniedEmojis) {
          return store.setting.data.value!.postDefault.deniedEmojis
        }
        return localState.input.deniedEmojis
      },
      set: (emojis) => {
        localState.input.deniedEmojis = emojis
      }
    })

    const onSubmit = () => {
      localState.saving = true
      imagesInput.value!.upload()
    }

    const onUploaded = async (files: (string|Image)[]) => {
      localState.input.images = files
      if (localState.useDefaultEmojis) {
        localState.input.allowedEmojis = null
        localState.input.deniedEmojis = null
      }

      await save(localState.input)
      emit('submitted', post.value)
    }

    extend('start_lt_end', {
      params: ['publishStart', 'publishEnd'],
      validate (_value: any, { publishStart, publishEnd }: any) {
        if (!publishStart || !publishEnd) {
          return true
        }
        return dayjs(publishStart).isBefore(publishEnd)
      },
      message: '終了日時は開始日時より後にしてください'
    })

    return {
      imagesInput,
      ...toRefs(localState),
      defaultDenyRobotLabel,
      defaultEnableReactionLabel,
      defaultEnableTwitterShareLabel,
      currentAllowedEmojis,
      currentDeniedEmojis,
      onSubmit,
      onUploaded,
      faSmile,
      faBan,
      faCloudUploadAlt,
      showImagesListOptions,
      showThumbnailOptions,
      scopeOptions,
      ratingOptions,
      pinnedOptions,
      denyRobotOptions,
      enableReactionOptions,
      enableTwitterShareOptions
    }
  }
})
</script>
