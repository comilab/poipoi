import { render } from '@testing-library/vue'
import * as NuxtCompositionApi from 'nuxt-composition-api'
import { ref } from '@vue/composition-api'

import AppPostMeta from '~/components/organisms/AppPostMeta.vue'
import * as store from '~/store'
import settingFactory from '~/test/factories/setting'
import postFactory from '~/test/factories/post'
import imageFactory from '~/test/factories/image'

describe('components/organisms/AppPostMeta', () => {
  let options: any
  let metaMock: any

  beforeEach(() => {
    options = {
      props: {
        post: postFactory.build()
      }
    }

    store.store.setting.setData(settingFactory.build())
    jest.spyOn(store, 'useStore').mockReturnValue(store.store)

    metaMock = {
      titleTemplate: ref(''),
      title: ref(''),
      meta: ref<any[]>([]),
      link: ref<any[]>([])
    }
    jest.spyOn(NuxtCompositionApi, 'useMeta').mockReturnValue(metaMock)
  })

  describe('title', () => {
    test('post.titleがある場合はそれを付与', () => {
      options.props.post = postFactory.build({
        title: 'foo'
      })
      render(AppPostMeta, options)

      expect(metaMock.title.value).toBe(`foo - ${store.store.setting.data.value!.siteTitle}`)
    })

    test('post.titleがない場合はcaptionを付与', () => {
      options.props.post = postFactory.build({
        title: '',
        caption: 'foo'
      })
      render(AppPostMeta, options)

      expect(metaMock.title.value).toBe(`foo - ${store.store.setting.data.value!.siteTitle}`)
    })
  })

  test('description', () => {
    render(AppPostMeta, options)

    expect(metaMock.meta.value).toContainEqual({
      hid: 'description',
      name: 'description',
      content: options.props.post.caption
    })
  })

  describe('denyRobot', () => {
    test('trueならmetaタグをセット', () => {
      options.props.post = postFactory.build({
        actualDenyRobot: true
      })
      render(AppPostMeta, options)

      expect(metaMock.meta.value).toContainEqual({
        hid: 'robots',
        name: 'robots',
        content: 'noindex, nofollow, noarchive'
      })
    })

    test('falseなら何もしない', () => {
      options.props.post = postFactory.build({
        actualDenyRobot: false
      })
      render(AppPostMeta, options)

      expect(metaMock.meta.value.find((meta: any) => meta.hid === 'robots')).toBeUndefined()
    })
  })

  describe('enableTwitterShare', () => {
    test('trueならmetaタグをセット', () => {
      options.props.post = postFactory.build({
        actualEnableTwitterShare: true,
        title: 'foo'
      })
      render(AppPostMeta, options)

      expect(metaMock.meta.value).toContainEqual({
        hid: 'og:url',
        property: 'og:url',
        content: options.props.post.url
      })
      expect(metaMock.meta.value).toContainEqual({
        hid: 'og:title',
        property: 'og:title',
        content: `foo - ${store.store.setting.data.value!.siteTitle}`
      })
      expect(metaMock.meta.value).toContainEqual({
        hid: 'og:description',
        property: 'og:description',
        content: options.props.post.caption
      })
    })

    test('falseなら何もしない', () => {
      options.props.post = postFactory.build({
        actualEnableTwitterShare: false
      })
      render(AppPostMeta, options)

      expect(
        metaMock.meta.value.filter((meta: any) => {
          return ['og:url', 'og:title', 'og:description'].includes(meta.hid)
        })
      ).toHaveLength(0)
    })

    describe('twitterカード', () => {
      let attributes: any

      beforeEach(() => {
        attributes = {
          actualEnableTwitterShare: true
        }
      })

      test('画像があってサムネイルを表示する設定の場合はsummary_large_image', () => {
        options.props.post = postFactory.build({
          ...attributes,
          showThumbnail: true,
          images: imageFactory.buildList(1)
        })
        render(AppPostMeta, options)

        expect(metaMock.meta.value).toContainEqual({
          hid: 'twitter:card',
          name: 'twitter:card',
          content: 'summary_large_image'
        })
        expect(metaMock.meta.value).toContainEqual({
          hid: 'og:image',
          property: 'og:image',
          content: options.props.post.images[0].publicPaths.medium
        })
      })

      test('画像がない場合はsummary', () => {
        options.props.post = postFactory.build({
          ...attributes,
          showThumbnail: true,
          images: []
        })
        render(AppPostMeta, options)

        expect(metaMock.meta.value).toContainEqual({
          hid: 'twitter:card',
          name: 'twitter:card',
          content: 'summary'
        })
      })

      test('サムネイルを表示しない設定の場合はsummary', () => {
        options.props.post = postFactory.build({
          ...attributes,
          showThumbnail: false,
          images: imageFactory.buildList(1)
        })
        render(AppPostMeta, options)

        expect(metaMock.meta.value).toContainEqual({
          hid: 'twitter:card',
          name: 'twitter:card',
          content: 'summary'
        })
      })
    })
  })
})
