import { fireEvent, render, waitFor } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import { defineComponent, Ref, ref } from '@vue/composition-api'
import { validate } from 'vee-validate'

import AppFormPost from '~/components/organisms/AppFormPost.vue'
import * as store from '~/store'
import usePostsApi from '~/composables/use-posts-api'
import settingFactory from '~/test/factories/setting'
import postFactory from '~/test/factories/post'
import useFontAwesomeIconStub from '~/test/stubs/FontAwesomeIcon'
import useValidationObserverStub from '~/test/stubs/ValidationObserver'
import { fakeEmojis, fakeText, getRules } from '~/test/helper'
import Post from '~/models/Post'

jest.mock('~/composables/use-posts-api')

describe('components/organisms/AppFormPost', () => {
  let options: any
  let usePostsApiMock: any

  beforeEach(() => {
    options = {
      props: {},
      stubs: {
        FontAwesomeIcon: useFontAwesomeIconStub().component,
        VPopover: true,
        AppInputImages: true,
        AppInputEmoji: true
      }
    }

    jest.spyOn(store, 'useStore').mockReturnValue(store.store)
    store.store.setting.setData(settingFactory.build())

    usePostsApiMock = {
      save: jest.fn(),
      post: ref<Post|null>(null)
    }
    usePostsApiMock.save.mockImplementation(() => {
      usePostsApiMock.post.value = postFactory.build()
      return Promise.resolve()
    })
    mocked(usePostsApi).mockImplementation((post) => {
      if (post) {
        usePostsApiMock.post.value = post
      }
      return {
        ...usePostsApiMock
      }
    })
  })

  test('renders correctly', () => {
    store.store.setting.setData(settingFactory.build({
      postDefault: {
        denyRobotScope: [],
        enableReaction: true,
        enableTwitterShare: true,
        allowedEmojis: [],
        deniedEmojis: []
      }
    }))
    const { container } = render(AppFormPost, options)

    expect(container).toMatchSnapshot()
  })

  describe('form', () => {
    describe('inputs', () => {
      describe('タイトル', () => {
        test('32文字まで', async () => {
          const rules = getRules(AppFormPost, 'タイトル', options)!

          const result1 = await validate(fakeText(33), rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.max).toBeTruthy()

          const result2 = await validate(fakeText(32), rules)
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('キャプション', () => {
        test('200文字まで', async () => {
          const rules = getRules(AppFormPost, 'キャプション', options)!

          const result1 = await validate(fakeText(201), rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.max).toBeTruthy()

          const result2 = await validate(fakeText(200), rules)
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('本文', () => {
        test('300000文字まで', async () => {
          const rules = getRules(AppFormPost, '本文', options)!

          const result1 = await validate(fakeText(300001), rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.max).toBeTruthy()

          const result2 = await validate(fakeText(300000), rules)
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('パスワード', () => {
        beforeEach(() => {
          options.props.post = postFactory.build({
            scope: 'password'
          })
        })

        test('scope = passwordなら必須', async () => {
          const { getByTestId } = render(AppFormPost, options)
          expect(getByTestId('input-パスワード')).toBeInTheDocument()

          const rules = getRules(AppFormPost, 'パスワード', options)!

          const result1 = await validate('', rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.required).toBeTruthy()

          const result2 = await validate('password', rules)
          expect(result2.valid).toBeTruthy()
        })

        test('alpha_dashのみ', async () => {
          const rules = getRules(AppFormPost, 'パスワード', options)!

          const result1 = await validate('パスワード', rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.alpha_dash).toBeTruthy()

          const result2 = await validate('password1_-', rules)
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('公開期間', () => {
        test('publishStart < publishEnd', async () => {
          const rules = getRules(AppFormPost, 'publishStart', options)!

          const result1 = await validate('2020-01-01T00:00', rules, {
            values: {
              publishStart: '2020-01-01T00:00',
              publishEnd: '2020-01-01T00:00'
            }
          })
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.start_lt_end).toBe('終了日時は開始日時より後にしてください')

          const result2 = await validate('2020-01-01T00:00', rules, {
            values: {
              publishStart: '2020-01-01T00:00',
              publishEnd: '2020-01-01T00:01'
            }
          })
          expect(result2.valid).toBeTruthy()
        })

        test('publishStartかpublishEndが空ならOK', async () => {
          const rules = getRules(AppFormPost, 'publishStart', options)!

          const result1 = await validate('2020-01-01T00:00', rules, {
            values: {
              publishStart: null,
              publishEnd: '2020-01-01T00:00'
            }
          })
          expect(result1.valid).toBeTruthy()

          const result2 = await validate('2020-01-01T00:00', rules, {
            values: {
              publishStart: '2020-01-01T00:00',
              publishEnd: null
            }
          })
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('絵文字', () => {
        describe('デフォルト設定を使用', () => {
          test('初期状態ではtrue', () => {
            const { getByRole } = render(AppFormPost, options)

            expect(getByRole('form')).toHaveFormValues({
              デフォルト設定を使用: true
            })
          })

          test('利用する絵文字か利用しない絵文字がnullでなければfalse', () => {
            options.props.post = postFactory.build({
              allowedEmojis: [],
              deniedEmojis: null
            })
            const { getByRole } = render(AppFormPost, options)
            expect(getByRole('form')).toHaveFormValues({
              デフォルト設定を使用: false
            })
          })

          test('trueならAppInputEmojiが使用不可', () => {
            const inputEmojiProps: any[] = []
            options.stubs.AppInputEmoji = defineComponent({
              props: ['disabled'],
              setup (props) {
                inputEmojiProps.push(props)
              },
              template: '<div><slot name="button" /></div>'
            })
            const { getByRole } = render(AppFormPost, options)

            expect(getByRole('form')).toHaveFormValues({
              デフォルト設定を使用: true
            })
            expect(getByRole('button', { name: '利用する絵文字を選択' })).toHaveAttribute('disabled')
            expect(getByRole('button', { name: '利用しない絵文字を選択' })).toHaveAttribute('disabled')
            expect(inputEmojiProps).toStrictEqual([
              { disabled: true },
              { disabled: true }
            ])
          })

          test('trueなら絵文字一覧にグローバル設定のリストを表示する', () => {
            const inputEmojiProps: any[] = []
            options.stubs.AppInputEmoji = defineComponent({
              props: ['value'],
              setup (props) {
                inputEmojiProps.push(props)
              },
              template: '<div />'
            })
            const { getByRole } = render(AppFormPost, options)

            expect(getByRole('form')).toHaveFormValues({
              デフォルト設定を使用: true
            })
            expect(inputEmojiProps).toStrictEqual([
              { value: store.store.setting.data.value?.postDefault.allowedEmojis },
              { value: store.store.setting.data.value?.postDefault.deniedEmojis }
            ])
          })

          test('falseなら絵文字一覧に投稿設定のリストを表示する', () => {
            const inputEmojiProps: any[] = []
            options.stubs.AppInputEmoji = defineComponent({
              props: ['value'],
              setup (props) {
                inputEmojiProps.push(props)
              },
              template: '<div />'
            })
            options.props.post = postFactory.build({
              allowedEmojis: fakeEmojis(),
              deniedEmojis: fakeEmojis()
            })
            const { getByRole } = render(AppFormPost, options)

            expect(getByRole('form')).toHaveFormValues({
              デフォルト設定を使用: false
            })
            expect(inputEmojiProps).toStrictEqual([
              { value: options.props.post.allowedEmojis },
              { value: options.props.post.deniedEmojis }
            ])
          })
        })
      })
    })

    describe('submit', () => {
      let invalid: Ref<boolean>

      beforeEach(() => {
        const stub = useValidationObserverStub()
        options.stubs.ValidationObserver = stub.component
        invalid = stub.invalid

        options.stubs.AppInputImages = defineComponent({
          setup () {
            return { upload: jest.fn() }
          },
          template: '<div />'
        })
      })

      test('入力エラーがあれば送信不可', () => {
        invalid.value = true
        const { getByRole } = render(AppFormPost, options)

        expect(getByRole('button', { name: '投稿する' })).toHaveAttribute('disabled')
      })

      test('入力エラーがなければ送信可能', () => {
        const { getByRole } = render(AppFormPost, options)

        expect(getByRole('button', { name: '投稿する' })).not.toHaveAttribute('disabled')
      })

      test('送信中は送信不可', async () => {
        const { getByRole } = render(AppFormPost, options)
        await fireEvent.submit(getByRole('form'))

        expect(getByRole('button', { name: '投稿する' })).toHaveAttribute('disabled')
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
        const { getByRole } = render(AppFormPost, options)
        expect(buttonProps.indeterminate).toBeFalsy()

        await fireEvent.submit(getByRole('form'))
        expect(buttonProps.indeterminate).toBeTruthy()
      })
    })

    describe('onSubmit', () => {
      let uploadMock: jest.Mock

      beforeEach(() => {
        uploadMock = jest.fn()
        options.stubs.AppInputImages = defineComponent({
          setup () {
            return { upload: uploadMock }
          },
          template: '<div />'
        })
      })

      test('AppInputImagesのuploadを実行', async () => {
        const { getByRole } = render(AppFormPost, options)
        await fireEvent.submit(getByRole('form'))

        expect(uploadMock).toBeCalled()
      })
    })

    describe('onUploaded', () => {
      let uploadMock: jest.Mock
      let inputImagesFireUploadedFunction: Function

      beforeEach(() => {
        uploadMock = jest.fn()
        options.stubs.AppInputImages = defineComponent({
          setup (_props, { emit }) {
            inputImagesFireUploadedFunction = (args: any) => emit('uploaded', args)
            return { upload: uploadMock }
          },
          template: '<div />'
        })
      })

      test('saveを実行', () => {
        render(AppFormPost, options)
        inputImagesFireUploadedFunction()

        expect(usePostsApiMock.save).toBeCalled()
      })

      test('uploadedイベントで渡された引数をinput.imagesにセット', () => {
        const arg = ['foo']
        render(AppFormPost, options)
        inputImagesFireUploadedFunction(arg)

        expect(usePostsApiMock.save.mock.calls[0][0].images).toBe(arg)
      })

      test('useDefaultEmojisがtrueならallowedEmojisとdeniedEmojisをnullにする', async () => {
        options.props.post = postFactory.build({
          allowedEmojis: [],
          deniedEmojis: []
        })
        const { getByLabelText } = render(AppFormPost, options)
        await fireEvent.update(getByLabelText('デフォルト設定を使用'))
        inputImagesFireUploadedFunction()

        expect(usePostsApiMock.save.mock.calls[0][0].allowedEmojis).toBeNull()
        expect(usePostsApiMock.save.mock.calls[0][0].deniedEmojis).toBeNull()
      })

      test('saveに成功したらsubmittedを発火', async () => {
        const { emitted } = render(AppFormPost, options)
        inputImagesFireUploadedFunction()

        await waitFor(() => {
          expect(emitted().submitted).toHaveLength(1)
          expect(emitted().submitted[0][0]).toBeInstanceOf(Post)
        })
      })
    })
  })
})
