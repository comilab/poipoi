import axiosMock from 'axios'
import { ref } from 'nuxt-composition-api'
import { mocked } from 'ts-jest/utils'

import settingStore from '~/store/setting'
import Setting from '~/models/Setting'
import settingFactory from '~/test/factories/setting'
import useApi from '~/composables/use-api'

jest.mock('axios')
jest.mock('~/composables/use-api')

describe('store/setting', () => {
  let store: ReturnType<typeof settingStore>

  beforeEach(() => {
    store = settingStore()
  })

  describe('load', () => {
    beforeEach(() => {
      mocked(axiosMock.get).mockResolvedValueOnce({ data: settingFactory.build() })
    })

    test('GET /settings', async () => {
      await store.load()

      expect(axiosMock.get).toBeCalledWith('/settings')
    })

    test('設定データをセット', async () => {
      store.setData(null)
      await store.load()

      expect(store.data.value).toBeInstanceOf(Setting)
    })
  })

  describe('save', () => {
    let data: any
    let useApiMock: any

    beforeEach(() => {
      data = {}
      useApiMock = {
        save: jest.fn(),
        item: ref(settingFactory.build())
      }
      mocked(useApi).mockImplementationOnce(() => useApiMock)

      store = settingStore()
    })

    test('call api.mock', async () => {
      await store.save(data)

      expect(useApiMock.save).toBeCalledWith(data)
    })

    test('設定データをセット', async () => {
      store.setData(null)
      await store.save(data)

      expect(store.data.value).toBe(useApiMock.item.value)
    })
  })

  describe('setData', () => {
    test('データをセット', () => {
      store.setData(null)
      expect(store.data.value).toBeNull()

      const setting = settingFactory.build()
      store.setData(setting)
      expect(store.data.value).toBe(setting)
    })
  })
})
