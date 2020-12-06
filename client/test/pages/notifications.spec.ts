import { render, waitFor } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import { ref } from '@vue/composition-api'
import * as NuxtCompositionApi from 'nuxt-composition-api'
import dayjs from 'dayjs'

import Notifications from '~/pages/notifications.vue'
import useNotificationsApi from '~/composables/use-notifications-api'
import postFactory from '~/test/factories/post'
import paginationFactory from '~/test/factories/pagination'
import notificationFactory from '~/test/factories/notification'
import Pagination from '~/models/Pagination'
import Notification from '~/models/Notification'
import useMockedComponent from '~/test/stubs/MockedComponent'

jest.mock('~/composables/use-notifications-api')

describe('pages/notifications', () => {
  let options: any
  let contextMock: any
  let fetchMock: any
  let notificationsApiMock: any

  beforeEach(() => {
    options = {
      props: {
        post: postFactory.build()
      },
      stubs: {
        FontAwesomeIcon: true,
        NuxtLink: true
      },
      mocks: {
        $fetchState: {
          pending: false
        }
      }
    }

    contextMock = {
      redirect: jest.fn(),
      route: ref<any>({
        query: {}
      })
    }
    jest.spyOn(NuxtCompositionApi, 'useContext').mockReturnValue(contextMock)

    fetchMock = {
      fetch: jest.fn()
    }
    jest.spyOn(NuxtCompositionApi, 'useFetch').mockReturnValue(fetchMock)

    notificationsApiMock = {
      index: jest.fn(),
      notifications: ref<Notification[]>([]),
      pagination: ref<Pagination|null>(null)
    }
    mocked(useNotificationsApi).mockReturnValue(notificationsApiMock)
  })

  describe('renders correctly', () => {
    test('投稿がある時', () => {
      notificationsApiMock.notifications.value = notificationFactory.buildList(10, {
        emoji: '🍣',
        post: postFactory.build({
          path: '/1',
          caption: 'caption',
          images: []
        }),
        createdAt: dayjs('2020-01-01 00:00')
      })
      notificationsApiMock.pagination.value = paginationFactory.build({
        currentPage: 1,
        perPage: 10,
        total: 100
      })
      options.stubs.AppPagination = true
      const { container } = render(Notifications, options)

      expect(container).toMatchSnapshot()
    })

    test('投稿がない時', () => {
      notificationsApiMock.notifications.value = []
      notificationsApiMock.pagination.value = paginationFactory.build({
        currentPage: 1,
        perPage: 10,
        total: 100
      })
      options.stubs.AppPagination = true
      const { container } = render(Notifications, options)

      expect(container).toMatchSnapshot()
    })
  })

  describe('fetch', () => {
    test('indexが実行される', async () => {
      render(Notifications, options)

      expect(NuxtCompositionApi.useFetch).toBeCalled()

      const callback = mocked(NuxtCompositionApi.useFetch).mock.calls[0][0] as Function
      await callback()

      expect(notificationsApiMock.index).toBeCalled()
    })

    test('route.queryが変更されたら再実行', async () => {
      render(Notifications, options)

      contextMock.route.value = {
        query: {
          page: '1'
        }
      }

      await waitFor(() => {
        expect(fetchMock.fetch).toBeCalled()
      })
    })
  })

  describe('pagination', () => {
    test('selectedされたらリダイレクトする', async () => {
      notificationsApiMock.notifications.value = notificationFactory.buildList(1)
      const { component, emitsList } = useMockedComponent({
        emits: ['selected']
      })
      notificationsApiMock.pagination.value = paginationFactory.build()
      options.stubs.AppPagination = component

      render(Notifications, options)
      emitsList[0].selected(1)

      await waitFor(() => {
        expect(contextMock.redirect).toBeCalledWith('/notifications', {
          page: '1'
        })
      })
    })
  })
})
