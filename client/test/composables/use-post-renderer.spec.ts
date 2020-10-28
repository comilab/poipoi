import usePostRenderer from '~/composables/use-post-renderer'
import postFactory from '~/test/factories/post'
import imageFactory from '~/test/factories/image'
import Image from '~/models/Image'
import AppImageZoomable from '~/components/molecules/AppImageZoomable.vue'

jest.mock('~/components/molecules/AppImageZoomable.vue')

describe('composables/use-post-renderer', () => {
  let vm: any
  let createElement: jest.Mock

  beforeEach(() => {
    createElement = jest.fn().mockImplementation(component => component)
    vm = {
      $emit: jest.fn(),
      $props: {
        post: postFactory.build()
      }
    }
  })

  describe('replace', () => {
    let replace: ReturnType<typeof usePostRenderer>['replace']

    beforeEach(() => {
      replace = usePostRenderer(vm, createElement).replace
    })

    test('patternKeysにないパターンは無視', () => {
      const result = replace('#hashtag', [])

      expect(result).toBe('#hashtag')
    })

    test('replaces line-breaks with <br>', () => {
      expect(replace('\r\n', ['break'])).toBe('br')
      expect(replace('\r', ['break'])).toBe('br')
      expect(replace('\n', ['break'])).toBe('br')
    })

    describe('hashtag', () => {
      test('replaces #text with nuxt-link', () => {
        const result = replace('#hashtag', ['hashtag'])

        expect(result).toBe('nuxt-link')
      })

      test('call createElement() with parameters', () => {
        replace('#hashtag', ['hashtag'])

        expect(createElement).toBeCalledWith('nuxt-link', {
          props: {
            to: { path: '/', query: { keyword: '#hashtag' } }
          }
        }, '#hashtag')
      })
    })

    describe('chapter', () => {
      test('replaces [chapter:text] with h3', () => {
        const result = replace('[chapter:title]', ['chapter'])

        expect(result).toBe('h3')
      })

      test('call createElement() with parameters', () => {
        replace('[chapter:title]', ['chapter'])

        expect(createElement).toBeCalledWith('h3', 'title')
      })
    })

    describe('image', () => {
      let image: Image

      beforeEach(() => {
        vm.$props.post = postFactory.build({
          images: imageFactory.buildList(1)
        })
        image = vm.$props.post.images[0]
        replace = usePostRenderer(vm, createElement).replace
      })

      test('replaces [image:number] with AppImageZoomable', () => {
        const result = replace('[image:1]', ['image'])

        expect(result).toBe(AppImageZoomable)
      })

      test('call createElement() with parameters', () => {
        replace('[image:1]', ['image'])

        expect(createElement).toBeCalledWith(AppImageZoomable, {
          props: {
            src: image.paths.large,
            largeSrc: image.paths.original
          }
        })
      })

      test('キーがなければcreateElementを実行しない', () => {
        const result = replace('[image:2]', ['image'])

        expect(createElement).not.toBeCalled()
        expect(result).toBe('[image:2]')
      })
    })

    describe('jump', () => {
      beforeEach(() => {
        vm.$props.post = postFactory.build({
          text: 'page1[newpage]page2'
        })
        replace = usePostRenderer(vm, createElement).replace
      })

      test('replaces [jump:number] with <a>', () => {
        const result = replace('[jump:1]', ['jump'])

        expect(result).toBe('a')
      })

      test('call createElement() with parameters', () => {
        replace('[jump:1]', ['jump'])

        expect(createElement).toBeCalledTimes(1)
        expect(createElement.mock.calls[0][0]).toBe('a')
        expect(createElement.mock.calls[0][1].on.click).toBeInstanceOf(Function)
        expect(createElement.mock.calls[0][2]).toBe('1ページ目へ')

        createElement.mock.calls[0][1].on.click()

        expect(vm.$emit).toBeCalledWith('jump', 0)
      })

      test('クリック時にjumpイベントが発火される', () => {
        replace('[jump:1]', ['jump'])
        createElement.mock.calls[0][1].on.click()

        expect(vm.$emit).toBeCalledWith('jump', 0)
      })

      test('キーがなければcreateElementを実行しない', () => {
        const result = replace('[jump:3]', ['jump'])

        expect(createElement).not.toBeCalled()
        expect(result).toBe('[jump:3]')
      })
    })

    describe('ruby', () => {
      test('replaces [[rb:text>text]] with <ruby>', () => {
        const result = replace('[[rb:漢字>かんじ]]', ['ruby'])

        expect(result).toBe('ruby')
        expect(createElement).toBeCalledTimes(2)
      })

      test('call createElement() with parameters', () => {
        replace('[[rb:漢字>かんじ]]', ['ruby'])

        expect(createElement).nthCalledWith(1, 'rt', 'かんじ')
        expect(createElement).nthCalledWith(2, 'ruby', ['漢字', 'rt'])
      })
    })

    describe('jumpuri', () => {
      test('replaces [[jumpuri:text>url]] with <a>', () => {
        const result = replace('[[jumpuri:example>https://exmple.com]]', ['jumpuri'])

        expect(result).toBe('a')
      })

      test('call createElement() with parameters', () => {
        replace('[[jumpuri:example>https://exmple.com]]', ['jumpuri'])

        expect(createElement).toBeCalledWith('a', {
          attrs: {
            href: 'https://exmple.com',
            target: '_blank'
          }
        }, 'example')
      })
    })
  })

  describe('split', () => {
    let split: ReturnType<typeof usePostRenderer>['split']

    beforeEach(() => {
      split = usePostRenderer(vm, createElement).split
    })

    test('markupPatternで分割する', () => {
      const result = split('foo\nbar', ['break'])

      expect(result).toHaveLength(3)
      expect(result).toStrictEqual(['foo', 'br', 'bar'])
    })
  })
})
