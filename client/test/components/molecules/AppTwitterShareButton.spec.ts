import { render } from '@testing-library/vue'
import { defineComponent } from 'nuxt-composition-api'
import _ from 'lodash'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import AppTwitterShareButton from '~/components/molecules/AppTwitterShareButton.vue'
import { StoreProvider, store } from '~/store'
import settingFactory from '~/test/factories/setting'

describe('components/molecules/AppTwitterShareButton', () => {
  let props: any
  let wrapperComponent: any
  let options: any

  beforeEach(() => {
    store.setting.setData(settingFactory.build({
      siteTitle: 'site-title'
    }))
    props = {
      appendSiteTitle: false
    }
    wrapperComponent = defineComponent({
      components: { StoreProvider, AppTwitterShareButton },
      setup () {
        return { attrs: props }
      },
      template: `
        <StoreProvider>
          <AppTwitterShareButton v-bind="attrs" />
        </StoreProvider>
      `
    })
    options = {
      props: {},
      stubs: {
        FontAwesomeIcon: true
      }
    }
  })

  test('renders correctly', () => {
    const { container } = render(wrapperComponent, options)

    expect(container).toMatchSnapshot()
  })

  describe('props', () => {
    let buttonProps: any

    beforeEach(() => {
      buttonProps = {}
      options.stubs.AppButton = defineComponent({
        props: ['href'],
        setup (props) {
          buttonProps = props
        },
        template: '<div />'
      })
    })

    describe('url', () => {
      test('urlクエリを追加', () => {
        props.url = 'https://example.com'
        render(wrapperComponent, options)

        const url = new URL(buttonProps.href)
        expect(url.searchParams.get('url')).toBe(props.url)
      })
    })

    describe('text', () => {
      test('textパラメータを追加', () => {
        props.text = 'foo'
        render(wrapperComponent, options)

        const url = new URL(buttonProps.href)
        expect(url.searchParams.get('text')).toBe(props.text)
      })

      test('140文字に丸める', () => {
        props.text = _.times(141, String).join('')
        render(wrapperComponent, options)

        const url = new URL(buttonProps.href)
        expect(url.searchParams.get('text')!.length).toBe(140)
        expect(url.searchParams.get('text')!.substr(-1)).toBe('…')
      })

      test('urlがある場合は140-11文字に丸める', () => {
        props.text = _.times(141, String).join('')
        props.url = 'https://example.com'
        render(wrapperComponent, options)

        const url = new URL(buttonProps.href)
        expect(url.searchParams.get('text')!.length).toBe(140 - 11)
      })
    })

    describe('appendSiteTitle', () => {
      beforeEach(() => {
        store.setting.setData(settingFactory.build({
          siteTitle: 'site-title'
        }))
      })

      test('trueの場合は" - {サイト名}"をtext末尾に付与', () => {
        props.text = 'text'
        props.appendSiteTitle = true
        render(wrapperComponent, options)

        const url = new URL(buttonProps.href)
        expect(url.searchParams.get('text')).toBe('text - site-title')
      })

      test('trueかつtextが空の場合はサイト名のみをtextにセット', () => {
        props.appendSiteTitle = true
        render(wrapperComponent, options)

        const url = new URL(buttonProps.href)
        expect(url.searchParams.get('text')).toBe('site-title')
      })

      test('text全体で140文字に丸まるようにする', () => {
        props.text = _.times(141, String).join('')
        props.appendSiteTitle = true
        render(wrapperComponent, options)

        const url = new URL(buttonProps.href)
        expect(url.searchParams.get('text')!.length).toBe(140)
      })

      test('falseの場合はサイト名を付与しない', () => {
        props.text = 'text'
        props.appendSiteTitle = false
        render(wrapperComponent, options)

        const url = new URL(buttonProps.href)
        expect(url.searchParams.get('text')).toBe('text')
      })

      test('デフォルトはtrue', () => {
        props = {}
        render(wrapperComponent, options)

        const url = new URL(buttonProps.href)
        expect(url.searchParams.get('text')).toBe('site-title')
      })
    })
  })

  describe('AppButton', () => {
    let buttonProps: any

    beforeEach(() => {
      buttonProps = {}
      options.stubs.AppButton = defineComponent({
        props: ['href', 'color', 'icon', 'target'],
        setup (props) {
          buttonProps = props
        },
        template: '<div><slot /></div>'
      })
    })

    test('hrefにurlをセット', () => {
      render(wrapperComponent, options)

      expect(buttonProps.href).toMatch('http://twitter.com/share')
    })

    test('color = blue', () => {
      render(wrapperComponent, options)

      expect(buttonProps.color).toBe('blue')
    })

    test('icon = faTwitter', () => {
      render(wrapperComponent, options)

      expect(buttonProps.icon).toStrictEqual(faTwitter)
    })

    test('target = _blank', () => {
      render(wrapperComponent, options)

      expect(buttonProps.target).toBe('_blank')
    })
  })
})
