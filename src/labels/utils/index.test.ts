import { validateHexCode } from "."

describe('label utils', () => {

  describe('validateHexCode', () => {
    it('accepts valid color string', () => {
      const validColorStrings = [
        '#6d6c8e', '#0f4766', '#f6debb', '#e2eb61',
        '#579d51', '#16b7d8', '#534065', '#1fe434',
        '#43ae5a', '#6fa3a1', '#81f977', '#60cbc5',
        '#888fd5', '#8200a4', '#030bd9', '#7b4395',
        '#8147ac', '#f98cc5', '#d1794b', '#471f1d',
        '#3ffa15', '#c82820', '#04b4c0', '#15c044',
        '#ad246c', '#ebaa6d', '#5a8cb5', '#78d3eb',
        '#448612', '#25a6fe',
      ]

      validColorStrings.forEach(hex => {
        expect(validateHexCode(hex)).toBe(null);
      })
    })

    it('should return error message for invalid color hex string', () => {
      const invalidColorString = [
        '#aa22d', '#gffaaa', 'other string', 'ffffff', '#text??', ''
      ]

      invalidColorString.forEach(hex => {
        expect(typeof validateHexCode(hex)).toBe('string');
      })
    })
  })
})

