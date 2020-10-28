import { fireEvent, render, waitFor, within } from '@testing-library/vue'
import { mocked } from 'ts-jest/utils'
import * as NuxtCompositionApi from 'nuxt-composition-api'
import { Ref } from '@vue/composition-api'
import { validate } from 'vee-validate'
import faker from 'faker'

import Login from '~/pages/login.vue'
import * as store from '~/store'
import { getRules } from '~/test/helper'
import useValidationObserverStub from '~/test/stubs/ValidationObserver'

describe('pages/login', () => {
  let options: any
  let contextMock: any

  beforeEach(() => {
    options = {
      stubs: {
        FontAwesomeIcon: true
      }
    }

    jest.spyOn(store, 'useStore').mockReturnValue(store.store)

    contextMock = {
      redirect: jest.fn()
    }
    jest.spyOn(NuxtCompositionApi, 'useContext').mockReturnValue(contextMock)
  })

  test('renders correctly', () => {
    const { container } = render(Login, options)

    expect(container).toMatchSnapshot()
  })

  describe('form', () => {
    describe('inputs', () => {
      describe('メールアドレス', () => {
        let rules: any

        beforeEach(() => {
          rules = getRules(Login, 'メールアドレス', options)!
        })

        test('必須', async () => {
          const result1 = await validate('', rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.required).toBeTruthy()

          const result2 = await validate(faker.internet.email(), rules)
          expect(result2.valid).toBeTruthy()
        })

        test('メールアドレス', async () => {
          const result1 = await validate(faker.random.word(), rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.email).toBeTruthy()

          const result2 = await validate(faker.internet.email(), rules)
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('パスワード', () => {
        let rules: any

        beforeEach(() => {
          rules = getRules(Login, 'パスワード', options)!
        })

        test('必須', async () => {
          const result1 = await validate('', rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.required).toBeTruthy()

          const result2 = await validate(faker.random.word(), rules)
          expect(result2.valid).toBeTruthy()
        })
      })
    })

    describe('submit', () => {
      let invalid: Ref<boolean>

      beforeEach(() => {
        const stub = useValidationObserverStub()
        options.stubs.ValidationObserver = stub.component
        invalid = stub.invalid

        jest.spyOn(store.store.session, 'create').mockResolvedValue()
        jest.spyOn(store.store.session, 'load').mockResolvedValue()
      })

      test('入力エラーがあれば送信不可', () => {
        invalid.value = true
        const { getByRole } = render(Login, options)

        expect(getByRole('button', { name: 'ログイン' })).toHaveAttribute('disabled')
      })

      test('入力エラーがなければ送信可能', () => {
        const { getByRole } = render(Login, options)

        expect(getByRole('button', { name: 'ログイン' })).not.toHaveAttribute('disabled')
      })

      test('送信中は送信不可', async () => {
        const { getByRole } = render(Login, options)
        await fireEvent.submit(getByRole('form'))

        expect(getByRole('button', { name: 'ログイン' })).toHaveAttribute('disabled')
      })

      test('送信中はindeterminate = true', async () => {
        const { getByRole } = render(Login, options)
        expect(within(getByRole('button', { name: 'ログイン' })).queryByRole('status')).not.toBeInTheDocument()

        await fireEvent.submit(getByRole('form'))

        expect(within(getByRole('button', { name: 'ログイン' })).queryByRole('status')).toBeInTheDocument()
      })
    })

    describe('onSubmit', () => {
      beforeEach(() => {
        jest.spyOn(store.store.session, 'create').mockResolvedValue()
        jest.spyOn(store.store.session, 'load').mockResolvedValue()
      })

      test('store.session.createを実行', async () => {
        const { getByRole } = render(Login, options)
        await fireEvent.submit(getByRole('form'))

        expect(store.store.session.create).toBeCalled()
      })

      test('store.session.loadを実行', async () => {
        const { getByRole } = render(Login, options)
        await fireEvent.submit(getByRole('form'))

        await waitFor(() => {
          expect(store.store.session.load).toBeCalled()
        })
      })

      test('リクエストに成功したらリダイレクト', async () => {
        const { getByRole } = render(Login, options)
        await fireEvent.submit(getByRole('form'))

        await waitFor(() => {
          expect(contextMock.redirect).toBeCalledWith(200, '/')
        })
      })

      test('リクエストに失敗したらエラーを表示', async () => {
        mocked(store.store.session.create).mockRejectedValue(new Error())
        const { getByRole, getAllByText } = render(Login, options)
        await fireEvent.submit(getByRole('form'))

        await waitFor(() => {
          expect(getAllByText('メールアドレスかパスワードが違います')).toHaveLength(2)
        })
      })
    })
  })
})
