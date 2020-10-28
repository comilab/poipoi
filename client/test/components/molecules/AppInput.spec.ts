import { render, RenderOptions, fireEvent, within, waitFor } from '@testing-library/vue'
import { defineComponent } from 'nuxt-composition-api'
import dayjs from 'dayjs'

import AppInput from '~/components/molecules/AppInput.vue'

describe('components/molecules/AppInput', () => {
  let options: RenderOptions<AppInput>
  let props: any

  beforeEach(() => {
    props = {
      type: 'textd'
    }

    options = {
      props
    }
  })

  test('renders correctly', () => {
    const { container } = render(AppInput, options)

    expect(container).toMatchSnapshot()
  })

  describe('props', () => {
    describe('value', () => {
      describe('get', () => {
        test('v-modelとしてセット', () => {
          props.value = 'foo'
          const { container, getByDisplayValue } = render(AppInput, options)

          expect(container).toMatchSnapshot()
          getByDisplayValue('foo')
        })

        test('typeがdatetime-localだった場合は日付文字列にフォーマット', () => {
          props.type = 'datetime-local'
          props.value = dayjs('2020-01-01 00:00').toDate()
          const { container, getByDisplayValue } = render(AppInput, options)

          expect(container).toMatchSnapshot()
          getByDisplayValue('2020-01-01T00:00')
        })
      })

      describe('set', () => {
        test('inputイベントを発火', async () => {
          const { getByTestId, emitted } = render(AppInput, options)
          await fireEvent.update(getByTestId('input'), 'foo')

          expect(emitted().input).toHaveLength(1)
          expect(emitted().input[0]).toStrictEqual(['foo'])
        })

        test('typeがdatetime-localだった場合はDate型に変換', async () => {
          props.type = 'datetime-local'
          props.value = dayjs('2020-01-01 00:00').toDate()
          const { getByTestId, emitted } = render(AppInput, options)
          await fireEvent.update(getByTestId('input'), '2020-01-02 00:00')

          expect(emitted().input[0][0]).toBeInstanceOf(Date)
          expect(dayjs(emitted().input[0][0]).isSame('2020-01-02 00:00'))
        })

        test('typeがdatetime-localかつ値が空だった場合はそのまま渡す', async () => {
          props.type = 'datetime-local'
          props.value = dayjs('2020-01-01 00:00').toDate()
          const { getByTestId, emitted } = render(AppInput, options)
          await fireEvent.update(getByTestId('input'), '')

          expect(emitted().input[0][0]).toBe('')
        })

        test('typeがtextareaだった場合は高さを調節', async () => {
          props.type = 'textarea'
          const { getByTestId, queryByTestId } = render(AppInput, options)
          const height = queryByTestId('input')!.style.height

          await fireEvent.update(getByTestId('input'), 'foo')

          expect(queryByTestId('input')!.style.height).not.toBe(height)
        })
      })
    })

    describe('type', () => {
      test('checkbox', () => {
        props.type = 'checkbox'
        const { container } = render(AppInput, options)

        expect(container).toMatchSnapshot()
      })

      test('checkboxgroup', () => {
        props.type = 'checkboxgroup'
        const { container } = render(AppInput, options)

        expect(container).toMatchSnapshot()
      })

      test('radio', () => {
        props.type = 'radio'
        const { container } = render(AppInput, options)

        expect(container).toMatchSnapshot()
      })

      test('textarea', () => {
        props.type = 'textarea'
        const { container } = render(AppInput, options)

        expect(container).toMatchSnapshot()
      })
    })

    describe('label', () => {
      test('ラベルとして表示', () => {
        props.label = 'label'
        const { container, getByLabelText } = render(AppInput, options)

        expect(container).toMatchSnapshot()
        getByLabelText('label')
      })

      test('空の場合はlabel要素自体を描画しない', () => {
        const { container, queryByTestId } = render(AppInput, options)

        expect(container).toMatchSnapshot()
        expect(queryByTestId('label')).not.toBeInTheDocument()
      })

      test('nameがない場合はlabelをValidationProviderのnameに渡す', () => {
        let validationProviderProps: any
        options.stubs = {
          ValidationProvider: defineComponent({
            props: ['name'],
            setup (props) {
              validationProviderProps = props
            },
            template: '<div />'
          })
        }
        props.label = 'foo'
        render(AppInput, options)

        expect(validationProviderProps.name).toBe('foo')
      })
    })

    describe('vid', () => {
      test('ValidationProviderに渡す', () => {
        let validationProviderProps: any
        options.stubs = {
          ValidationProvider: defineComponent({
            props: ['vid'],
            setup (props) {
              validationProviderProps = props
            },
            template: '<div />'
          })
        }
        props.vid = 'foo'
        render(AppInput, options)

        expect(validationProviderProps.vid).toBe('foo')
      })
    })

    describe('name', () => {
      test('ValidationProviderのnameに渡す', () => {
        let validationProviderProps: any
        options.stubs = {
          ValidationProvider: defineComponent({
            props: ['name'],
            setup (props) {
              validationProviderProps = props
            },
            template: '<div />'
          })
        }
        props.name = 'foo'
        render(AppInput, options)

        expect(validationProviderProps.name).toBe('foo')
      })
    })

    describe('options', () => {
      test('checkboxgroupで正常に描画される', () => {
        props.options = [
          { label: 'label', value: 'value' }
        ]
        props.type = 'checkboxgroup'
        const { getByTestId } = render(AppInput, options)

        within(getByTestId('input')).getByLabelText('label')
        within(getByTestId('input')).getByDisplayValue('value')
      })

      test('radioで正常に描画される', () => {
        props.options = [
          { label: 'label', value: 'value' }
        ]
        props.type = 'radio'
        const { getByTestId } = render(AppInput, options)

        within(getByTestId('input')).getByLabelText('label')
        within(getByTestId('input')).getByDisplayValue('value')
      })
    })

    describe('checkboxLabel', () => {
      test('checkboxのラベルとして描画', () => {
        props.checkboxLabel = 'checkbox-label'
        props.type = 'checkbox'
        const { getByTestId } = render(AppInput, options)

        within(getByTestId('input')).getByLabelText('checkbox-label')
      })
    })

    describe('rules', () => {
      test('ValidationProviderのrulesに渡す', () => {
        let validationProviderProps: any
        options.stubs = {
          ValidationProvider: defineComponent({
            props: ['rules'],
            setup (props) {
              validationProviderProps = props
            },
            template: '<div />'
          })
        }
        props.rules = 'required'
        render(AppInput, options)

        expect(validationProviderProps.rules).toBe('required')
      })

      test('maxがあれば文字数カウンターを表示', () => {
        props.value = ''
        props.rules = { max: 300 }
        const { container, getByTestId } = render(AppInput, options)

        expect(container).toMatchSnapshot()
        getByTestId('counter')
      })
    })

    describe('immediate', () => {
      test('ValidationProviderのrulesに渡す', () => {
        let validationProviderProps: any
        options.stubs = {
          ValidationProvider: defineComponent({
            props: ['immediate'],
            setup (props) {
              validationProviderProps = props
            },
            template: '<div />'
          })
        }
        props.immediate = true
        render(AppInput, options)

        expect(validationProviderProps.immediate).toBeTruthy()
      })
    })

    describe('hideErrors', () => {
      test('trueならエラーがあっても表示しない', async () => {
        props.rules = 'required'
        const { getByTestId, updateProps, container, queryByTestId } = render(AppInput, options)
        getByTestId('errors')

        await updateProps({ hideErrors: true })

        expect(container).toMatchSnapshot()
        expect(queryByTestId('errors')).not.toBeInTheDocument()
      })
    })
  })

  describe('slots', () => {
    describe('label', () => {
      test('ラベルとして表示', () => {
        options.slots = { label: 'label' }
        const { container, getByLabelText } = render(AppInput, options)

        expect(container).toMatchSnapshot()
        getByLabelText('label')
      })
    })
  })

  describe('adjustHeight', () => {
    let scrollHeight: number

    beforeEach(() => {
      scrollHeight = 100
      jest.spyOn(HTMLTextAreaElement.prototype, 'scrollHeight', 'get')
        .mockImplementation(() => scrollHeight)
      props.type = 'textarea'
    })

    test('マウント時に実行', async () => {
      const { queryByTestId } = render(AppInput, options)

      await waitFor(() => {
        expect(queryByTestId('input')!.style.height).toBe('100px')
      })
    })

    test('高さの最小値は75px', async () => {
      scrollHeight = 74
      const { queryByTestId } = render(AppInput, options)

      await waitFor(() => {
        expect(queryByTestId('input')!.style.height).toBe('75px')
      })
    })

    test('高さの最大値は400px', async () => {
      scrollHeight = 401
      const { queryByTestId } = render(AppInput, options)

      await waitFor(() => {
        expect(queryByTestId('input')!.style.height).toBe('400px')
      })
    })
  })
})
