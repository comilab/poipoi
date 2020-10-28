import { render, RenderOptions, within } from '@testing-library/vue'

import AppButton from '~/components/atoms/AppButton.vue'

describe('components/atoms/AppButton', () => {
  let options: RenderOptions<AppButton>
  let props: any

  beforeEach(() => {
    props = {}

    options = {
      slots: {
        default: 'button-text'
      },
      stubs: ['FontAwesomeIcon', 'NuxtLink'],
      props
    }
  })

  test('renders correctly', () => {
    const { container, getByText } = render(AppButton, options)

    expect(container).toMatchSnapshot()
    getByText('button-text')
  })

  describe('component', () => {
    test('props.type = badge なら div', () => {
      props.type = 'badge'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toBeInstanceOf(HTMLDivElement)
    })

    test('props.to があれば nuxt-link', () => {
      props.to = '/to'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(container.querySelector(':scope > NuxtLink-stub')).toBeInTheDocument()
    })

    test('props.href があれば a', () => {
      props.href = '/href'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toBeInstanceOf(HTMLAnchorElement)
    })

    test('それ以外なら button', () => {
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toBeInstanceOf(HTMLButtonElement)
    })
  })

  describe('type', () => {
    test('コンポーネントがbuttonならtype属性としてセット', () => {
      props.type = 'submit'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()

      expect(getByTestId('button')).toBeInstanceOf(HTMLButtonElement)
      expect(getByTestId('button')).toHaveAttribute('type', 'submit')
    })

    test('コンポーネントがbuttonでなければtype属性はセットしない', () => {
      props.type = 'badge'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()

      expect(getByTestId('button')).not.toBeInstanceOf(HTMLButtonElement)
      expect(getByTestId('button')).not.toHaveAttribute('type')
    })

    test('デフォルトはbutton', () => {
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveAttribute('type', 'button')
    })

    test('badgeならpointer-events-noneクラスをセット', () => {
      props.type = 'badge'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveClass('pointer-events-none')
    })
  })

  describe('to', () => {
    test('NuxtLinkに渡す', () => {
      props.to = '/to'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()

      const button = container.querySelector(':scope > NuxtLink-stub')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('to', '/to')
    })
  })

  describe('href', () => {
    test('a要素の属性にセット', () => {
      props.href = '/href'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()

      expect(getByTestId('button')).toBeInstanceOf(HTMLAnchorElement)
      expect(getByTestId('button')).toHaveAttribute('href', '/href')
    })
  })

  describe('color', () => {
    test('blue', () => {
      props.color = 'blue'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
    })

    test('red', () => {
      props.color = 'red'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
    })

    test('white', () => {
      props.color = 'white'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
    })

    test('yellow', () => {
      props.color = 'yellow'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
    })

    test('gray', () => {
      props.color = 'gray'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
    })
  })

  describe('size', () => {
    test('sm', () => {
      props.size = 'sm'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
    })

    test('md', () => {
      props.size = 'md'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
    })

    test('lg', () => {
      props.size = 'lg'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
    })

    test('sm + iconOnly', () => {
      props.size = 'sm'
      props.icon = 'icon'
      options.slots = {}
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveClass('square-sm')
    })

    test('md + iconOnly', () => {
      props.size = 'md'
      props.icon = 'icon'
      options.slots = {}
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveClass('square-md')
    })
  })

  describe('icon', () => {
    test('FontAwesomeIconに渡す', () => {
      props.icon = 'icon'
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()

      const button = container.querySelector(':scope > FontAwesomeIcon-stub')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('icon', 'icon')
    })

    test('r18の場合はFontAwesomeを使わない', () => {
      props.icon = 'r18'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('icon')).toBeInstanceOf(HTMLDivElement)
      within(getByTestId('icon')).getByText('R18')
    })
  })

  describe('indeterminate', () => {
    beforeEach(() => {
      props.indeterminate = true
      props.icon = 'icon'
    })

    test('iconが強制的にfaSpinnerになる', () => {
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('icon')).not.toHaveAttribute('icon', 'icon')
    })

    test('FontAwesomeIconにpulseを渡す', () => {
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('icon')).toHaveAttribute('pulse')
    })
  })

  describe('breakpoint', () => {
    beforeEach(() => {
      props.icon = 'icon'
    })

    test('md', () => {
      props.breakpoint = 'md'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveClass('breakpoint-md')
    })

    test('lg', () => {
      props.breakpoint = 'lg'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveClass('breakpoint-lg')
    })
  })

  describe('pill', () => {
    beforeEach(() => {
      props.pill = true
    })

    test('true', () => {
      const { container } = render(AppButton, options)

      expect(container).toMatchSnapshot()
    })
  })

  describe('square', () => {
    beforeEach(() => {
      props.square = true
    })

    test('true + sm', () => {
      props.size = 'sm'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveClass('square-sm')
    })

    test('true + md', () => {
      props.size = 'md'
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveClass('square-md')
    })
  })

  describe('buttonClass', () => {
    beforeEach(() => {
      props.buttonClass = 'button-class'
    })

    test('ボタンにクラスがセットされる', () => {
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveClass('button-class')
    })
  })

  describe('iconClass', () => {
    beforeEach(() => {
      props.iconClass = 'icon-class'
      props.icon = 'icon'
    })

    test('アイコンにクラスがセットされる', () => {
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('icon')).toHaveClass('icon-class')
    })
  })

  describe('textClass', () => {
    beforeEach(() => {
      props.textClass = 'text-class'
    })

    test('テキストにクラスがセットされる', () => {
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('text')).toHaveClass('text-class')
    })
  })

  describe('attrs', () => {
    beforeEach(() => {
      options.attrs = { foo: 'bar' }
    })

    test('ボタンに属性がセットされる', () => {
      const { container, getByTestId } = render(AppButton, options)

      expect(container).toMatchSnapshot()
      expect(getByTestId('button')).toHaveAttribute('foo', 'bar')
    })
  })
})
