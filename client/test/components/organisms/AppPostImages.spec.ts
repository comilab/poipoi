import { fireEvent, render } from '@testing-library/vue'

import AppPostImages from '~/components/organisms/AppPostImages.vue'
import imageFactory from '~/test/factories/image'
import postFactory from '~/test/factories/post'

describe('components/organisms/AppPostImages', () => {
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
      images: imageFactory.buildList(2, {
        publicPaths: {
          original: 'original',
          large: 'large',
          medium: 'medium',
          small: 'small'
        }
      })
    })
    const { container } = render(AppPostImages, options)

    expect(container).toMatchSnapshot()
  })

  describe('全て表示', () => {
    beforeEach(() => {
      options.props.post = postFactory.build({
        images: imageFactory.buildList(2)
      })
    })

    test('画像が複数枚ある時のみ表示', async () => {
      options.props.post = postFactory.build({
        images: imageFactory.buildList(1)
      })
      const { queryByRole, updateProps } = render(AppPostImages, options)

      expect(queryByRole('button', { name: /すべて表示/ })).not.toBeInTheDocument()

      await updateProps({
        post: postFactory.build({
          images: imageFactory.buildList(2)
        })
      })
      expect(queryByRole('button', { name: /すべて表示/ })).toBeInTheDocument()
    })

    test('クリックすると画像が全て表示される', async () => {
      const { getAllByRole, getByRole } = render(AppPostImages, options)

      expect(getAllByRole('img')).toHaveLength(1)

      await fireEvent.click(getByRole('button', { name: /すべて表示/ }))
      expect(getAllByRole('img')).toHaveLength(2)
    })
  })
})
