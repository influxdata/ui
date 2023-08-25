import {sanitizeSQLSearchTerm} from 'src/dataExplorer/shared/utils'

describe('test function - sanitizeSQLSearchTerm', () => {
  it('should sanitize to valid search terms', () => {
    const sanitizeMaps = {
      '': '',
      abcd: 'abcd',
      "ab'cd": "ab''cd",
      'ab%cd': 'ab\\%cd',
      ab_cd: 'ab\\_cd',
    }
    Object.keys(sanitizeMaps).forEach(input => {
      const actual = sanitizeSQLSearchTerm(input)
      const expected = sanitizeMaps[input]
      expect(actual).toEqual(expected)
    })
  })
})
