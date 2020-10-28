import { render, RenderOptions } from '@testing-library/vue'

import AppSquare from '~/components/atoms/AppSquare.vue'

describe('components/atoms/AppSquare', () => {
  let options: RenderOptions<AppSquare>

  beforeEach(() => {
    options = {
      slots: {
        default: 'default-slot'
      }
    }
  })

  test('renders correctly', () => {
    const { container, getByText } = render(AppSquare, options)

    expect(container).toMatchSnapshot()
    getByText('default-slot')
  })
})
