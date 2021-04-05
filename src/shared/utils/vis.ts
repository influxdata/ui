// Libraries
import {Table, LineInterpolation, FromFluxResult} from '@influxdata/giraffe'

// Types
import {XYGeom, Axis} from 'src/types'

export const HEX_DIGIT_PRECISION = 16

/*
  A geom may be stored as "line", "step", "monotoneX", "bar", or "stacked", but
  we currently only support the "line", "step", and "monotoneX" geoms.
*/
export const resolveGeom = (geom: XYGeom) => {
  if (geom === 'step' || geom === 'monotoneX') {
    return geom
  }

  return 'line'
}

export const geomToInterpolation = (geom: XYGeom): LineInterpolation => {
  const resolvedGeom = resolveGeom(geom)

  switch (resolvedGeom) {
    case 'step':
      return 'step'
    case 'monotoneX':
      return 'monotoneX'
    default:
      return 'linear'
  }
}

const NOISY_LEGEND_COLUMNS = new Set(['_start', '_stop', 'result'])

/*
  Some columns (e.g. `_start` and `_stop`) appear frequently in Flux group
  keys, but rarely affect the actual grouping of data since every value in the
  response for these columns is equal. When this is the case, we hide these
  columns in the hover legend.
*/
export const filterNoisyColumns = (columns: string[], table: Table): string[] =>
  columns.filter(key => {
    if (!NOISY_LEGEND_COLUMNS.has(key)) {
      return true
    }

    const keyData = table.getColumn(key)

    for (const d of keyData) {
      if (d !== keyData[0]) {
        return true
      }
    }

    return false
  })

export const parseXBounds = (
  bounds: Axis['bounds']
): [number, number] | null => {
  if (
    !bounds ||
    !bounds[0] ||
    !bounds[1] ||
    isNaN(+bounds[0]) ||
    isNaN(+bounds[1])
  ) {
    return null
  }

  return [+bounds[0], +bounds[1]]
}

export const parseYBounds = (
  bounds: Axis['bounds']
): [number | null, number | null] | null => {
  if (!bounds || (!bounds[0] && !bounds[1])) {
    return null
  }

  const min = isNaN(parseFloat(bounds[0])) ? null : parseFloat(bounds[0])
  const max = isNaN(parseFloat(bounds[1])) ? null : parseFloat(bounds[1])
  return [min, max]
}

export const extent = (xs: number[]): [number, number] | null => {
  if (!xs || !xs.length) {
    return null
  }

  let low = Infinity
  let high = -Infinity

  for (const x of xs) {
    if (x < low) {
      low = x
    }

    if (x > high) {
      high = x
    }
  }

  if (low === Infinity || high === -Infinity) {
    return null
  }

  return [low, high]
}

export const checkResultsLength = (giraffeResult: FromFluxResult): boolean => {
  return (giraffeResult.table?.length || 0) > 0
}

export const getNumericColumns = (table: Table): string[] => {
  const timeColumns = table.columnKeys.filter(k => {
    if (k === 'result' || k === 'table') {
      return false
    }

    const columnType = table.getColumnType(k)

    return columnType === 'time' || columnType === 'number'
  })

  return timeColumns
}

export const getTimeColumns = (table: Table): string[] => {
  const timeColumns = table.columnKeys.filter(k => {
    if (k === 'result' || k === 'table') {
      return false
    }

    const columnType = table.getColumnType(k)
    return columnType === 'time'
  })

  return timeColumns
}

export const getNumberColumns = (table: Table): string[] => {
  const numberColumnKeys = table.columnKeys.filter(k => {
    if (k === 'result' || k === 'table') {
      return false
    }

    const columnType = table.getColumnType(k)
    return columnType === 'number'
  })

  return numberColumnKeys
}

export const getStringColumns = (table: Table): string[] => {
  const stringColumnKeys = table.columnKeys.filter(k => {
    if (k === 'result' || k === 'table') {
      return false
    }

    const columnType = table.getColumnType(k)

    return columnType === 'string'
  })

  return stringColumnKeys
}

export const getGroupableColumns = (table: Table): string[] => {
  const invalidGroupColumns = new Set(['_value', '_time', 'table'])
  const groupableColumns = table.columnKeys.filter(
    name => !invalidGroupColumns.has(name)
  )

  return groupableColumns
}

