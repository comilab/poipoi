import { render } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import * as NuxtCompositionApi from 'nuxt-composition-api'
import { ref } from '@vue/composition-api'

import PostsEdit from '~/pages/posts/_id/edit.vue'
import usePostsApi from '~/composables/use-posts-api'
import postFactory from '~/test/factories/post'
import useMockedComponent from '~/test/stubs/MockedComponent'
import Post from '~/models/Post'

jest.mock('~/composables/use-posts-api')

describe('pages/posts/_id/edit', () => {
  let options: any
  let contextMock: any
  let fetchMock: any
  let postsApiMock: any

  beforeEach(() => {
    options = {
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
      params: ref({
        id: 1
      })
    }
    jest.spyOn(NuxtCompositionApi, 'useContext').mockReturnValue(contextMock)

    fetchMock = {
      fetch: jest.fn()
    }
    jest.spyOn(NuxtCompositionApi, 'useFetch').mockReturnValue(fetchMock)

    postsApiMock = {
      show: jest.fn(),
      post: ref<Post>(postFactory.build())
    }
    mocked(usePostsApi).mockReturnValue(postsApiMock)
  })

  test('renders correctly', () => {
    options.stubs.AppFormPost = true
    const { container } = render(PostsEdit, options)

    expect(container).toMatchSnapshot()
  })

  describe('fetch', () => {
    test('showが実行される', async () => {
      options.stubs.AppFormPost = true
      render(PostsEdit, options)

      expect(NuxtCompositionApi.useFetch).toBeCalled()

      const callback = mocked(NuxtCompositionApi.useFetch).mock.calls[0][0] as Function
      await callback()

      expect(postsApiMock.show).toBeCalledWith(1)
    })
  })

  test('onSubmitted', () => {
    const { component, emitsList } = useMockedComponent({
      emits: ['submitted']
    })
    options.stubs.AppFormPost = component
    render(PostsEdit, options)

    emitsList[0].submitted()

    expect(contextMock.redirect).toBeCalledWith(postsApiMock.post.value.path)
  })
})
