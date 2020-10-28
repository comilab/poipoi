import axiosMock from 'axios'
import { mocked } from 'ts-jest/utils'

import sessionStore from '~/store/session'
import User from '~/models/User'

jest.mock('axios')

describe('store/session', () => {
  let store: ReturnType<typeof sessionStore>

  beforeEach(() => {
    store = sessionStore()
  })

  describe('isLogin', () => {
    test('userがあればtrue', () => {
      store.user.value = new User({})

      expect(store.isLogin.value).toBeTruthy()
    })

    test('userがなければfalse', () => {
      store.user.value = null

      expect(store.isLogin.value).toBeFalsy()
    })
  })

  describe('create', () => {
    const query = { foo: 'bar' }

    beforeEach(() => {
      mocked(axiosMock.get).mockResolvedValueOnce({ data: {} })
      mocked(axiosMock.post).mockResolvedValueOnce({ data: {} })
    })

    test('GET /sanctum/csrf-cookie', async () => {
      await store.create(query)

      expect(axiosMock.get).toBeCalledWith('/sanctum/csrf-cookie', {
        baseURL: process.env.apiUrl
      })
    })

    test('POST /sessions', async () => {
      await store.create(query)

      expect(axiosMock.post).toBeCalledWith('/sessions', {
        ...query,
        device_name: 'poipoi-web'
      })
    })
  })

  describe('load', () => {
    const data = { id: 1 }

    beforeEach(() => {
      mocked(axiosMock.get).mockResolvedValueOnce({ data })
    })

    test('GET /sessions', async () => {
      await store.load()

      expect(axiosMock.get).toBeCalledWith('/sessions')
    })

    test('成功した場合はユーザデータをセット', async () => {
      await store.load()

      expect(store.user.value).toBeInstanceOf(User)
      expect(store.user.value!.id).toBe(data.id)
    })

    test('失敗した場合はユーザデータを空にする', async () => {
      mocked(axiosMock.get).mockReset().mockRejectedValueOnce(new Error())
      store.user.value = new User({})

      await store.load()

      expect(store.user.value).toBeNull()
    })
  })

  describe('destroy', () => {
    beforeEach(() => {
      mocked(axiosMock.delete).mockResolvedValueOnce({})
    })

    test('DELETE /sessions/poipoi-web', async () => {
      await store.destroy()

      expect(axiosMock.delete).toBeCalledWith('/sessions/poipoi-web')
    })

    test('ユーザデータを空にする', async () => {
      store.user.value = new User({})

      await store.destroy()

      expect(store.user.value).toBeNull()
    })
  })
})
