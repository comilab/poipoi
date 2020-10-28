import axiosMock from 'axios'
import { mocked } from 'ts-jest/utils'
import { Ref } from '@vue/composition-api'

import useApi from '~/composables/use-api'
import User from '~/models/User'
import Pagination from '~/models/Pagination'
import userFactory from '~/test/factories/user'
import paginationFactory from '~/test/factories/pagination'

jest.mock('axios')

describe('composables/use-api', () => {
  let baseUrl: string
  let model: typeof User

  beforeEach(() => {
    baseUrl = '/users'
    model = User
  })

  describe('index', () => {
    let index: ReturnType<typeof useApi>['index']
    let indexing: ReturnType<typeof useApi>['indexing']
    let items: ReturnType<typeof useApi>['items']
    let pagination: ReturnType<typeof useApi>['pagination']
    let data: any

    beforeEach(() => {
      const api = useApi(baseUrl, model)
      index = api.index
      indexing = api.indexing
      items = api.items
      pagination = api.pagination

      data = {
        data: [],
        meta: paginationFactory.build()
      }

      mocked(axiosMock.get).mockResolvedValueOnce({ data })
    })

    test('GET baseUrl', async () => {
      const params = { foo: 'bar' }

      await index(params)

      expect(axiosMock.get).toBeCalledWith(baseUrl, { params })
    })

    test('アクセス中のみindexing = true', (done) => {
      expect(indexing.value).toBeFalsy()

      index()
        .then(() => {
          expect(indexing.value).toBeFalsy()
          done()
        })

      expect(indexing.value).toBeTruthy()
    })

    test('itemsをセット', async () => {
      data.data = userFactory.buildList(2)

      await index()

      expect(items.value).toHaveLength(2)
      expect(items.value[0]).toBeInstanceOf(model)
    })

    test('paginationをセット', async () => {
      await index()

      expect(pagination.value).toBeTruthy()
      expect(pagination.value).toBeInstanceOf(Pagination)
    })
  })

  describe('show', () => {
    let show: ReturnType<typeof useApi>['show']
    let showing: ReturnType<typeof useApi>['showing']
    let item: Ref<User|null>

    beforeEach(() => {
      const api = useApi(baseUrl, model)
      show = api.show
      showing = api.showing
      item = api.item

      mocked(axiosMock.get).mockImplementationOnce((url: string) => {
        return Promise.resolve({
          data: userFactory.build({
            id: parseInt(url.replace(`${baseUrl}/`, ''))
          })
        })
      })
    })

    test('GET baseUrl/{id}', async () => {
      await show(1)

      expect(axiosMock.get).toBeCalledWith(`${baseUrl}/1`)
    })

    test('アクセス中のみshowing = true', (done) => {
      expect(showing.value).toBeFalsy()

      show(1)
        .then(() => {
          expect(showing.value).toBeFalsy()
          done()
        })

      expect(showing.value).toBeTruthy()
    })

    test('itemにセット', async () => {
      await show(1)

      expect(item.value).toBeInstanceOf(model)
      expect(item.value!.id).toBe(1)
    })
  })

  describe('create', () => {
    let create: ReturnType<typeof useApi>['create']
    let creating: ReturnType<typeof useApi>['creating']
    let item: Ref<User|null>

    beforeEach(() => {
      const api = useApi(baseUrl, model)
      create = api.create
      creating = api.creating
      item = api.item

      mocked(axiosMock.post).mockImplementationOnce((_url: string, payload: any) => {
        return Promise.resolve({
          data: userFactory.build({
            ...payload
          })
        })
      })
    })

    test('POST baseUrl', async () => {
      const payload = {
        foo: 'bar'
      }

      await create(payload)

      expect(axiosMock.post).toBeCalledWith(baseUrl, payload)
    })

    test('アクセス中のみcreating = true', (done) => {
      expect(creating.value).toBeFalsy()

      create(1)
        .then(() => {
          expect(creating.value).toBeFalsy()
          done()
        })

      expect(creating.value).toBeTruthy()
    })

    test('itemにセット', async () => {
      const payload = {
        id: 1
      }

      await create(payload)

      expect(item.value).toBeInstanceOf(model)
      expect(item.value!.id).toBe(1)
    })
  })

  describe('update', () => {
    let initialItem: User
    let update: ReturnType<typeof useApi>['update']
    let updating: ReturnType<typeof useApi>['updating']
    let item: Ref<User|null>

    beforeEach(() => {
      initialItem = userFactory.build()
      const api = useApi(baseUrl, model, initialItem)
      update = api.update
      updating = api.updating
      item = api.item

      mocked(axiosMock.put).mockImplementationOnce((_url: string, payload: any) => {
        return Promise.resolve({
          data: userFactory.build({
            ...initialItem,
            ...payload
          })
        })
      })
    })

    test('PUT baseUrl/{id}', async () => {
      const payload = {
        foo: 'bar'
      }

      await update(payload)

      expect(axiosMock.put).toBeCalledWith(`${baseUrl}/${initialItem.id}`, payload)
    })

    test('アクセス中のみupdating = true', (done) => {
      expect(updating.value).toBeFalsy()

      update()
        .then(() => {
          expect(updating.value).toBeFalsy()
          done()
        })

      expect(updating.value).toBeTruthy()
    })

    test('itemにセット', async () => {
      const payload = {
        email: 'test@example.com'
      }

      expect(item.value!.email).not.toBe(payload.email)

      await update(payload)

      expect(item.value).toBeInstanceOf(model)
      expect(item.value!.email).toBe(payload.email)
    })
  })

  describe('destroy', () => {
    let initialItem: User
    let destroy: ReturnType<typeof useApi>['destroy']
    let destroying: ReturnType<typeof useApi>['destroying']
    let item: Ref<User|null>

    beforeEach(() => {
      initialItem = userFactory.build()
      const api = useApi(baseUrl, model, initialItem)
      destroy = api.destroy
      destroying = api.destroying
      item = api.item

      mocked(axiosMock.delete).mockResolvedValueOnce({})
    })

    test('DELETE baseUrl/{id}', async () => {
      const payload = {
        foo: 'bar'
      }

      await destroy(payload)

      expect(axiosMock.delete).toBeCalledWith(`${baseUrl}/${initialItem.id}`, payload)
    })

    test('アクセス中のみdestroying = true', (done) => {
      expect(destroying.value).toBeFalsy()

      destroy()
        .then(() => {
          expect(destroying.value).toBeFalsy()
          done()
        })

      expect(destroying.value).toBeTruthy()
    })

    test('itemを空にする', async () => {
      expect(item.value).toBeInstanceOf(model)

      await destroy()

      expect(item.value).toBeNull()
    })
  })
})
