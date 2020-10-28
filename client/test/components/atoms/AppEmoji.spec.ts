import { render, RenderOptions } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import Twemoji from 'twemoji'

import AppEmoji from '~/components/atoms/AppEmoji.vue'

jest.mock('twemoji')

describe('components/atoms/AppEmoji', () => {
  let options: RenderOptions<AppEmoji>

  beforeEach(() => {
    options = {
      props: {
        text: '🍣'
      }
    }

    mocked(Twemoji.parse).mockImplementation((emoji: string|HTMLElement) => {
      return `<img alt="${emoji}" />`
    })
  })

  test('renders correctly', () => {
    const { container, getByAltText } = render(AppEmoji, options)

    expect(container).toMatchSnapshot()
    getByAltText('🍣')
    expect(Twemoji.parse).toBeCalledWith('🍣')
  })
})
