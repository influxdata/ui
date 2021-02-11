// Funcs
import {
  defaultXColumn,
  defaultYColumn,
  getMainColumnName,
  parseYBounds,
  HEX_DIGIT_PRECISION,
  getGeoCoordinates,
} from 'src/shared/utils/vis'
import {Table} from '@influxdata/giraffe'

describe('parseYBounds', () => {
  it('should return null when bounds is null', () => {
    expect(parseYBounds(null)).toEqual(null)
    expect(parseYBounds([null, null])).toEqual(null)
  })
  it('should return [0, 100] when the bounds are ["0", "100"]', () => {
    expect(parseYBounds(['0', '100'])).toEqual([0, 100])
  })
  it('should return [null, 100] when the bounds are [null, "100"]', () => {
    expect(parseYBounds([null, '100'])).toEqual([null, 100])
  })
  it('should return [-10, null] when the bounds are ["-10", null]', () => {
    expect(parseYBounds(['-10', null])).toEqual([-10, null])
  })
  it('should return [0.1, .6] when the bounds are ["0.1", "0.6"]', () => {
    expect(parseYBounds(['0.1', '0.6'])).toEqual([0.1, 0.6])
  })
})

describe('getting default columns', () => {
  const table = ({
    getColumn() {
      return [0, 0, 1000000]
    },
    getColumnName: jest.fn(),
    getColumnType: columnKey => {
      if (['_start', '_stop', '_time'].includes(columnKey)) {
        return 'time'
      }

      if (columnKey === '_value') {
        return 'number'
      }

      return 'boolean'
    },
    addColumn: jest.fn(),
    columnKeys: [
      'result',
      'table',
      '_start',
      '_stop',
      '_field',
      '_measurement',
      '_value',
      'cpu',
      'host',
      '_time',
    ],
    length: 3,
  } as unknown) as Table

  it('returns _time for the default x column', () => {
    expect(defaultXColumn(table)).toBe('_time')
  })

  it('does something for the default y column', () => {
    expect(defaultYColumn(table)).toBe('_value')
  })
})

describe('getMainColumnName', () => {
  it('returns empty string when no aggregate functions are selected', () => {
    let upperColumnName = ''
    let mainColumnName = ''
    let lowerColumnName = ''

    expect(
      getMainColumnName([], upperColumnName, mainColumnName, lowerColumnName)
    ).toEqual('')

    upperColumnName = 'max'
    mainColumnName = 'mean'
    lowerColumnName = 'min'
    expect(
      getMainColumnName([], upperColumnName, mainColumnName, lowerColumnName)
    ).toEqual('')
  })

  it('returns mainColumnName when it is found in the selected aggregate functions', () => {
    const mainColumnName = 'mean'
    expect(getMainColumnName(['mean'], '', mainColumnName, '')).toEqual('mean')
  })

  it('returns the first function name that is not the upper or lower column when mainColumnName is not in the selected aggregate functions', () => {
    const upperColumnName = 'max'
    let mainColumnName = ''
    const lowerColumnName = 'min'

    expect(
      getMainColumnName(
        ['mean'],
        upperColumnName,
        mainColumnName,
        lowerColumnName
      )
    ).toEqual('mean')

    mainColumnName = 'mean'
    expect(
      getMainColumnName(
        ['median'],
        upperColumnName,
        mainColumnName,
        lowerColumnName
      )
    ).toEqual('median')
  })

  it('returns empty string when mainColumnName is not in the selected aggregate functions', () => {
    const upperColumnName = 'max'
    let mainColumnName = 'median'
    const lowerColumnName = 'min'

    expect(
      getMainColumnName(
        [upperColumnName, lowerColumnName],
        upperColumnName,
        mainColumnName,
        lowerColumnName
      )
    ).toEqual('')

    mainColumnName = 'mean'
    expect(
      getMainColumnName(
        [upperColumnName],
        upperColumnName,
        mainColumnName,
        lowerColumnName
      )
    ).toEqual('')
  })
})

describe('getGeoCoordinates - retrieve latitude and longitude values for map geo type', () => {
  // Investigate implementation in real world
  it.skip('returns a latitude and longitude value with key names lat and lon if table with proper columns exists', () => {
    const table = {
      getColumn: () => [0, 1, 2, '2323'],
    } as any
    const geoCoordinates = getGeoCoordinates(table, 3)

    expect(geoCoordinates).toEqual(
      expect.objectContaining({
        lon: expect.any(Number),
        lat: expect.any(Number),
      })
    )
  })

  it('throws an error if cellId is not a proper string value', () => {
    const table = {
      getColumn: () => [0, 1, 2, 8],
    } as any

    try {
      getGeoCoordinates(table, 3)
    } catch (err) {
      expect(err.message).toEqual(
        'invalid s2_cell_id column value - value must be a string'
      )
    }
  })

  it('throws an error if cellId length is greater than the hex precision value allows for', () => {
    const table = {
      getColumn: () => [0, 1, 2, new Array(HEX_DIGIT_PRECISION + 1).join('1')],
    } as any

    try {
      getGeoCoordinates(table, 3)
    } catch (err) {
      expect(err.message).toEqual('invalid cellId length')
    }
  })
})
