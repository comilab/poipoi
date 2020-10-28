import { render } from '@testing-library/vue'
import * as NuxtCompositionApi from 'nuxt-composition-api'
import { ref } from '@vue/composition-api'

import AppGlobalMeta from '~/components/organisms/AppGlobalMeta.vue'
import * as store from '~/store'
import settingFactory from '~/test/factories/setting'

describe('components/organisms/AppGlobalMeta', () => {
  let options: any
  let contextMock: any
  let metaMock: any

  beforeEach(() => {
    options = {
    }

    store.store.setting.setData(settingFactory.build())
    jest.spyOn(store, 'useStore').mockReturnValue(store.store)

    contextMock = {
      route: ref<any>({
        name: ''
      })
    }
    jest.spyOn(NuxtCompositionApi, 'useContext').mockReturnValue(contextMock)

    metaMock = {
      titleTemplate: ref(''),
      title: ref(''),
      meta: ref<any[]>([]),
      link: ref<any[]>([])
    }
    jest.spyOn(NuxtCompositionApi, 'useMeta').mockReturnValue(metaMock)
  })

  test('titleTemplate', () => {
    render(AppGlobalMeta, options)

    expect(metaMock.titleTemplate.value).toBe(`%s - ${store.store.setting.data.value!.siteTitle}`)
  })

  describe('title', () => {
    test('login -> ログイン', () => {
      contextMock.route.value.name = 'login'
      render(AppGlobalMeta, options)

      expect(metaMock.title.value).toBe('ログイン')
    })

    test('posts-new -> 投稿', () => {
      contextMock.route.value.name = 'posts-new'
      render(AppGlobalMeta, options)

      expect(metaMock.title.value).toBe('投稿')
    })

    test('posts-id-edit -> 編集', () => {
      contextMock.route.value.name = 'posts-id-edit'
      render(AppGlobalMeta, options)

      expect(metaMock.title.value).toBe('編集')
    })

    test('notifications -> お知らせ', () => {
      contextMock.route.value.name = 'notifications'
      render(AppGlobalMeta, options)

      expect(metaMock.title.value).toBe('お知らせ')
    })

    test('settings -> 設定', () => {
      contextMock.route.value.name = 'settings'
      render(AppGlobalMeta, options)

      expect(metaMock.title.value).toBe('設定')
    })
  })

  test('description', () => {
    render(AppGlobalMeta, options)

    expect(metaMock.meta.value).toContainEqual({
      hid: 'description',
      name: 'description',
      content: store.store.setting.data.value!.siteDescription
    })
  })

  describe('denyRobot', () => {
    test('trueならmetaタグをセット', () => {
      store.store.setting.setData(settingFactory.build({
        denyRobot: true
      }))
      render(AppGlobalMeta, options)

      expect(metaMock.meta.value).toContainEqual({
        hid: 'robots',
        name: 'robots',
        content: 'noindex, nofollow, noarchive'
      })
    })

    test('falseなら何もしない', () => {
      store.store.setting.setData(settingFactory.build({
        denyRobot: false
      }))
      render(AppGlobalMeta, options)

      expect(metaMock.meta.value.find((meta: any) => meta.hid === 'robots')).toBeUndefined()
    })
  })

  describe('enableFeed', () => {
    test('trueならlinkタグをセット', () => {
      store.store.setting.setData(settingFactory.build({
        enableFeed: true
      }))
      render(AppGlobalMeta, options)

      expect(metaMock.link.value).toContainEqual({
        rel: 'alternate',
        type: 'application/rss+xml',
        title: store.store.setting.data.value!.siteTitle,
        href: '/feed'
      })
    })

    test('falseなら何もしない', () => {
      store.store.setting.setData(settingFactory.build({
        enableFeed: false
      }))
      render(AppGlobalMeta, options)

      expect(metaMock.link.value.find((link: any) => link.href === '/feed')).toBeUndefined()
    })
  })
})
