import { fireEvent, render, waitFor, within } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import { ref } from '@vue/composition-api'
import dayjs from 'dayjs'

import AppFormReaction from '~/components/organisms/AppFormReaction.vue'
import * as store from '~/store'
import useReactionsApi from '~/composables/use-reactions-api'
import settingFactory from '~/test/factories/setting'
import postFactory from '~/test/factories/post'
import Reaction from '~/models/Reaction'
import Pagination from '~/models/Pagination'
import reactionFactory from '~/test/factories/reaction'
import paginationFactory from '~/test/factories/pagination'
import useMockedComponent from '~/test/stubs/MockedComponent'
import userFactory from '~/test/factories/user'
import Post from '~/models/Post'

jest.mock('~/composables/use-reactions-api')

describe('components/organisms/AppFormReaction', () => {
  let options: any
  let reactionsApiMock: any

  beforeEach(() => {
    options = {
      props: {
        post: postFactory.build()
      },
      stubs: {
        FontAwesomeIcon: true,
        TwemojiPicker: true
      }
    }

    jest.spyOn(store, 'useStore').mockReturnValue(store.store)
    store.store.setting.setData(settingFactory.build())

    reactionsApiMock = {
      reaction: ref<Reaction|null>(null),
      reactions: ref<Reaction[]>([]),
      pagination: ref<Pagination|null>(null),
      index: jest.fn().mockResolvedValue(null),
      indexing: ref(false),
      create: jest.fn().mockResolvedValue(null),
      creating: ref(false),
      destroy: jest.fn().mockResolvedValue(null),
      destroying: ref(false)
    }
    mocked(useReactionsApi).mockReturnValue({ ...reactionsApiMock })
  })

  test('renders correctly', () => {
    store.store.setting.setData(settingFactory.build({
      postDefault: {
        denyRobotScope: [],
        enableReaction: true,
        enableTwitterShare: true,
        allowedEmojis: [],
        deniedEmojis: []
      }
    }))
    const { container } = render(AppFormReaction, options)

    expect(container).toMatchSnapshot()
  })

  describe('props', () => {
    describe('post', () => {
      test('reactionsの絵文字を逆順で表示', () => {
        options.props.post = postFactory.build({
          reactions: [
            reactionFactory.build({ emoji: '🍣' }),
            reactionFactory.build({ emoji: '💯' })
          ]
        })
        const { getAllByAltText } = render(AppFormReaction, options)

        expect(getAllByAltText(/🍣|💯/)).toHaveLength(2)
        expect(getAllByAltText(/🍣|💯/)[0]).toHaveAttribute('alt', '💯')
        expect(getAllByAltText(/🍣|💯/)[1]).toHaveAttribute('alt', '🍣')
      })

      test('AppTwemojiPickerにemojisを渡す', () => {
        const { component, propsList } = useMockedComponent({ props: ['emojis'] })
        options.stubs.AppTwemojiPicker = component
        options.props.post = postFactory.build({ emojis: ['🍣'] })
        render(AppFormReaction, options)

        expect(propsList[0].emojis).toStrictEqual(['🍣'])
      })
    })
  })

  describe('古いリアクションを表示', () => {
    beforeEach(() => {
      options.props.post = postFactory.build({
        reactions: reactionFactory.buildList(100, { emoji: '💯' }),
        reactionsCount: 101
      })
    })

    test('リアクションが100件以上ある時に表示', async () => {
      const { queryByTitle, updateProps } = render(AppFormReaction, options)

      expect(queryByTitle('古いリアクションを表示')).toBeInTheDocument()

      await updateProps({
        post: postFactory.build({
          reactions: reactionFactory.buildList(100),
          reactionsCount: 100
        })
      })
      expect(queryByTitle('古いリアクションを表示')).not.toBeInTheDocument()
    })

    test('pagination.lastPageが1の場合は表示しない', () => {
      reactionsApiMock.pagination.value = paginationFactory.build({ lastPage: 1 })
      const { queryByTitle } = render(AppFormReaction, options)

      expect(queryByTitle('古いリアクションを表示')).not.toBeInTheDocument()
    })

    test('クリックするとindexを実行', async () => {
      const lastReaction = options.props.post.reactions.slice(-1).pop()
      const { getByTitle } = render(AppFormReaction, options)

      await fireEvent.click(getByTitle('古いリアクションを表示'))

      expect(reactionsApiMock.index).toBeCalled()
      expect(reactionsApiMock.index.mock.calls[0][0].lt).toBeTruthy()
      expect(dayjs(reactionsApiMock.index.mock.calls[0][0].lt).isSame(lastReaction.createdAt)).toBeTruthy()
    })

    test('読込中はdisabled, indeterminate', async () => {
      const { getByTitle } = render(AppFormReaction, options)

      expect(getByTitle('古いリアクションを表示')).not.toHaveAttribute('disabled')
      expect(within(getByTitle('古いリアクションを表示')).queryByRole('status')).not.toBeInTheDocument()

      reactionsApiMock.indexing.value = true

      await waitFor(() => {
        expect(getByTitle('古いリアクションを表示')).toHaveAttribute('disabled')
        expect(within(getByTitle('古いリアクションを表示')).getByRole('status')).toBeInTheDocument()
      })
    })

    test('読み込まれたリアクションを先頭に追加表示', async () => {
      reactionsApiMock.reactions.value = reactionFactory.buildList(1, { emoji: '🍣' })

      const { getByTitle, container } = render(AppFormReaction, options)
      await fireEvent.click(getByTitle('古いリアクションを表示'))

      await waitFor(() => {
        expect(container.querySelectorAll('img.emoji')).toHaveLength(101)
        expect(container.querySelectorAll('img.emoji')[0]).toHaveAttribute('alt', '🍣')
      })
    })
  })

  describe('リアクションを追加', () => {
    let twemojiPickerEmitsList: ReturnType<typeof useMockedComponent>['emitsList']

    beforeEach(() => {
      const { component, emitsList } = useMockedComponent({ emits: ['select'] })
      options.stubs.AppTwemojiPicker = component
      twemojiPickerEmitsList = emitsList
    })

    test('絵文字が選択されたら登録処理を実行', () => {
      render(AppFormReaction, options)
      twemojiPickerEmitsList[0].select('🍣')

      expect(reactionsApiMock.create).toBeCalledWith({ emoji: '🍣' })
    })

    test('登録中はdisabled, indeterminate', async () => {
      const { getByTitle } = render(AppFormReaction, options)
      reactionsApiMock.creating.value = true

      await waitFor(() => {
        expect(getByTitle('リアクションを追加')).toHaveAttribute('disabled')
        within(getByTitle('リアクションを追加')).getByRole('status')
      })
    })

    test('処理終了後はaddedイベントを発火', async () => {
      const { emitted } = render(AppFormReaction, options)
      twemojiPickerEmitsList[0].select('🍣')

      await waitFor(() => {
        expect(emitted().added).toHaveLength(1)
        expect(emitted().added[0][0]).toBeInstanceOf(Post)
      })
    })

    test('処理終了後はリアクションを先頭に追加', async () => {
      reactionsApiMock.reaction.value = reactionFactory.build({ emoji: '🍣' })
      const { emitted } = render(AppFormReaction, options)
      twemojiPickerEmitsList[0].select('🍣')

      await waitFor(() => {
        expect(emitted().added[0][0].reactions).toHaveLength(1)
        expect(emitted().added[0][0].reactions[0].emoji).toBe('🍣')
        expect(emitted().added[0][0].reactionsCount).toBe(1)
      })
    })
  })

  describe('delete', () => {
    beforeEach(() => {
      options.props.post.reactions = reactionFactory.buildList(1, { emoji: '🍣' })
      store.store.session.setUser(userFactory.build())
    })

    test('ログイン中にリアクションをクリックすると確認モーダルを表示', async () => {
      const { getByAltText, getByText } = render(AppFormReaction, options)

      await fireEvent.click(getByAltText('🍣'))

      expect(getByText('このリアクションを削除してよろしいですか？')).toBeInTheDocument()
    })

    test('ログイン中でなければモーダルは出ない', async () => {
      store.store.session.setUser(null)
      const { getByAltText, queryByText } = render(AppFormReaction, options)

      await fireEvent.click(getByAltText('🍣'))

      expect(queryByText('このリアクションを削除してよろしいですか？')).not.toBeInTheDocument()
    })

    test('モーダル内でキャンセルを押すとモーダルを閉じる', async () => {
      const { getByAltText, getByRole, queryByText } = render(AppFormReaction, options)

      await fireEvent.click(getByAltText('🍣'))
      await fireEvent.click(getByRole('button', { name: 'キャンセル' }))

      expect(queryByText('このリアクションを削除してよろしいですか？')).not.toBeInTheDocument()
    })

    test('モーダル内で削除するを押すと削除処理を実行', async () => {
      const { getByAltText, getByRole } = render(AppFormReaction, options)

      await fireEvent.click(getByAltText('🍣'))
      await fireEvent.click(getByRole('button', { name: '削除する' }))

      expect(reactionsApiMock.destroy).toBeCalled()
      expect(reactionsApiMock.reaction.value).toBe(options.props.post.reactions[0])
    })

    test('削除中はモーダル内ボタンを押せない', async () => {
      const { getByAltText, getByRole } = render(AppFormReaction, options)

      await fireEvent.click(getByAltText('🍣'))

      expect(getByRole('button', { name: '削除する' })).not.toHaveAttribute('disabled')
      expect(getByRole('button', { name: 'キャンセル' })).not.toHaveAttribute('disabled')

      reactionsApiMock.destroying.value = true

      await waitFor(() => {
        expect(getByRole('button', { name: '削除する' })).toHaveAttribute('disabled')
        expect(getByRole('button', { name: 'キャンセル' })).toHaveAttribute('disabled')
      })
    })

    test('削除中はモーダルを閉じられない', async () => {
      const { getByAltText, queryByLabelText, getByRole } = render(AppFormReaction, options)

      await fireEvent.click(getByAltText('🍣'))

      expect(queryByLabelText('close')).toBeInTheDocument()
      expect(getByRole('button', { name: 'キャンセル' })).not.toHaveAttribute('disabled')

      reactionsApiMock.destroying.value = true

      await waitFor(() => {
        expect(queryByLabelText('close')).not.toBeInTheDocument()
      })
    })

    test('処理終了後はdeletedイベントを発火', async () => {
      const { getByAltText, getByRole, emitted } = render(AppFormReaction, options)

      await fireEvent.click(getByAltText('🍣'))
      await fireEvent.click(getByRole('button', { name: '削除する' }))

      await waitFor(() => {
        expect(emitted().deleted).toHaveLength(1)
        expect(emitted().deleted[0][0]).toBeInstanceOf(Post)
      })
    })

    test('処理終了後はリアクションを削除', async () => {
      const { getByAltText, getByRole, emitted } = render(AppFormReaction, options)

      await fireEvent.click(getByAltText('🍣'))
      await fireEvent.click(getByRole('button', { name: '削除する' }))

      await waitFor(() => {
        expect(emitted().deleted[0][0].reactions).toHaveLength(0)
      })
    })

    test('処理終了後はモーダルを閉じる', async () => {
      const { getByAltText, getByRole, queryByText } = render(AppFormReaction, options)

      await fireEvent.click(getByAltText('🍣'))
      await fireEvent.click(getByRole('button', { name: '削除する' }))

      await waitFor(() => {
        expect(queryByText('このリアクションを削除してよろしいですか？')).not.toBeInTheDocument()
      })
    })
  })
})
