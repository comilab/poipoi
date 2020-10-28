import { fireEvent, render, waitFor, within } from '@testing-library/vue'
import * as NuxtCompositionApi from 'nuxt-composition-api'
import { ref } from '@vue/composition-api'

import AppGlobalHeader from '~/components/organisms/AppGlobalHeader.vue'
import * as store from '~/store'
import settingFactory from '~/test/factories/setting'
import userFactory from '~/test/factories/user'

describe('components/organisms/AppGlobalHeader', () => {
  let options: any
  let contextMock: any

  beforeEach(() => {
    options = {
      stubs: {
        FontAwesomeIcon: true,
        NuxtLink: true
      }
    }

    store.store.setting.setData(settingFactory.build())
    jest.spyOn(store, 'useStore').mockReturnValue(store.store)

    contextMock = {
      redirect: jest.fn(),
      route: ref<any>({
        query: {}
      })
    }
    jest.spyOn(NuxtCompositionApi, 'useContext').mockReturnValue(contextMock)
  })

  test('renders correctly', () => {
    store.store.setting.setData(settingFactory.build({
      siteTitle: 'site-title'
    }))
    const { container } = render(AppGlobalHeader, options)

    expect(container).toMatchSnapshot()
  })

  describe('検索', () => {
    test('送信するとリダイレクトする', async () => {
      const { getByRole } = render(AppGlobalHeader, options)
      await fireEvent.update(getByRole('searchbox'), 'foo')
      await fireEvent.submit(getByRole('search'))

      expect(contextMock.redirect).toBeCalledWith(200, '/', { keyword: 'foo' })
    })

    test('route.query.keywordの値を入力欄にセット', async () => {
      const { getByRole } = render(AppGlobalHeader, options)

      expect(getByRole('searchbox')).toHaveValue('')

      contextMock.route.value = {
        query: { keyword: 'foo' }
      }

      await waitFor(() => {
        expect(getByRole('searchbox')).toHaveValue('foo')
      })
    })
  })

  describe('ログアウト', () => {
    beforeEach(() => {
      jest.spyOn(store.store.session, 'destroy').mockResolvedValue()
      store.store.session.setUser(userFactory.build())
    })

    test('クリックするとログアウト処理を実行', async () => {
      const { getByRole } = render(AppGlobalHeader, options)
      await fireEvent.click(getByRole('button', { name: 'ログアウト' }))

      expect(store.store.session.destroy).toBeCalled()
    })

    test('処理中はdisabled, indeterminate', async () => {
      const { getByRole } = render(AppGlobalHeader, options)
      await fireEvent.click(getByRole('button', { name: 'ログアウト' }))

      expect(getByRole('button', { name: 'ログアウト' })).toHaveAttribute('disabled')
      expect(within(getByRole('button', { name: 'ログアウト' })).getByRole('status')).toBeInTheDocument()
    })

    test('処理後にリダイレクト', async () => {
      const { getByRole } = render(AppGlobalHeader, options)
      await fireEvent.click(getByRole('button', { name: 'ログアウト' }))

      await waitFor(() => {
        expect(contextMock.redirect).toBeCalledWith(200, '/')
      })
    })
  })
})
