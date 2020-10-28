import { render, RenderOptions } from '@testing-library/vue'

import AppButtonHelp from '~/components/atoms/AppButtonHelp.vue'

describe('components/atoms/AppButtonHelp', () => {
  let options: RenderOptions<AppButtonHelp>

  beforeEach(() => {
    options = {
      stubs: ['FontAwesomeIcon']
    }
  })

  test('renders correctly', () => {
    const { container } = render(AppButtonHelp, options)

    expect(container).toMatchSnapshot()
  })
})