/*
  Previously we would automatically select an x and y column setting for an
  `XYView` based on the current Flux response.  We then added support for an
  explicit x and y column setting by adding `xColumn` and `yColumn` fields to
  the `XYView`.

  We did not migrate existing views when adding the fields, so the fields are
  considered optional. Thus to resolve the correct x and y column selections
  for an `XYView`, we need to:

  1. Use the `xColumn` and `yColumn` fields if they exist
  2. Fall back to automatically selecting and x and y column if not

  A `null` result from this function indicates that no valid selection could be
  made.
*/

export const defaultXColumn = (
  table: Table,
  preferredColumnKey?: string
): string | null => {
  const validColumnKeys = [...getTimeColumns(table), ...getNumberColumns(table)]
  if (validColumnKeys.includes(preferredColumnKey)) {
    return preferredColumnKey
  }
  for (const key of ['_time', '_stop', '_start']) {
    if (validColumnKeys.includes(key)) {
      return key
    }
  }

  if (validColumnKeys.length) {
    return validColumnKeys[0]
  }

  return null
}

/*
  See `defaultXColumn`.
*/
export const defaultYColumn = (
  table: Table,
  preferredColumnKey?: string
): string | null => {
  const validColumnKeys = [...getTimeColumns(table), ...getNumberColumns(table)]

  if (validColumnKeys.includes(preferredColumnKey)) {
    return preferredColumnKey
  }

  for (const key of validColumnKeys) {
    if (key.startsWith('_value')) {
      return key
    }
  }

  if (validColumnKeys.length) {
    return validColumnKeys[0]
  }

  return null
}

export const defaultYSeriesColumns = (
  table: Table,
  preferredYSeriesColumns: Array<string>
): Array<string> => {
  const validColumnKeys = [...getStringColumns(table)]
  let ySeriesColumns = []

  if (Array.isArray(preferredYSeriesColumns)) {
    ySeriesColumns = preferredYSeriesColumns.filter(columnKey =>
      validColumnKeys.includes(columnKey)
    )
  }
  if (ySeriesColumns.length === 0) {
    const defaultKey = validColumnKeys.find(
      columnKey => columnKey.startsWith('_') === false
    )
    if (defaultKey) {
      ySeriesColumns.push(defaultKey)
    }
  }

  return ySeriesColumns
}

export const defaultYLabelColumns = (
  preferredYSeriesColumns: Array<string>,
  validYSeriesColumns: Array<string>
): Array<string> => {
  return Array.isArray(preferredYSeriesColumns) &&
    Array.isArray(validYSeriesColumns)
    ? preferredYSeriesColumns.filter(columnKey =>
        validYSeriesColumns.includes(columnKey)
      )
    : []
}

export const isInDomain = (value: number, domain: number[]) =>
  value >= domain[0] && value <= domain[1]

export const clamp = (value: number, domain: number[]) => {
  if (value < domain[0]) {
    return domain[0]
  }

  if (value > domain[1]) {
    return domain[1]
  }

  return value
}

export const getMainColumnName = (
  selectedFunctions: string[],
  upperColumn: string,
  mainColumn: string,
  lowerColumn: string
): string => {
  const hasMainColumn = selectedFunctions.some(
    funcName => funcName === mainColumn
  )

  if (hasMainColumn) {
    return mainColumn
  }

  for (let i = 0; i < selectedFunctions.length; i += 1) {
    const func = selectedFunctions[i]
    if (func !== upperColumn && func !== lowerColumn) {
      return func
    }
  }
  return ''
}

const getColumnValue = (table: Table, field: string) => {
  const fieldColumn = table.getColumn('_field')

  if (!fieldColumn) {
    throw new Error(
      'Cannot retrieve _field column - table does not conform to required structure of Table type'
    )
  }
  const index = fieldColumn.findIndex(val => val === field)
  if (index < 0) {
    throw new Error('Map type requires the fields to be either lat or lon')
  }
  const valueColumn = table.getColumn('_value')
  const value = valueColumn[index]

  return value
}

export const getGeoCoordinates = (table: Table) => {
  const latCoordinate = getColumnValue(table, 'lat')
  const lonCoordinate = getColumnValue(table, 'lon')

  return {
    lat: parseInt(latCoordinate.toString(), 10),
    lon: parseInt(lonCoordinate.toString(), 10),
  }
}
