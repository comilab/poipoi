import { reactive, toRefs, computed } from 'nuxt-composition-api'
import axios from 'axios'

import User from '~/models/User'

export default function sessionStore () {
  const state = reactive({
    user: null as User|null
  })

  const isLogin = computed(() => !!state.user)

  async function create (query: any) {
    await axios.get('/sanctum/csrf-cookie', {
      baseURL: process.env.apiUrl
    })
    await axios.post('/sessions', {
      ...query,
      device_name: 'poipoi-web'
    })
  }

  async function load () {
    try {
      const { data } = await axios.get('/sessions')
      setUser(new User(data))
    } catch (error) {
      setUser(null)
    }
  }

  async function destroy () {
    try {
      await axios.delete('/sessions/poipoi-web')
    } catch (error) {
      //
    }
    setUser(null)
  }

  function setUser (user: User|null) {
    state.user = user
  }

  return {
    ...toRefs(state),
    isLogin,
    create,
    load,
    destroy,
    setUser
  }
}
