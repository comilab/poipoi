import useClassProp, { prop } from '~/composables/use-class-prop'

describe('composables/use-class-prop', () => {
  describe('prop', () => {
    test('type is String, Array or Object', () => {
      expect(prop.type).toHaveLength(3)
      expect(prop.type).toContain(String)
      expect(prop.type).toContain(Array)
      expect(prop.type).toContain(Object)
    })

    test('optional', () => {
      expect(prop.required).toBeFalsy()
    })

    test('default is null', () => {
      expect(prop.default).toBeNull()
    })
  })

  describe('merge', () => {
    let merge: ReturnType<typeof useClassProp>['merge']

    beforeEach(() => {
      merge = useClassProp().merge
    })

    test('nullなら何もしない', () => {
      const classes = merge(null)

      expect(classes).toEqual({})
    })

    test('配列を処理する', () => {
      const classes = merge(['foo', 'bar'])

      expect(classes).toEqual({ 'foo bar': true })
    })

    test('文字列を処理する', () => {
      const classes = merge('foo')

      expect(classes).toEqual({ foo: true })
    })

    test('オブジェクトを処理する', () => {
      const classes = merge({
        foo: true,
        bar: false
      })

      expect(classes).toEqual({
        foo: true,
        bar: false
      })
    })

    test('全ての引数をマージ', () => {
      const classes = merge(['foo'], 'bar', { baz: false })

      expect(classes).toEqual({
        foo: true,
        bar: true,
        baz: false
      })
    })
  })
})
