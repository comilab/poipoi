import { Middleware } from '@nuxt/types'
import { store } from '~/store'

const middleware: Middleware = async ({ redirect }) => {
  await store.session.load()
  if (!store.session.user.value) {
    redirect(401, '/login')
    store.toast.push({
      type: 'warning',
      message: 'ログインしてください'
    })
  }
}

export default middleware
