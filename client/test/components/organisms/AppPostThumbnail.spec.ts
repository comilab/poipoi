import { render } from '@testing-library/vue'

import AppPostThumbnail from '~/components/organisms/AppPostThumbnail.vue'
import imageFactory from '~/test/factories/image'
import postFactory from '~/test/factories/post'

describe('components/organisms/AppPostThumbnail', () => {
  let options: any

  beforeEach(() => {
    options = {
      props: {
        post: postFactory.build()
      },
      stubs: {
        FontAwesomeIcon: true
      }
    }
  })

  test('renders correctly', () => {
    options.props.post = postFactory.build({
      pinned: true,
      rating: 'nsfw',
      scope: 'public',
      publishStart: null,
      publishEnd: null,
      title: 'title',
      caption: 'caption',
      text: 'foo',
      showThumbnail: true,
      showImagesList: true,
      images: imageFactory.buildList(1, {
        publicPaths: {
          original: 'original',
          large: 'large',
          medium: 'medium',
          small: 'small'
        }
      })
    })
    const { container } = render(AppPostThumbnail, options)

    expect(container).toMatchSnapshot()
  })

  describe('thumbnail', () => {
    test('画像があってshowThumbnailがtrueなら表示', () => {
      options.props.post = postFactory.build({
        images: imageFactory.buildList(1),
        showThumbnail: true
      })
      const { queryByRole } = render(AppPostThumbnail, options)

      expect(queryByRole('img')).toBeInTheDocument()
    })

    test('画像があってもshowThumbnailがfalseなら非表示', () => {
      options.props.post = postFactory.build({
        images: imageFactory.buildList(1),
        showThumbnail: false
      })
      const { queryByRole } = render(AppPostThumbnail, options)

      expect(queryByRole('img')).not.toBeInTheDocument()
    })

    test('画像がなければ非表示', () => {
      options.props.post = postFactory.build({
        images: [],
        showThumbnail: true
      })
      const { queryByRole } = render(AppPostThumbnail, options)

      expect(queryByRole('img')).not.toBeInTheDocument()
    })
  })
})
