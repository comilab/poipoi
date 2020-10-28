import { fireEvent, render, waitFor, within } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import { defineComponent, Ref, ref } from '@vue/composition-api'
import { faExclamationTriangle, faLock } from '@fortawesome/free-solid-svg-icons'

import AppFormOneCushion from '~/components/organisms/AppFormOneCushion.vue'
import usePostsApi from '~/composables/use-posts-api'
import postFactory from '~/test/factories/post'

jest.mock('~/composables/use-posts-api')
jest.useFakeTimers()

describe('components/organisms/AppFormOneCushion', () => {
  let options: any
  let usePostsApiMock: any

  beforeEach(() => {
    options = {
      props: {
        post: postFactory.build()
      },
      stubs: {
        FontAwesomeIcon: true
      }
    }
    usePostsApiMock = {
      verify: jest.fn().mockResolvedValue(null),
      verifying: ref(false)
    }
    mocked(usePostsApi).mockImplementation((post) => {
      return {
        ...usePostsApiMock,
        post: ref(post)
      }
    })
  })

  describe('props', () => {
    describe('post', () => {
      describe('rating = r18', () => {
        beforeEach(() => {
          options.props.post = postFactory.build({
            rating: 'r18',
            scope: 'public'
          })
        })

        test('renders correctly', () => {
          const { container } = render(AppFormOneCushion, options)

          expect(container).toMatchSnapshot()
        })

        test('faExclamationTriangleを表示', () => {
          let fontAwesomeIconProps: any
          options.stubs.AppButton = true
          options.stubs.FontAwesomeIcon = defineComponent({
            props: ['icon'],
            setup (props) {
              fontAwesomeIconProps = props
            },
            template: '<span />'
          })
          render(AppFormOneCushion, options)

          expect(fontAwesomeIconProps.icon).toStrictEqual(faExclamationTriangle)
        })
      })

      describe('rating = nsfw', () => {
        beforeEach(() => {
          options.props.post = postFactory.build({
            rating: 'nsfw',
            scope: 'public'
          })
        })

        test('renders correctly', () => {
          const { container } = render(AppFormOneCushion, options)

          expect(container).toMatchSnapshot()
        })

        test('faExclamationTriangleを表示', () => {
          let fontAwesomeIconProps: any
          options.stubs.AppButton = true
          options.stubs.FontAwesomeIcon = defineComponent({
            props: ['icon'],
            setup (props) {
              fontAwesomeIconProps = props
            },
            template: '<span />'
          })
          render(AppFormOneCushion, options)

          expect(fontAwesomeIconProps.icon).toStrictEqual(faExclamationTriangle)
        })
      })

      describe('scope = password', () => {
        beforeEach(() => {
          options.props.post = postFactory.build({
            rating: null,
            scope: 'password'
          })
        })

        test('renders correctly', () => {
          const { container } = render(AppFormOneCushion, options)

          expect(container).toMatchSnapshot()
        })

        test('faLockを表示', () => {
          let fontAwesomeIconProps: any
          options.stubs.AppButton = true
          options.stubs.FontAwesomeIcon = defineComponent({
            props: ['icon'],
            setup (props) {
              fontAwesomeIconProps = props
            },
            template: '<span />'
          })
          render(AppFormOneCushion, options)

          expect(fontAwesomeIconProps.icon).toStrictEqual(faLock)
        })

        test('パスワード入力欄を表示', () => {
          const { getByLabelText } = render(AppFormOneCushion, options)

          expect(getByLabelText('パスワード')).toBeInTheDocument()
        })
      })
    })
  })

  describe('form', () => {
    describe('inputs', () => {
      beforeEach(() => {
        options.props.post = postFactory.build({
          scope: 'password'
        })
      })

      describe('パスワード', () => {
        test('必須', async () => {
          const { getByLabelText, getByTestId } = render(AppFormOneCushion, options)
          await fireEvent.update(getByLabelText('パスワード'), '')
          jest.runAllTimers()

          await waitFor(() => {
            expect(getByTestId('input-パスワード')).toHaveClass('invalid')
          })
        })
      })
    })

    describe('submit', () => {
      let invalid: Ref<boolean>

      beforeEach(() => {
        invalid = ref(false)
        options.stubs.ValidationObserver = defineComponent({
          setup () {
            return { invalid }
          },
          template: '<div><slot :invalid="invalid" /></div>'
        })
      })

      test('入力エラーがあれば送信不可', () => {
        invalid.value = true
        const { getByRole } = render(AppFormOneCushion, options)

        expect(getByRole('button')).toHaveAttribute('disabled')
      })

      test('入力エラーがなければ送信可能', () => {
        const { getByRole } = render(AppFormOneCushion, options)

        expect(getByRole('button')).not.toHaveAttribute('disabled')
      })

      test('送信中は送信不可', () => {
        usePostsApiMock.verifying.value = true
        const { getByRole } = render(AppFormOneCushion, options)

        expect(getByRole('button')).toHaveAttribute('disabled')
      })

      test('送信中はindeterminate = true', async () => {
        let buttonProps: any
        options.stubs.AppButton = defineComponent({
          props: ['indeterminate'],
          setup (props) {
            buttonProps = props
          },
          template: '<button />'
        })
        render(AppFormOneCushion, options)
        expect(buttonProps.indeterminate).toBeFalsy()

        usePostsApiMock.verifying!.value = true
        await waitFor(() => {
          expect(buttonProps.indeterminate).toBeTruthy()
        })
      })
    })

    describe('onSubmit', () => {
      describe('scope = passwordでない場合', () => {
        beforeEach(() => {
          options.props.post = postFactory.build({
            scope: 'public'
          })
        })

        test('scope = passwordでない場合はすぐにpassedイベントを発火', async () => {
          const { getByRole, emitted } = render(AppFormOneCushion, options)
          await fireEvent.submit(getByRole('form'))

          expect(emitted().passed).toHaveLength(1)
          expect(emitted().passed[0]).toStrictEqual([options.props.post])
        })
      })

      describe('scope = passwordの場合', () => {
        beforeEach(() => {
          options.props.post = postFactory.build({
            scope: 'password'
          })
        })

        test('verifyを実行', async () => {
          const { getByLabelText, getByRole } = render(AppFormOneCushion, options)
          await fireEvent.update(getByLabelText('パスワード'), 'foo')
          await fireEvent.submit(getByRole('form'))

          expect(usePostsApiMock.verify).toBeCalledWith({
            password: 'foo'
          })
        })

        test('verifyに成功したらpassedを発火', async () => {
          const { getByRole, emitted } = render(AppFormOneCushion, options)
          await fireEvent.submit(getByRole('form'))

          await waitFor(() => {
            expect(emitted().passed).toHaveLength(1)
            expect(emitted().passed[0]).toStrictEqual([options.props.post])
          })
        })

        test('verifyに失敗したらエラーを表示', async () => {
          usePostsApiMock.verify.mockRejectedValue()
          const { getByRole, emitted, getByTestId } = render(AppFormOneCushion, options)
          await fireEvent.submit(getByRole('form'))

          await waitFor(() => {
            expect(emitted().passed).toBeFalsy()
            within(getByTestId('input-パスワード')).getByText('パスワードが違います')
          })
        })
      })
    })
  })
})
