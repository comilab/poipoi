import { render } from '@testing-library/vue'

import AppPostTextPage from '~/components/organisms/AppPostTextPage.vue'
import imageFactory from '~/test/factories/image'
import postFactory from '~/test/factories/post'

describe('components/organisms/AppPostTextPage', () => {
  let options: any

  beforeEach(() => {
    options = {
      props: {
        post: postFactory.build(),
        page: ''
      },
      stubs: {
        NuxtLink: true
      }
    }
  })

  test('renders correctly', () => {
    options.props.post = postFactory.build({
      text: `
        [chapter:1ページ目の章タイトル]
        本文
        本文
        本文
        [jump:2]
        [[jumpuri:https://example.com>リンク]]
        [[rb:ルビ>るび]]
        [image:1]
        [newpage]
        [chapter:2ページ目の章タイトル]
      `,
      images: imageFactory.buildList(1, {
        publicPaths: {
          original: 'original',
          large: 'large',
          medium: 'medium',
          small: 'small'
        }
      })
    })
    options.props.page = `
      [chapter:1ページ目の章タイトル]
      本文
      本文
      本文
      [jump:2]
      [[jumpuri:https://example.com>リンク]]
      [[rb:ルビ>るび]]
      [image:1]
    `
    const { container } = render(AppPostTextPage, options)

    expect(container).toMatchSnapshot()
  })
})
