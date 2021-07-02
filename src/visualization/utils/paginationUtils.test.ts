import {
  calcNextPageOffset,
  calcPrevPageOffset,
  calcOffset,
} from './paginationUtils'
describe('pagination utils tests', () => {
  describe('calcOffset', () => {
    it('page: 1, size: 1, total: 1', () => {
      expect(calcOffset(1, 1, 1)).toBe(0)
    })
    it('page: 1, size: 2, total: 3', () => {
      expect(calcOffset(1, 2, 3)).toBe(0)
    })
    it('page: 2, size: 2, total: 3', () => {
      expect(calcOffset(2, 2, 3)).toBe(2)
    })
    it('page: 1, size: 3, total: 2', () => {
      expect(calcOffset(1, 3, 2)).toBe(0)
    })
  })

  describe('calcNextPageOffset', () => {
    it('offset: 0, size: 1, total: 1', () => {
      expect(calcNextPageOffset(0, 1, 1)).toBe(0)
    })
    it('offset: 2, size: 2, total: 3', () => {
      expect(calcNextPageOffset(2, 2, 3)).toBe(2)
    })
    it('offset: 2, size: 2, total: 6', () => {
      expect(calcNextPageOffset(2, 2, 6)).toBe(4)
    })
    it('offset: 4, size: 2, total: 6', () => {
      expect(calcNextPageOffset(4, 2, 6)).toBe(4)
    })
  })

  describe('calcPrevPageOffset', () => {
    it('offset: 0, size: 1', () => {
      expect(calcPrevPageOffset(0, 1)).toBe(0)
    })
    it('offset: 2, size: 2', () => {
      expect(calcPrevPageOffset(2, 2)).toBe(0)
    })
    it('offset: 6, size: 2', () => {
      expect(calcPrevPageOffset(6, 2)).toBe(4)
    })
  })
})
