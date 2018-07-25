const { getIn, setIn, isValidPath } = require('./index.js')

describe('isValidPath', () => {
  describe('returns false', () => {
    test('when path is not a flat array', () => {
      expect(isValidPath(null)).toBe(false)
      expect(isValidPath('wrong')).toBe(false)
      expect(isValidPath(false)).toBe(false)
      expect(isValidPath({ x: 0 })).toBe(false)
      expect(isValidPath([[]])).toBe(false)
    })
  })

  describe('returns true', () => {
    test('for flat array of numbers or non empty strings', () => {
      expect(isValidPath(['a', 'b'])).toBe(true)
      expect(isValidPath(['a', 1, 5, '*'])).toBe(true)
    })
  })
})

describe('getIn', () => {
  let object

  beforeEach(() => {
    object = { a: true, 5: { b: true } }
  })

  describe('returns default value', () => {
    test('when the value is not part of the object', () => {
      expect(getIn(object, ['b'], 'default')).toBe('default')
    })

    test('when path is invalid', () => {
      expect(getIn(object, [''], 'default')).toBe('default')
      expect(getIn(object, null, 'default')).toBe('default')
    })

    test('or undefined if no defaultValue is passed', () => {
      expect(getIn(object, ['a', 'b'])).toBe(undefined)
    })
  })

  test('returns part of object', () => {
    expect(getIn(object, [])).toEqual(object)
    expect(getIn(object, [5])).toEqual({ b: true })
    expect(getIn(object, ['a'])).toEqual(true)
  })

  test('converts numbers on path to strings', () => {
    expect(getIn(object, ['5'])).toEqual({ b: true })
  })

  describe('returns shallow copy', () => {
    test('mutates original object on deep level', () => {
      const deep = getIn(object, [5])
      deep.b = false
      expect(object[5].b).toEqual(false)
    })
    test('preserves original on shallow lavel', () => {
      // eslint-disable-next-line
      let deep = getIn(object, [5])
      deep = true
      expect(object[5]).toEqual({ b: true })
    })
  })

  test('handles deep objects', () => {
    const longChain = [...Array(10000).keys()].reduce((acc) => ({ a: acc }), {})
    const path = [...Array(10000).keys()].map((i) => 'a')
    expect(getIn(longChain, [...path])).toEqual({})
  })

  test('handles mix of arrays and objects', () => {
    const source = { a: [{ b: 10 }] }
    expect(getIn(source, ['a', 0])).toEqual({ b: 10 })
  })
})

describe('setIn', () => {
  let object

  beforeEach(() => {
    object = { a: true, 5: { b: true } }
  })

  test('returns "object" on invalid path', () => {
    expect(setIn(object, [[]])).toBe(object)
  })

  test('sets value in object on correct path', () => {
    expect(setIn(object, [5], 'test')).toEqual({ a: true, 5: 'test' })
  })

  test("doesn't break when value is the same as object", () => {
    expect(setIn(object, [5], object)).toEqual({ a: true, 5: { a: true, 5: { b: true } } })
  })

  test("creates object properties if path keys doesn't exist in object", () => {
    expect(setIn(object, ['x', 'y', 'z'], 'test')).toEqual({
      a: true,
      5: { b: true },
      x: { y: { z: 'test' } },
    })
  })

  test("returns source if it's not an object", () => {
    expect(setIn('test', ['a'], 'val')).toBe('test')
    expect(setIn(15, ['a'], 'val')).toBe(15)
  })

  test('converts numbers on path to strings', () => {
    expect(setIn(object, ['5'], true)).toEqual({ a: true, 5: true })
  })

  test("doesn't modify object on other paths", () => {
    object[5].c = false
    object[5].d = 5
    expect(object).toEqual({ 5: { b: true, c: false, d: 5 }, a: true })
    expect(setIn(object, ['5', 'c'], 'test')).toEqual({
      a: true,
      5: { b: true, c: 'test', d: 5 },
    })
  })
})
