import { fireEvent, render, waitFor, within } from '@testing-library/vue'
import { Ref } from '@vue/composition-api'
import * as NuxtCompositionApi from 'nuxt-composition-api'
import { validate } from 'vee-validate'
import faker from 'faker'
import VueScrollTo from 'vue-scrollto'

import Settings from '~/pages/settings.vue'
import * as store from '~/store'
import { fakeText, getRules } from '~/test/helper'
import useValidationObserverStub from '~/test/stubs/ValidationObserver'
import settingFactory from '~/test/factories/setting'
import userFactory from '~/test/factories/user'

jest.mock('vue-scrollto')

describe('pages/settings', () => {
  let options: any
  let fetchMock: any

  beforeEach(() => {
    options = {
      stubs: {
        FontAwesomeIcon: true,
        VPopover: true,
        AppTwemojiPicker: true
      },
      mocks: {
        $fetchState: {
          pending: false
        }
      }
    }

    store.store.setting.setData(settingFactory.build())
    store.store.session.setUser(userFactory.build())
    jest.spyOn(store.store.setting, 'save').mockResolvedValue()
    jest.spyOn(store.store.session, 'load').mockResolvedValue()
    jest.spyOn(store, 'useStore').mockReturnValue(store.store)

    fetchMock = {}
    jest.spyOn(NuxtCompositionApi, 'useFetch').mockReturnValue(fetchMock)
  })

  test('renders correctly', () => {
    store.store.setting.setData(settingFactory.build({
      siteTitle: 'site-title',
      siteDescription: 'site-description',
      perPage: 10,
      denyRobot: true,
      enableFeed: true,
      postDefault: {
        denyRobotScope: [],
        enableReaction: true,
        allowedEmojis: [],
        deniedEmojis: [],
        enableTwitterShare: true
      }
    }))
    store.store.session.setUser(userFactory.build({
      name: 'user-name',
      email: 'user@example.com'
    }))
    const { container } = render(Settings, options)

    expect(container).toMatchSnapshot()
  })

  describe('form', () => {
    describe('inputs', () => {
      describe('ユーザ名', () => {
        let rules: any

        beforeEach(() => {
          rules = getRules(Settings, 'ユーザ名', options)!
        })

        test('必須', async () => {
          const result1 = await validate('', rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.required).toBeTruthy()

          const result2 = await validate(faker.internet.email(), rules)
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('メールアドレス', () => {
        let rules: any

        beforeEach(() => {
          rules = getRules(Settings, 'メールアドレス', options)!
        })

        test('必須', async () => {
          const result1 = await validate('', rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.required).toBeTruthy()

          const result2 = await validate('foo@example.com', rules)
          expect(result2.valid).toBeTruthy()
        })

        test('メールアドレス', async () => {
          const result1 = await validate(faker.random.word(), rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.email).toBeTruthy()

          const result2 = await validate('foo@example.com', rules)
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('サイト名', () => {
        let rules: any

        beforeEach(() => {
          rules = getRules(Settings, 'サイト名', options)!
        })

        test('必須', async () => {
          const result1 = await validate('', rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.required).toBeTruthy()

          const result2 = await validate(faker.internet.email(), rules)
          expect(result2.valid).toBeTruthy()
        })

        test('32文字まで', async () => {
          const result1 = await validate(fakeText(33), rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.max).toBeTruthy()

          const result2 = await validate(fakeText(32), rules)
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('サイト概要', () => {
        let rules: any

        beforeEach(() => {
          rules = getRules(Settings, 'サイト概要', options)!
        })

        test('200文字まで', async () => {
          const result1 = await validate(fakeText(201), rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.max).toBeTruthy()

          const result2 = await validate(fakeText(200), rules)
          expect(result2.valid).toBeTruthy()
        })
      })

      describe('1ページあたりの表示件数', () => {
        let rules: any

        beforeEach(() => {
          rules = getRules(Settings, '1ページあたりの表示件数', options)!
        })

        test('必須', async () => {
          const result1 = await validate('', rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.required).toBeTruthy()

          const result2 = await validate('1', rules)
          expect(result2.valid).toBeTruthy()
        })

        test('数値', async () => {
          const result1 = await validate('a', rules)
          expect(result1.valid).toBeFalsy()
          expect(result1.failedRules.numeric).toBeTruthy()

          const result2 = await validate('1', rules)
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
      })

      test('入力エラーがあれば送信不可', () => {
        invalid.value = true
        const { getByRole } = render(Settings, options)

        expect(getByRole('button', { name: '保存' })).toHaveAttribute('disabled')
      })

      test('入力エラーがなければ送信可能', () => {
        const { getByRole } = render(Settings, options)

        expect(getByRole('button', { name: '保存' })).not.toHaveAttribute('disabled')
      })

      test('送信中は送信不可', async () => {
        const { getByRole } = render(Settings, options)
        await fireEvent.submit(getByRole('form'))

        expect(getByRole('button', { name: '保存' })).toHaveAttribute('disabled')
      })

      test('送信中はindeterminate = true', async () => {
        const { getByRole } = render(Settings, options)
        expect(within(getByRole('button', { name: '保存' })).queryByRole('status')).not.toBeInTheDocument()

        await fireEvent.submit(getByRole('form'))

        expect(within(getByRole('button', { name: '保存' })).queryByRole('status')).toBeInTheDocument()
      })
    })

    describe('onSubmit', () => {
      test('store.setting.saveを実行', async () => {
        const { getByRole } = render(Settings, options)
        await fireEvent.submit(getByRole('form'))

        expect(store.store.setting.save).toBeCalled()
      })

      test('store.session.loadを実行', async () => {
        const { getByRole } = render(Settings, options)
        await fireEvent.submit(getByRole('form'))

        await waitFor(() => {
          expect(store.store.session.load).toBeCalled()
        })
      })

      test('上部にスクロール', async () => {
        const { getByRole } = render(Settings, options)
        await fireEvent.submit(getByRole('form'))

        expect(VueScrollTo.scrollTo).toBeCalledWith('#top')
      })
    })
  })
})
