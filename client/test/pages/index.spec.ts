import { render, waitFor } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import { ref, reactive } from '@vue/composition-api'
import * as NuxtCompositionApi from 'nuxt-composition-api'
import VueScrollTo from 'vue-scrollto'

import Index from '~/pages/index.vue'
import * as store from '~/store'
import usePostsApi from '~/composables/use-posts-api'
import postFactory from '~/test/factories/post'
import settingFactory from '~/test/factories/setting'
import Post from '~/models/Post'
import Pagination from '~/models/Pagination'
import paginationFactory from '~/test/factories/pagination'
import useMockedComponent from '~/test/stubs/MockedComponent'

jest.mock('vue-scrollto')
jest.mock('~/composables/use-posts-api')

describe('pages/index', () => {
  let options: any
  let contextMock: any
  let metaMock: any
  let fetchMock: any
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

    contextMock = {
      redirect: jest.fn(),
      route: ref<any>({
        query: {}
      })
    }
    jest.spyOn(NuxtCompositionApi, 'useContext').mockReturnValue(contextMock)

    metaMock = {
      title: ref('')
    }
    jest.spyOn(NuxtCompositionApi, 'useMeta').mockReturnValue(metaMock)

    fetchMock = {
      fetch: jest.fn(),
      fetchState: reactive({
        pending: false
      })
    }
    jest.spyOn(NuxtCompositionApi, 'useFetch').mockReturnValue(fetchMock)

    postsApiMock = {
      index: jest.fn(),
      posts: ref<Post[]>([]),
      pagination: ref<Pagination|null>(null)
    }
    mocked(usePostsApi).mockReturnValue(postsApiMock)
  })

  describe('renders correctly', () => {
    test('投稿がある時', () => {
      postsApiMock.posts.value = postFactory.buildList(10, {
        url: 'https://example.com'
      })
      postsApiMock.pagination.value = paginationFactory.build({
        currentPage: 1,
        perPage: 10,
        total: 100
      })
      options.stubs.AppPostThumbnail = true
      options.stubs.AppPagination = true
      const { container } = render(Index, options)

      expect(container).toMatchSnapshot()
    })

    test('投稿がない時', () => {
      postsApiMock.posts.value = []
      postsApiMock.pagination.value = paginationFactory.build({
        currentPage: 1,
        perPage: 10,
        total: 100
      })
      options.stubs.AppPagination = true
      const { container } = render(Index, options)

      expect(container).toMatchSnapshot()
    })
  })

  describe('title', () => {
    test('siteTitleをセット', () => {
      store.store.setting.setData(settingFactory.build({
        siteTitle: 'site-title'
      }))
      render(Index, options)

      expect(metaMock.title.value).toBe('site-title')
    })
  })

  describe('fetch', () => {
    test('indexが実行される', async () => {
      render(Index, options)

      expect(NuxtCompositionApi.useFetch).toBeCalled()

      const callback = mocked(NuxtCompositionApi.useFetch).mock.calls[0][0] as Function
      await callback()

      expect(postsApiMock.index).toBeCalled()
    })

    test('上部にスクロール', async () => {
      render(Index, options)

      expect(NuxtCompositionApi.useFetch).toBeCalled()

      const callback = mocked(NuxtCompositionApi.useFetch).mock.calls[0][0] as Function
      await callback()

      expect(VueScrollTo.scrollTo).toBeCalledWith('#top')
    })

    test('route.queryが変更されたら再実行', async () => {
      render(Index, options)

      contextMock.route.value = {
        query: {
          keyword: 'keyword'
        }
      }

      await waitFor(() => {
        expect(fetchMock.fetch).toBeCalled()
      })
    })
  })

  describe('pagination', () => {
    test('selectedされたらリダイレクトする', async () => {
      postsApiMock.posts.value = postFactory.buildList(1)
      const { component, emitsList } = useMockedComponent({
        emits: ['selected']
      })
      postsApiMock.pagination.value = paginationFactory.build()
      options.stubs.AppPagination = component

      render(Index, options)
      emitsList[0].selected(1)

      await waitFor(() => {
        expect(contextMock.redirect).toBeCalledWith('/', {
          page: '1'
        })
      })
    })
  })
})
