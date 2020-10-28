import { render, RenderOptions, within, fireEvent } from '@testing-library/vue'
import { defineComponent } from 'nuxt-composition-api'

import AppInputEmoji from '~/components/molecules/AppInputEmoji.vue'

describe('components/molecules/AppInputEmoji', () => {
  let options: RenderOptions<AppInputEmoji>
  let props: any

  beforeEach(() => {
    props = {
      value: []
    }

    options = {
      props
    }
  })

  test('renders correctly', () => {
    const { container } = render(AppInputEmoji, options)

    expect(container).toMatchSnapshot()
  })

  describe('props', () => {
    describe('value', () => {
      test('AppEmojiに渡す', () => {
        let emojiProps: any
        options.stubs = {
          AppEmoji: defineComponent({
            props: ['text'],
            setup (props) {
              emojiProps = props
            },
            template: '<span />'
          })
        }
        props.value = ['🍣']
        const { queryAllByTestId } = render(AppInputEmoji, options)

        expect(queryAllByTestId('emoji')).toHaveLength(1)
        expect(emojiProps.text).toBe('🍣')
      })

      test('空配列の場合はテキストを表示', () => {
        props.value = []
        const { getByTestId } = render(AppInputEmoji, options)

        within(getByTestId('emojis')).getByText('全ての絵文字を使用')
      })
    })

    describe('label', () => {
      test('ラベルとして表示', () => {
        props.label = 'label'
        const { container, getByTestId } = render(AppInputEmoji, options)

        expect(container).toMatchSnapshot()
        within(getByTestId('label')).getByText('label')
      })

      test('空ならラベル要素自体を描画しない', () => {
        const { container, queryByTestId } = render(AppInputEmoji, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('label')).not.toBeInTheDocument()
      })
    })

    describe('disabled', () => {
      test('AppTwemojiPickerに渡す', () => {
        let twemojiPickerProps: any
        options.stubs = {
          AppTwemojiPicker: defineComponent({
            props: ['disabled'],
            setup (props) {
              twemojiPickerProps = props
            },
            template: '<div />'
          })
        }
        props.disabled = true
        render(AppInputEmoji, options)

        expect(twemojiPickerProps.disabled).toBeTruthy()
      })

      test('AppEmojiをクリックしても何も起こらない', async () => {
        props.value = ['🍣']
        props.disabled = true
        const { getByTestId, emitted } = render(AppInputEmoji, options)
        await fireEvent.click(getByTestId('emoji'))

        expect(emitted().input).toBeFalsy()
      })
    })
  })

  describe('slots', () => {
    describe('button', () => {
      test('AppTwemojiPicker内に表示', () => {
        options.stubs = {
          AppTwemojiPicker: defineComponent({
            template: '<div><slot /></div>'
          })
        }
        options.slots = { button: 'button' }
        const { container, getByTestId } = render(AppInputEmoji, options)

        expect(container).toMatchSnapshot()
        within(getByTestId('twemoji-picker')).getByText('button')
      })
    })
  })

  describe('emit', () => {
    describe('select', () => {
      test('AppTwemojiPickerでselectした時に発火', () => {
        let twemojiPickerFireSelectFunction: Function
        options.stubs = {
          AppTwemojiPicker: defineComponent({
            setup (_props, { emit }) {
              twemojiPickerFireSelectFunction = () => emit('select', '🍣')
            },
            template: '<div />'
          })
        }
        const { emitted } = render(AppInputEmoji, options)
        twemojiPickerFireSelectFunction!()

        expect(emitted().input).toHaveLength(1)
        expect(emitted().input[0]).toStrictEqual([['🍣']])
      })

      test('AppEmojiをclickした時に発火', async () => {
        props.value = ['🍣', '💯']
        const { getAllByTestId, emitted } = render(AppInputEmoji, options)
        await fireEvent.click(getAllByTestId('emoji')[0])

        expect(emitted().input).toHaveLength(1)
        expect(emitted().input[0]).toStrictEqual([['💯']])
      })
    })
  })
})
