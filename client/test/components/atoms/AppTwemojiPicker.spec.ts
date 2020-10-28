import { render, RenderOptions } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import { defineComponent, ref } from 'nuxt-composition-api'
import { Ref } from '@vue/composition-api'
import EmojiAllData from '@kevinfaguiar/vue-twemoji-picker/emoji-data/ja/emoji-all-groups.json'
import EmojiGroups from '@kevinfaguiar/vue-twemoji-picker/emoji-data/emoji-groups.json'
import { useWindowSize } from '@vueuse/core'

import AppTwemojiPicker from '~/components/atoms/AppTwemojiPicker.vue'

jest.mock('@vueuse/core')

describe('components/atoms/AppTwemojiPicker', () => {
  let options: RenderOptions<AppTwemojiPicker>
  let props: any
  let twemojiPickerStub
  let twemojiPickerProps: any
  let twemojiPickerFireAddedFunction: Function
  let twemojiPickerFireAddedFunctionArg: string
  let windowWidth: Ref<number>

  beforeEach(() => {
    twemojiPickerStub = defineComponent({
      props: [
        'emojiData',
        'emojiGroups',
        'pickerWidth',
        'searchEmojisFeat',
        'emojiPickerDisabled',
        'emojiUnicodeAdded'
      ],
      setup (props, { emit }) {
        twemojiPickerProps = props
        twemojiPickerFireAddedFunction = () => emit('emojiUnicodeAdded', twemojiPickerFireAddedFunctionArg)
      },
      template: '<div><slot name="twemoji-picker-button"></slot></div>'
    })

    windowWidth = ref(1)
    mocked(useWindowSize).mockImplementation(() => {
      return {
        width: windowWidth,
        height: ref(0)
      }
    })

    props = {}

    options = {
      props,
      slots: {
        default: 'default-slot'
      },
      stubs: {
        TwemojiPicker: twemojiPickerStub
      }
    }
  })

  test('renders correctly', () => {
    const { container, getByText } = render(AppTwemojiPicker, options)

    expect(container).toMatchSnapshot()
    getByText('default-slot')
  })

  test('emojiGroupsが正常に渡されている', () => {
    render(AppTwemojiPicker, options)

    expect(twemojiPickerProps.emojiGroups).toBe(EmojiGroups)
  })

  test('searchEmojisFeat = true', () => {
    render(AppTwemojiPicker, options)

    expect(twemojiPickerProps.searchEmojisFeat).toBeTruthy()
  })

  describe('props', () => {
    describe('emojis', () => {
      test('初期値なら全絵文字を渡す', () => {
        render(AppTwemojiPicker, options)

        expect(twemojiPickerProps.emojiData).toBe(EmojiAllData)
      })

      test('空配列が渡された場合も全絵文字を渡す', () => {
        props.emojis = []
        render(AppTwemojiPicker, options)

        expect(twemojiPickerProps.emojiData).toBe(EmojiAllData)
      })

      test('渡された絵文字でEmojiAllDataをフィルタリングする', () => {
        props.emojis = ['🍣']
        render(AppTwemojiPicker, options)

        const emojiData = twemojiPickerProps.emojiData
        expect(emojiData).toHaveLength(1)
        expect(emojiData[0].emojiList).toHaveLength(1)
        expect(emojiData[0].emojiList[0].unicode).toBe('🍣')
      })
    })

    describe('disabled', () => {
      test('初期値はfalse', () => {
        render(AppTwemojiPicker, options)

        expect(twemojiPickerProps.emojiPickerDisabled).toBeFalsy()
      })

      test('emojiPickerDisabledに値が渡される', () => {
        props.disabled = true
        render(AppTwemojiPicker, options)

        expect(twemojiPickerProps.emojiPickerDisabled).toBeTruthy()
      })
    })

    describe('pickerWidth', () => {
      test('ウィンドウ幅が532pxを超える場合は500を渡す', () => {
        windowWidth.value = 533
        render(AppTwemojiPicker, options)

        expect(twemojiPickerProps.pickerWidth).toBe(500)
      })

      test('ウィンドウ幅が532px以下の場合は-32にした値を渡す', () => {
        windowWidth.value = 531
        render(AppTwemojiPicker, options)

        expect(twemojiPickerProps.pickerWidth).toBe(499)
      })
    })

    describe('emit', () => {
      describe('select', () => {
        beforeEach(() => {
          twemojiPickerFireAddedFunctionArg = '🍣'
        })

        test('emojiUnicodeAddedされた時に発火', () => {
          const { emitted } = render(AppTwemojiPicker, options)
          twemojiPickerFireAddedFunction()

          expect(emitted().select).toHaveLength(1)
          expect(emitted().select[0]).toStrictEqual(['🍣'])
        })
      })
    })
  })
})
