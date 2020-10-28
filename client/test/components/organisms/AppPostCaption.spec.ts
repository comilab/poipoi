import { render } from '@testing-library/vue'

import AppPostCaption from '~/components/organisms/AppPostCaption.vue'
import postFactory from '~/test/factories/post'

describe('components/organisms/AppPostCaption', () => {
  let options: any

  beforeEach(() => {
    options = {
      props: {
        post: postFactory.build()
      },
      stubs: {
        NuxtLink: true
      }
    }
  })

  test('renders correctly', () => {
    options.props.post = postFactory.build({
      caption: 'キャプション\r\n#ハッシュタグ'
    })
    const { container } = render(AppPostCaption, options)

    expect(container).toMatchSnapshot()
  })
})
