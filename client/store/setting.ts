import { reactive, toRefs } from 'nuxt-composition-api'
import axios from 'axios'

import useApi from '~/composables/use-api'
import Setting from '~/models/Setting'

export default function sessionStore () {
  const api = useApi('/settings', Setting)

  const state = reactive({
    data: null as Setting|null
  })

  async function load () {
    const { data } = await axios.get('/settings')
    setData(new Setting(data))
  }

  async function save (data: any) {
    await api.save(data)
    setData(api.item.value!)
  }

  function setData (data: Setting|null) {
    state.data = data
  }

  return {
    ...toRefs(state),
    load,
    save,
    setData
  }
}
