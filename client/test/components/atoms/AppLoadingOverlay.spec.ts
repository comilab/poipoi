import { render, RenderOptions } from '@testing-library/vue'

import AppLoadingOverlay from '~/components/atoms/AppLoadingOverlay.vue'

describe('components/atoms/AppLoadingOverlay', () => {
  let options: RenderOptions<AppLoadingOverlay>

  beforeEach(() => {
    options = {
      slots: {
        default: 'slot'
      },
      stubs: ['FontAwesomeIcon'],
      props: {
        loading: true
      }
    }
  })

  test('loading = true ならoverlayが表示される', () => {
    const { container, getByTestId, queryByText } = render(AppLoadingOverlay, options)

    expect(container).toMatchSnapshot()
    expect(getByTestId('overlay')).toBeVisible()
    expect(queryByText('slot')).not.toBeInTheDocument()
  })

  test('loading = false ならslotが表示される', async () => {
    const { updateProps, container, queryByTestId, getByText } = render(AppLoadingOverlay, options)

    await updateProps({ loading: false })

    expect(container).toMatchSnapshot()
    expect(queryByTestId('overlay')).not.toBeInTheDocument()
    expect(getByText('slot')).toBeVisible()
  })
})
