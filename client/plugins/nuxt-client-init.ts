import { Plugin } from '@nuxt/types'

const plugin: Plugin = async (context) => {
  await context.store.dispatch('nuxtClientInit')
}

export default plugin
