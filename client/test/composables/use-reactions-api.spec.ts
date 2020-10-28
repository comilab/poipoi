import axiosMock from 'axios'
import { mocked } from 'ts-jest/utils'

import useReactionsApi from '~/composables/use-reactions-api'
import Post from '~/models/Post'
import postFactory from '~/test/factories/post'

jest.mock('axios')

describe('composables/use-reactions-api', () => {
  let post: Post

  beforeEach(() => {
    post = postFactory.build()
  })

  test('baseUrl is /posts/{post.id}/reactions', async () => {
    const { create } = useReactionsApi(post)

    mocked(axiosMock.post).mockResolvedValueOnce({ data: {} })

    await create()

    expect(axiosMock.post).toBeCalledWith(`/posts/${post.id}/reactions`, {})
  })

  test('returns reaction, reactions', () => {
    const api = useReactionsApi(post)

    expect(api.reaction).toBe(api.item)
    expect(api.reactions).toBe(api.items)
  })
})
