import { reactive, toRefs } from 'nuxt-composition-api'
import axios from 'axios'

import Pagination from '~/models/Pagination'

export type Model<T> = {
  id?: any
} & T

export type State<T> = {
  item: Model<T>|null
  items: T[]
  pagination: Pagination|null
  indexing: boolean
  showing: boolean
  creating: boolean
  updating: boolean
  saving: boolean
  destroying: boolean
}

export default function useApi<T> (
  baseUrl: string,
  ModelClass: new (data: any) => Model<T>,
  item: Model<T>|null = null
) {
  const state = reactive({
    item,
    items: [] as T[],
    pagination: null as Pagination|null,
    indexing: false,
    showing: false,
    creating: false,
    updating: false,
    saving: false,
    destroying: false
  }) as State<T>

  async function index (params: any = {}) {
    state.indexing = true
    try {
      const { data } = await axios.get(baseUrl, { params })
      state.items = data.data.map((item: any) => new ModelClass(item))
      state.pagination = new Pagination(data.meta)
    } finally {
      state.indexing = false
    }
  }

  async function show (id: any) {
    state.showing = true
    try {
      const { data } = await axios.get(`${baseUrl}/${id}`)
      state.item = new ModelClass(data)
    } finally {
      state.showing = false
    }
  }

  async function create (payload: any = {}) {
    state.creating = true
    try {
      const { data } = await axios.post(baseUrl, payload)
      state.item = new ModelClass(data)
    } finally {
      state.creating = false
    }
  }

  async function update (payload: any = {}) {
    if (state.item?.id) {
      state.updating = true
      try {
        const { data } = await axios.put(`${baseUrl}/${state.item.id}`, payload)
        state.item = new ModelClass(data)
      } finally {
        state.updating = false
      }
    }
  }

  async function save (payload: any = {}) {
    state.saving = true
    try {
      if (state.item?.id) {
        await update(payload)
      } else {
        await create(payload)
      }
    } finally {
      state.saving = false
    }
  }

  async function destroy (payload: any = {}) {
    if (state.item?.id) {
      state.destroying = true
      try {
        await axios.delete(`${baseUrl}/${state.item.id}`, payload)
        state.item = null
      } finally {
        state.destroying = false
      }
    }
  }

  return {
    ...toRefs(state),
    index,
    show,
    create,
    update,
    save,
    destroy
  }
}
