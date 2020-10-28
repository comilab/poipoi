import useUniqId from '~/composables/use-uniq-id'

describe('composables/use-uniq-id', () => {
  describe('sequence', () => {
    test('実行する度に値が増える', () => {
      const { sequence: sequence1 } = useUniqId('foo')
      expect(sequence1).toBe(0)

      const { sequence: sequence2 } = useUniqId('foo')
      expect(sequence2).toBe(1)
    })

    test('prefixが異なる場合は値を加算しない', () => {
      const { sequence: sequence1 } = useUniqId('bar')
      expect(sequence1).toBe(0)

      const { sequence: sequence2 } = useUniqId('baz')
      expect(sequence2).toBe(0)
    })
  })

  describe('id', () => {
    test('return {prefix}-{id}', () => {
      const { id: id1 } = useUniqId('foobar')
      expect(id1).toBe('foobar-0')

      const { id: id2 } = useUniqId('foobar')
      expect(id2).toBe('foobar-1')
    })
  })
})
