import { render, waitFor } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import * as NuxtCompositionApi from 'nuxt-composition-api'
import { ref, reactive } from '@vue/composition-api'
import faker from 'faker'
import dayjs from 'dayjs'

import PostsIndex from '~/pages/posts/_id/index.vue'
import * as store from '~/store'
import usePostsApi from '~/composables/use-posts-api'
import postFactory from '~/test/factories/post'
import settingFactory from '~/test/factories/setting'
import useMockedComponent from '~/test/stubs/MockedComponent'
import Post from '~/models/Post'

jest.mock('~/composables/use-posts-api')

describe('pages/posts/_id/index', () => {
  let options: any
  let contextMock: any
  let fetchMock: any
  let postsApiMock: any

  beforeEach(() => {
    options = {
      stubs: {
        FontAwesomeIcon: true,
        NuxtLink: true,
        AppTwemojiPicker: true
      }
    }

    store.store.setting.setData(settingFactory.build())
    jest.spyOn(store, 'useStore').mockReturnValue(store.store)

    contextMock = {
      redirect: jest.fn(),
      params: ref({
        id: 1
      })
    }
    jest.spyOn(NuxtCompositionApi, 'useContext').mockReturnValue(contextMock)

    fetchMock = {
      fetch: jest.fn(),
      fetchState: reactive({
        pending: false
      })
    }
    jest.spyOn(NuxtCompositionApi, 'useFetch').mockReturnValue(fetchMock)

    postsApiMock = {
      show: jest.fn(),
      post: ref<Post>(postFactory.build())
    }
    mocked(usePostsApi).mockReturnValue(postsApiMock)
  })

  describe('fetch', () => {
    test('showが実行される', async () => {
      options.stubs.AppFormPost = true
      render(PostsIndex, options)

      expect(NuxtCompositionApi.useFetch).toBeCalled()

      const callback = mocked(NuxtCompositionApi.useFetch).mock.calls[0][0] as Function
      await callback()

      expect(postsApiMock.show).toBeCalledWith(1)
    })
  })

  test('createdAt < updatedAtなら更新日を表示', async () => {
    const { queryByText } = render(PostsIndex, options)

    expect(queryByText(/\(.+ 更新\)/)).not.toBeInTheDocument()

    postsApiMock.post.value = postFactory.build({
      updatedAt: dayjs(faker.date.future())
    })

    await (() => {
      expect(queryByText(/\(.+ 更新\)/)).toBeInTheDocument()
    })
  })

  describe('AppPostLinks', () => {
    test('deletedが送られたらリダイレクトする', () => {
      const { component, emitsList } = useMockedComponent({ emits: ['deleted'] })
      options.stubs.AppPostLinks = component
      render(PostsIndex, options)

      emitsList[0].deleted()

      expect(contextMock.redirect).toBeCalledWith('/')
    })
  })

  describe('AppFormOneCushion', () => {
    beforeEach(() => {
      postsApiMock.post.value = postFactory.build({
        rating: 'nsfw'
      })
    })

    test('scope = passwordなら表示', async () => {
      postsApiMock.post.value = postFactory.build({
        rating: null,
        scope: 'public'
      })
      const { queryByRole } = render(PostsIndex, options)

      expect(queryByRole('form', { name: 'ワンクッション' })).not.toBeInTheDocument()

      postsApiMock.post.value = postFactory.build({
        rating: null,
        scope: 'password'
      })
      await waitFor(() => {
        expect(queryByRole('form', { name: 'ワンクッション' })).toBeInTheDocument()
      })
    })

    test('ratingがあれば表示', async () => {
      postsApiMock.post.value = postFactory.build({
        rating: null,
        scope: 'public'
      })
      const { queryByRole } = render(PostsIndex, options)

      expect(queryByRole('form', { name: 'ワンクッション' })).not.toBeInTheDocument()

      postsApiMock.post.value = postFactory.build({
        rating: 'nsfw',
        scope: 'public'
      })
      await waitFor(() => {
        expect(queryByRole('form', { name: 'ワンクッション' })).toBeInTheDocument()
      })

      postsApiMock.post.value = postFactory.build({
        rating: 'r18',
        scope: 'public'
      })
      await waitFor(() => {
        expect(queryByRole('form', { name: 'ワンクッション' })).toBeInTheDocument()
      })
    })

    test('passedが送られたらフォームを非表示にする', async () => {
      postsApiMock.post.value = postFactory.build({
        rating: 'r18'
      })
      const { component, emitsList } = useMockedComponent({
        emits: ['passed'],
        template: '<form aria-label="ワンクッション"></form>'
      })
      options.stubs.AppFormOneCushion = component
      const { queryByRole } = render(PostsIndex, options)

      expect(queryByRole('form', { name: 'ワンクッション' })).toBeInTheDocument()

      const newPost = postFactory.build()
      emitsList[0].passed(newPost)

      await waitFor(() => {
        expect(postsApiMock.post.value).toBe(newPost)
        expect(queryByRole('form', { name: 'ワンクッション' })).not.toBeInTheDocument()
      })
    })
  })

  describe('AppFormReaction', () => {
    beforeEach(() => {
      postsApiMock.post.value = postFactory.build({
        rating: null,
        scope: 'public',
        actualEnableReaction: true
      })
    })

    test('リアクションが有効なら表示', async () => {
      postsApiMock.post.value = postFactory.build({
        rating: null,
        scope: 'public',
        actualEnableReaction: false
      })
      const { queryByRole } = render(PostsIndex, options)

      expect(queryByRole('button', { name: 'リアクションを追加' })).not.toBeInTheDocument()

      postsApiMock.post.value = postFactory.build({
        rating: null,
        scope: 'public',
        actualEnableReaction: true
      })
      await waitFor(() => {
        expect(queryByRole('button', { name: 'リアクションを追加' })).toBeInTheDocument()
      })
    })

    test('addedされたらpostを更新', () => {
      const { component, emitsList } = useMockedComponent({ emits: ['added'] })
      options.stubs.AppFormReaction = component
      render(PostsIndex, options)

      const newPost = postFactory.build()
      emitsList[0].added(newPost)

      expect(postsApiMock.post.value).toBe(newPost)
    })

    test('deletedされたらpostを更新', () => {
      const { component, emitsList } = useMockedComponent({ emits: ['deleted'] })
      options.stubs.AppFormReaction = component
      render(PostsIndex, options)

      const newPost = postFactory.build()
      emitsList[0].deleted(newPost)

      expect(postsApiMock.post.value).toBe(newPost)
    })
  })
})
