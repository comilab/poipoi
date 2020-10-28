import axiosMock from 'axios'
import { mocked } from 'ts-jest/utils'
import { Ref } from '@vue/composition-api'

import usePostsApi from '~/composables/use-posts-api'
import Post from '~/models/Post'
import postFactory from '~/test/factories/post'

jest.mock('axios')

describe('composables/use-posts-api', () => {
  test('baseUrl is /posts', async () => {
    const { create } = usePostsApi()

    mocked(axiosMock.post).mockResolvedValueOnce({ data: {} })

    await create()

    expect(axiosMock.post).toBeCalledWith('/posts', {})
  })

  test('returns post, posts, verify, verifying', () => {
    const api = usePostsApi()

    expect(api.post).toBeDefined()
    expect(api.posts.value).toBeInstanceOf(Array)
    expect(api.verify).toBeInstanceOf(Function)
    expect(api.verifying.value).toBeDefined()
  })

  describe('verify', () => {
    let initialItem: Post
    let verify: ReturnType<typeof usePostsApi>['verify']
    let verifying: ReturnType<typeof usePostsApi>['verifying']
    let post: Ref<Post|null>

    beforeEach(() => {
      initialItem = postFactory.build()
      const api = usePostsApi(initialItem)
      verify = api.verify
      verifying = api.verifying
      post = api.post

      mocked(axiosMock.post).mockResolvedValueOnce({ data: initialItem })
    })

    test('POST /posts/{id}/verify', async () => {
      const payload = {
        foo: 'bar'
      }

      await verify(payload)

      expect(axiosMock.post).toBeCalledWith(`/posts/${initialItem.id}/verify`, payload)
    })

    test('アクセス中のみverifying = true', (done) => {
      expect(verifying.value).toBeFalsy()

      verify({})
        .then(() => {
          expect(verifying.value).toBeFalsy()
          done()
        })

      expect(verifying.value).toBeTruthy()
    })

    test('postにセット', async () => {
      const oldPost = post.value

      await verify({})

      expect(post.value).toBeInstanceOf(Post)
      expect(post.value).not.toBe(oldPost)
    })
  })
})
