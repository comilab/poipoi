import { mocked } from 'ts-jest/utils'
import { render } from '@testing-library/vue'
import { defineComponent } from 'nuxt-composition-api'

import { store, StoreProvider, useStore, actions } from '~/store'

describe('store/index', () => {
  test('store', () => {
    expect(store.session).toBeDefined()
    expect(store.setting).toBeDefined()
    expect(store.toast).toBeDefined()
  })

  test('StoreProvider, useStore', () => {
    let injectedStore

    const inner = defineComponent({
      setup () {
        injectedStore = useStore()
      },
      template: '<div>inner</div>'
    })

    const wrapper = defineComponent({
      components: { StoreProvider, inner },
      template: '<StoreProvider><inner /></StoreProvider>'
    })

    const { container } = render(wrapper)

    expect(container).toMatchSnapshot()
    expect(injectedStore).toBe(store)
  })

  describe('actions', () => {
    describe('nuxtClientInit', () => {
      let nuxtClientInit: typeof actions.nuxtClientInit

      beforeEach(() => {
        nuxtClientInit = actions.nuxtClientInit
        jest.spyOn(store.session, 'load').mockResolvedValue()
        jest.spyOn(store.setting, 'load').mockResolvedValue()
      })

      test('calls store.session.load', async () => {
        await nuxtClientInit()

        expect(store.session.load).toBeCalled()
      })

      test('calls store.setting.load', async () => {
        await nuxtClientInit()

        expect(store.setting.load).toBeCalled()
      })

      test('エラーが起きても何もしない', () => {
        mocked(store.session.load).mockRejectedValue(new Error())

        expect(async () => {
          await nuxtClientInit()
        }).not.toThrow()
      })
    })
  })
})
