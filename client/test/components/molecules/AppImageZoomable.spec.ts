import { render, RenderOptions, fireEvent } from '@testing-library/vue'

import AppImageZoomable from '~/components/molecules/AppImageZoomable.vue'

describe('components/molecules/AppImageZoomable', () => {
  let options: RenderOptions<AppImageZoomable>
  let props: any

  beforeEach(() => {
    props = {
      src: 'small.jpeg',
      largeSrc: 'large.jpeg'
    }

    options = {
      props
    }
  })

  test('renders correctly', () => {
    const { container, queryByTestId } = render(AppImageZoomable, options)

    expect(container).toMatchSnapshot()
    expect(queryByTestId('zoomable-area')).toBeVisible()
    expect(queryByTestId('zoomed-area')).not.toBeInTheDocument()
  })

  describe('props', () => {
    describe('imgClass', () => {
      test('img要素にクラスが付与される', () => {
        props.imgClass = 'foo'
        const { container, queryByTestId } = render(AppImageZoomable, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('zoomable-area-img')).toHaveClass('foo')
      })
    })
  })

  test('zoomable-areaをクリックするとズームする', async () => {
    const { container, getByTestId, queryByTestId } = render(AppImageZoomable, options)
    await fireEvent.click(getByTestId('zoomable-area'))

    expect(container).toMatchSnapshot()
    expect(queryByTestId('zoomed-area')).toBeVisible()
  })

  test('zoomed-areaをクリックするとズームアウトする', async () => {
    const { container, getByTestId, queryByTestId } = render(AppImageZoomable, options)
    await fireEvent.click(getByTestId('zoomable-area'))
    await fireEvent.click(getByTestId('zoomed-area'))

    expect(container).toMatchSnapshot()
    expect(queryByTestId('zoomed-area')).not.toBeInTheDocument()
  })
})
