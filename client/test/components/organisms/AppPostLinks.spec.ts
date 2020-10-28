import { fireEvent, render, waitFor } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import { ref } from 'nuxt-composition-api'

import AppPostLinks from '~/components/organisms/AppPostLinks.vue'
import * as store from '~/store'
import settingFactory from '~/test/factories/setting'
import postFactory from '~/test/factories/post'
import userFactory from '~/test/factories/user'
import usePostsApi from '~/composables/use-posts-api'

jest.mock('~/composables/use-posts-api')

describe('components/organisms/AppPostLinks', () => {
  let options: any
  let postsApiMock: any

  beforeEach(() => {
    options = {
      props: {
        post: postFactory.build()
      },
      stubs: {
        FontAwesomeIcon: true,
        NuxtLink: true
      }
    }
    store.store.setting.setData(settingFactory.build())
    jest.spyOn(store, 'useStore').mockReturnValue(store.store)

    postsApiMock = {
      destroy: jest.fn().mockResolvedValue(null),
      destroying: ref(false)
    }
    mocked(usePostsApi).mockReturnValue({ ...postsApiMock })
  })

  test('renders correctly', () => {
    store.store.session.setUser(userFactory.build())
    store.store.setting.setData(settingFactory.build({
      siteTitle: 'site-title'
    }))
    options.props.post = postFactory.build({
      url: 'https://example.com',
      caption: 'caption',
      actualEnableTwitterShare: true
    })
    const { container } = render(AppPostLinks, options)

    expect(container).toMatchSnapshot()
  })

  describe('AppTwitterShareButton', () => {
    test('actualEnableTwitterShareがtrueなら表示', async () => {
      options.props.post = postFactory.build({
        actualEnableTwitterShare: false
      })
      const { queryByRole, updateProps } = render(AppPostLinks, options)

      expect(queryByRole('link', { name: 'Tweet' })).not.toBeInTheDocument()

      await updateProps({
        post: postFactory.build({
          actualEnableTwitterShare: true
        })
      })
      expect(queryByRole('link', { name: 'Tweet' })).toBeInTheDocument()
    })
  })

  describe('編集', () => {
    test('ログイン中のみ表示', async () => {
      store.store.session.setUser(null)
      const { queryByText } = render(AppPostLinks, options)
      expect(queryByText('編集')).not.toBeInTheDocument()

      store.store.session.setUser(userFactory.build())
      await waitFor(() => {
        expect(queryByText('編集')).toBeInTheDocument()
      })
    })
  })

  describe('削除', () => {
    beforeEach(() => {
      store.store.session.setUser(userFactory.build())
    })

    test('ログイン中のみ表示', async () => {
      const { queryByRole } = render(AppPostLinks, options)
      expect(queryByRole('button', { name: '削除' })).toBeInTheDocument()

      store.store.session.setUser(null)
      await waitFor(() => {
        expect(queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
      })
    })

    test('クリックするとモーダルを表示', async () => {
      const { getByRole, getByText } = render(AppPostLinks, options)

      await fireEvent.click(getByRole('button', { name: '削除' }))

      expect(getByText('この投稿を削除してよろしいですか？')).toBeInTheDocument()
    })

    test('モーダル内でキャンセルを押すと閉じる', async () => {
      const { getByRole, queryByText } = render(AppPostLinks, options)

      await fireEvent.click(getByRole('button', { name: '削除' }))
      await fireEvent.click(getByRole('button', { name: 'キャンセル' }))

      expect(queryByText('この投稿を削除してよろしいですか？')).not.toBeInTheDocument()
    })

    test('モーダル内で削除するを押すと削除処理を実行', async () => {
      const { getByRole } = render(AppPostLinks, options)

      await fireEvent.click(getByRole('button', { name: '削除' }))
      await fireEvent.click(getByRole('button', { name: '削除する' }))

      expect(postsApiMock.destroy).toBeCalled()
    })

    test('削除中はモーダル内ボタンを押せない', async () => {
      const { getByRole } = render(AppPostLinks, options)

      await fireEvent.click(getByRole('button', { name: '削除' }))

      expect(getByRole('button', { name: '削除する' })).not.toHaveAttribute('disabled')
      expect(getByRole('button', { name: 'キャンセル' })).not.toHaveAttribute('disabled')

      postsApiMock.destroying.value = true

      await waitFor(() => {
        expect(getByRole('button', { name: '削除する' })).toHaveAttribute('disabled')
        expect(getByRole('button', { name: 'キャンセル' })).toHaveAttribute('disabled')
      })
    })

    test('削除中はモーダルを閉じられない', async () => {
      const { queryByLabelText, getByRole } = render(AppPostLinks, options)

      await fireEvent.click(getByRole('button', { name: '削除' }))

      expect(queryByLabelText('close')).toBeInTheDocument()
      expect(getByRole('button', { name: 'キャンセル' })).not.toHaveAttribute('disabled')

      postsApiMock.destroying.value = true

      await waitFor(() => {
        expect(queryByLabelText('close')).not.toBeInTheDocument()
      })
    })

    test('処理終了後はdeletedイベントを発火', async () => {
      const { getByRole, emitted } = render(AppPostLinks, options)

      await fireEvent.click(getByRole('button', { name: '削除' }))
      await fireEvent.click(getByRole('button', { name: '削除する' }))

      await waitFor(() => {
        expect(emitted().deleted).toHaveLength(1)
      })
    })
  })
})
