import { defineComponent, provide, inject } from 'nuxt-composition-api'
import { InjectionKey } from '@vue/composition-api'

import sessionStore from '~/store/session'
import settingStore from '~/store/setting'
import toastStore from '~/store/toast'

type Store = {
  session: ReturnType<typeof sessionStore>
  setting: ReturnType<typeof settingStore>
  toast: ReturnType<typeof toastStore>
}

const makeStore = () => {
  return {
    session: sessionStore(),
    setting: settingStore(),
    toast: toastStore()
  }
}

export const key: InjectionKey<Store> = Symbol('Store')

export const store: Store = makeStore()

export const StoreProvider = defineComponent({
  setup () {
    provide(key, store)
  },
  render (h) {
    return h('div', this.$slots.default)
  }
})

export const useStore = () => inject(key)!

export const resetStore = () => {
  Object.assign(store, makeStore())
}

export const actions = {
  async nuxtClientInit () {
    try {
      await Promise.all([
        store.session.load(),
        store.setting.load()
      ])
    } catch (error) {
      //
    }
  }
}
