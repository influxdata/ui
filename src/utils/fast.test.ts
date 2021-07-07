import {range} from 'lodash'
import {
  fastCloneArray,
  fastConcat,
  fastFilter,
  fastForEach,
  fastMap,
  fastReduce,
} from './fast'

describe('fast', () => {
  describe('reduce', () => {
    it('should return initial value for empty array', () => {
      const initialValue = {}
      expect(fastReduce([], jest.fn(), initialValue)).toBe(initialValue)
    })

    it('should reduce simple array', () => {
      const powers = range(20).map(x => x ** 2)

      const iterator = jest
        .fn()
        .mockImplementation((r: number, t: number) => r + t)

      const actual = fastReduce(powers, iterator, 0)

      const expected = powers.reduce((prev, current, i) => {
        const fastReduceCall = iterator.mock.calls[i]

        expect(fastReduceCall[0]).toBe(prev)
        expect(fastReduceCall[1]).toBe(current)
        expect(fastReduceCall[2]).toBe(i)
        expect(fastReduceCall[3]).toBe(powers)

        return prev + current
      }, 0)

      expect(actual).toBe(expected)
    })

    it('should use first array value with index 1 if initial value is undefined', () => {
      const expected = {}
      const iterator = jest.fn()

      expect(fastReduce([], jest.fn(), undefined)).toBe(undefined)
      expect(fastReduce([expected], jest.fn(), undefined)).toBe(expected)

      fastReduce([expected, {}], iterator, undefined)
      expect(iterator.mock.calls[0][0]).toBe(expected)
      expect(iterator.mock.calls[0][1]).not.toBe(expected)
      expect(iterator.mock.calls[0][2]).toBe(1)
    })
  })

  it('maps', () => {
    const arr = [7, 3, 200, 4, 8, 12]
    const iterator = (it: number, i: number) => it / 5 + i ** 3

    expect(fastMap(arr, iterator)).toEqual(arr.map(iterator))
  })

  it('filters', () => {
    const arr = range(100).map(x => x ** 3 - 5)
    const predicate = (it: number, i: number) =>
      i % 5 === 2 || (it > 8000 && it < 100000)

    expect(fastFilter(arr, predicate)).toEqual(arr.filter(predicate))
  })

  it('foreach', () => {
    const arr = range(100).map(x => x ** 3 - 5)
    const fnc = jest.fn()
    const fnc1 = jest.fn()

    arr.forEach(fnc)
    fastForEach(arr, fnc1)

    expect(fnc.mock.calls).toEqual(fnc1.mock.calls)
  })

  it('concats', () => {
    const arrs = range(10).map(l => range(l * 5).map(x => x.toString(13)))
    const expected = arrs.reduce((acc, it) => acc.concat(it), [])

    expect(fastConcat(...arrs)).toEqual(expected)
  })

  it('clones', () => {
    const arr = range(20)
    const clone = fastCloneArray(arr)

    expect(clone).not.toBe(arr)
    expect(clone).toEqual(arr)
  })
})
