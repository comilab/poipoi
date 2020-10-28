<template lang="pug">
header.bg-white.text-sm.lg_sticky.top-0.lg_shadow.z-40.px-2.xl_px-8.py-2
  .flex.flex-wrap.items-center
    .block.lg_hidden
      AppButton(
        to="/",
        color="blue",
        :icon="faHome"
      )
    .hidden.lg_block.ml-2
      h1.font-bold
        AppButton(
          to="/",
          color="blue",
          size="lg"
        ) {{ store.setting.data.siteTitle }}
    form.flex-auto.flex.items-center.ml-4.mr-8(
      @submit.prevent="search",
      role="search"
    )
      AppInput.flex-auto.w-20.sm_w-auto(
        type="search",
        v-model="input.keyword",
        placeholder="検索"
      )
      AppButton.ml-2(
        type="submit",
        color="white",
        :icon="faSearch",
        pill
      )
    .block.md_hidden.relative
      AppButton(
        color="white",
        :icon="faBars",
        pill,
        @click="showMenu = !showMenu"
      )
    nav.w-full.md_w-auto.overflow-hidden.md_overflow-visible(:class="{'h-0 md_h-auto': !showMenu}")
      ul.grid.gap-2.md_gap-0.divide-y.md_divide-y-0.md_flex.md_justify-end.pt-2.md_pt-0
        template(v-if="store.session.isLogin")
          li.md_ml-2
            AppButton.w-full.md_w-auto(
              color="white",
              :icon="faPencilAlt",
              to="/posts/new",
              pill
            ) 投稿
          li.relative.pt-2.md_pt-0.md_ml-2
            AppButton.w-full.md_w-auto(
              to="/notifications",
              color="white",
              :icon="faBell",
              pill
            ) お知らせ
          li.pt-2.md_pt-0.md_ml-2
            AppButton.w-full.md_w-auto(
              to="/settings",
              color="white",
              :icon="faCog",
              pill
            ) 設定
          li.pt-2.md_pt-0.md_ml-2
            AppButton.w-full.md_w-auto(
              color="white",
              :icon="faSignOutAlt",
              pill,
              :indeterminate="logoutSending",
              :disabled="logoutSending",
              @click="logout"
            ) ログアウト
        template(v-else)
          li.pt-2.md_pt-0.md_ml-2
            AppButton.w-full.md_w-auto(
              to="/login",
              color="white",
              :icon="faSignInAlt",
              pill
            ) ログイン
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, useContext, watch } from 'nuxt-composition-api'
import { faBars, faHome, faSearch, faPencilAlt, faBell, faCog, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import { useStore } from '~/store'
import AppButton from '~/components/atoms/AppButton.vue'
import AppInput from '~/components/molecules/AppInput.vue'

export default defineComponent({
  components: {
    AppInput,
    AppButton
  },
  setup () {
    const { route, redirect } = useContext()

    const store = useStore()

    const localState = reactive({
      input: {
        keyword: route.value.query.keyword || ''
      },
      showMenu: false,
      logoutSending: false
    })

    const search = () => {
      redirect(200, '/', {
        ...localState.input
      })
    }

    const logout = async () => {
      localState.logoutSending = true
      await store.session.destroy()
      store.toast.push({
        type: 'success',
        message: 'ログアウトしました'
      })
      redirect(200, '/')
    }

    watch(
      () => route.value.query.keyword,
      (keyword) => {
        localState.input.keyword = keyword
      }
    )

    return {
      store,
      ...toRefs(localState),
      search,
      logout,
      faBars,
      faHome,
      faSearch,
      faPencilAlt,
      faBell,
      faCog,
      faSignInAlt,
      faSignOutAlt
    }
  }
})
</script>

<style lang="postcss" scoped>
.top-half {
  top: 50%;
}

nav {
  & ul {
    & li {
      & > * {
        @apply justify-start;

        &.nuxt-link-active {
          @apply bg-gray-300;
        }

        @screen md {
          @apply justify-center;
        }
      }
    }
  }
}
</style>
