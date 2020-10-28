import { render } from '@testing-library/vue'
import * as NuxtCompositionApi from 'nuxt-composition-api'

import PostsNew from '~/pages/posts/new.vue'
import postFactory from '~/test/factories/post'
import useMockedComponent from '~/test/stubs/MockedComponent'

describe('pages/posts/new', () => {
  let options: any
  let contextMock: any

  beforeEach(() => {
    options = {
      stubs: {
        FontAwesomeIcon: true,
        NuxtLink: true
      }
    }

    contextMock = {
      redirect: jest.fn()
    }
    jest.spyOn(NuxtCompositionApi, 'useContext').mockReturnValue(contextMock)
  })

  test('renders correctly', () => {
    options.stubs.AppFormPost = true
    const { container } = render(PostsNew, options)

    expect(container).toMatchSnapshot()
  })

  test('onSubmitted', () => {
    const { component, emitsList } = useMockedComponent({
      emits: ['submitted']
    })
    options.stubs.AppFormPost = component
    render(PostsNew, options)

    const post = postFactory.build()
    emitsList[0].submitted(post)

    expect(contextMock.redirect).toBeCalledWith(post.path)
  })
})
