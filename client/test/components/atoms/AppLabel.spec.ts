import { render } from '@testing-library/vue'

import AppLabel from '~/components/atoms/AppLabel.vue'

describe('components/atoms/AppLabel', () => {
  test('renders correctly', () => {
    const { container, getByLabelText } = render(AppLabel, {
      slots: {
        default: `
          label
          <input />
        `
      }
    })

    expect(container).toMatchSnapshot()

    getByLabelText('label')
  })
})
