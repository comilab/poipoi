import { fireEvent, render } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import VueScrollTo from 'vue-scrollto'

import AppPostText from '~/components/organisms/AppPostText.vue'
import postFactory from '~/test/factories/post'
import useUniqId from '~/composables/use-uniq-id'

jest.mock('vue-scrollto')
jest.mock('~/composables/use-uniq-id')

describe('components/organisms/AppPostText', () => {
  let options: any
  let uniqIdMock: any

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

    uniqIdMock = {
      id: 'foo'
    }
    mocked(useUniqId).mockReturnValue(uniqIdMock)
  })

  test('renders correctly', () => {
    options.props.post = postFactory.build({
      text: 'ページ1[newpage]ページ2'
    })
    const { container } = render(AppPostText, options)

    expect(container).toMatchSnapshot()
  })

  describe('すべて表示', () => {
    beforeEach(() => {
      options.props.post = postFactory.build({
        text: 'ページ1[newpage]ページ2'
      })
    })

    test('複数ページになる場合のみ表示', async () => {
      const { queryByRole, updateProps } = render(AppPostText, options)

      expect(queryByRole('button', { name: /すべて表示/ })).toBeInTheDocument()

      await updateProps({
        post: postFactory.build({
          text: 'ページ1'
        })
      })
      expect(queryByRole('button', { name: /すべて表示/ })).not.toBeInTheDocument()
    })

    test('ボタンを押すと全てのページを表示', async () => {
      const { container, getByRole } = render(AppPostText, options)

      expect(container.querySelector('#foo-0')).toBeVisible()
      expect(container.querySelector('#foo-1')).not.toBeVisible()

      await fireEvent.click(getByRole('button', { name: /すべて表示/ }))

      expect(container.querySelector('#foo-1')).toBeVisible()
    })
  })

  describe('ページジャンプ', () => {
    beforeEach(() => {
      options.props.post = postFactory.build({
        text: '[jump:2][newpage]ページ2'
      })
    })

    test('リンクを押すと指定されたページにジャンプ', async () => {
      const { getByText, container } = render(AppPostText, options)

      await fireEvent.click(getByText('2ページ目へ'))

      expect(VueScrollTo.scrollTo).toHaveBeenCalledWith('#foo-1')
      expect(container.querySelector('#foo-1')).toBeVisible()
    })
  })
})
