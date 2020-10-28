import { render } from '@testing-library/vue'
import { defineComponent } from 'nuxt-composition-api'

import AppPopoverHelp from '~/components/molecules/AppPopoverHelp.vue'

describe('components/molecules/AppPopoverHelp', () => {
  let options: any
  let popoverProps: any

  beforeEach(() => {
    popoverProps = {}
    options = {
      stubs: {
        FontAwesomeIcon: true,
        VPopover: defineComponent({
          props: ['placement', 'trigger', 'popperOptions'],
          setup (props) {
            popoverProps = props
          },
          template: '<div><slot name="popover" /></div>'
        })
      },
      slots: {}
    }
  })

  test('renders correctly', () => {
    const { container } = render(AppPopoverHelp, options)

    expect(container).toMatchSnapshot()
  })

  describe('slots', () => {
    describe('default', () => {
      test('popover内に表示', () => {
        options.slots.default = 'slot-default'
        const { getByText } = render(AppPopoverHelp, options)

        getByText('slot-default')
      })
    })
  })

  describe('VPopover', () => {
    test('placement = top', () => {
      render(AppPopoverHelp, options)

      expect(popoverProps.placement).toBe('top')
    })

    test('trigger = "click hover"', () => {
      render(AppPopoverHelp, options)

      expect(popoverProps.trigger).toBe('click hover')
    })

    describe('popperOptions', () => {
      test('order = 890', () => {
        render(AppPopoverHelp, options)

        expect(popoverProps.popperOptions.modifiers.modifyLeftPosition.order).toBe(890)
      })

      test('enable = true', () => {
        render(AppPopoverHelp, options)

        expect(popoverProps.popperOptions.modifiers.modifyLeftPosition.enabled).toBeTruthy()
      })

      test('translate3dのleftが0未満にならない', () => {
        render(AppPopoverHelp, options)
        const result = popoverProps.popperOptions.modifiers.modifyLeftPosition.fn({
          styles: {
            transform: 'translate3d(-1px,0)'
          }
        })

        expect(result.styles.transform).toBe('translate3d(0px,0)')
      })
    })
  })
})
