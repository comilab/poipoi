import { fireEvent, render, within } from '@testing-library/vue'
import { defineComponent, ref } from 'nuxt-composition-api'
import { Ref } from '@vue/composition-api'

import AppModal from '~/components/molecules/AppModal.vue'

describe('components/molecules/AppModal', () => {
  let options: any

  beforeEach(() => {
    options = {
      props: {
        value: true
      },
      stubs: {
        FontAwesomeIcon: true
      },
      scopedSlots: {}
    }
  })

  test('renders correctly', () => {
    const { container } = render(AppModal, options)

    expect(container).toMatchSnapshot()
  })

  describe('props', () => {
    describe('value', () => {
      test('trueならモーダルを表示', () => {
        options.props.value = true
        const { container, queryByTestId } = render(AppModal, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('overlay')).toBeInTheDocument()
      })

      test('falseならモーダルを非表示', () => {
        options.props.value = false
        const { container, queryByTestId } = render(AppModal, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('overlay')).not.toBeInTheDocument()
      })

      test('デフォルトはfalse', () => {
        options.props = {}
        const { queryByTestId } = render(AppModal, options)

        expect(queryByTestId('overlay')).not.toBeInTheDocument()
      })
    })

    describe('persistent', () => {
      test('trueなら閉じるボタンを表示しない', () => {
        options.props.persistent = true
        const { container, queryByTestId } = render(AppModal, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('close-button')).not.toBeInTheDocument()
      })

      test('trueならオーバーレイをクリックしても閉じない', async () => {
        options.props.persistent = true
        const { getByTestId, emitted } = render(AppModal, options)
        await fireEvent.click(getByTestId('overlay'))

        expect(emitted().closed).toBeFalsy()
      })

      test('falseなら閉じるボタンを表示', () => {
        options.props.persistent = false
        const { container, queryByTestId } = render(AppModal, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('close-button')).toBeInTheDocument()
      })

      test('デフォルトはfalse', () => {
        const { queryByTestId } = render(AppModal, options)

        expect(queryByTestId('close-button')).toBeInTheDocument()
      })
    })
  })

  describe('slots', () => {
    describe('default', () => {
      test('content内に表示', () => {
        options.scopedSlots = {
          default: '<div>slot-default</div>'
        }
        const { getByTestId } = render(AppModal, options)

        within(getByTestId('content')).getByText('slot-default')
      })

      test('scope.closeを実行するとモーダルを閉じる', async () => {
        options.scopedSlots = {
          default: `
            <div slot-scope="{ close }">
              <button data-testid="slot-close-button" @click="close" />
            </div>
          `
        }
        const { getByTestId, emitted } = render(AppModal, options)
        expect(getByTestId('slot-close-button')).toBeInTheDocument()

        await fireEvent.click(getByTestId('slot-close-button'))

        expect(emitted().closed).toHaveLength(1)
      })
    })
  })

  describe('open', () => {
    let wrapper: any
    let appModal: Ref<any>
    let isOpen: Ref<boolean>
    let onInput: jest.Mock
    let onOpened: jest.Mock

    beforeEach(() => {
      onInput = jest.fn()
      onOpened = jest.fn()
      wrapper = defineComponent({
        components: { AppModal },
        setup () {
          appModal = ref()
          isOpen = ref(false)
          return { appModal, isOpen, onInput, onOpened }
        },
        template: `
          <div>
            <AppModal
              ref="appModal"
              v-model="isOpen"
              @input="onInput"
              @opened="onOpened"
            />
          </div>
        `
      })
    })

    test('実行するとvalue=trueになる', () => {
      render(wrapper, options)
      appModal.value.open()

      expect(isOpen.value).toBeTruthy()
    })

    test('inputイベントを発火', () => {
      render(wrapper, options)
      appModal.value.open()

      expect(onInput).toBeCalledWith(true)
    })

    test('openedイベントを発火', () => {
      render(wrapper, options)
      appModal.value.open()

      expect(onOpened).toBeCalled()
    })
  })

  describe('close', () => {
    let wrapper: any
    let appModal: Ref<any>
    let isOpen: Ref<boolean>
    let onInput: jest.Mock
    let onClosed: jest.Mock

    beforeEach(() => {
      onInput = jest.fn()
      onClosed = jest.fn()
      wrapper = defineComponent({
        components: { AppModal },
        setup () {
          appModal = ref()
          isOpen = ref(true)
          return { appModal, isOpen, onInput, onClosed }
        },
        template: `
          <div>
            <AppModal
              ref="appModal"
              v-model="isOpen"
              @input="onInput"
              @closed="onClosed"
            />
          </div>
        `
      })
    })

    test('実行するとvalue=falseになる', () => {
      render(wrapper, options)
      appModal.value.close()

      expect(isOpen.value).toBeFalsy()
    })

    test('inputイベントを発火', () => {
      render(wrapper, options)
      appModal.value.close()

      expect(onInput).toBeCalledWith(false)
    })

    test('closedイベントを発火', () => {
      render(wrapper, options)
      appModal.value.close()

      expect(onClosed).toBeCalled()
    })
  })

  describe('event', () => {
    test('オーバーレイをクリックすると閉じる', async () => {
      const { getByTestId, emitted } = render(AppModal, options)
      await fireEvent.click(getByTestId('overlay'))

      expect(emitted().closed).toHaveLength(1)
    })

    test('閉じるボタンをクリックすると閉じる', async () => {
      const { getByTestId, emitted } = render(AppModal, options)
      await fireEvent.click(getByTestId('close-button'))

      expect(emitted().closed).toHaveLength(1)
    })
  })
})
