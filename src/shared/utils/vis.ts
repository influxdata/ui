// Libraries
import {S2} from 's2-geometry'
import {Table, LineInterpolation, FromFluxResult} from '@influxdata/giraffe'

// Types
import {XYGeom, Axis} from 'src/types'

const HEX_DIGIT_PRECISION = 16

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

export const mosaicYColumn = (
  table: Table,
  preferredColumnKey?: string
): string | null => {
  const validColumnKeys = getStringColumns(table)
  if (validColumnKeys.includes(preferredColumnKey)) {
    return preferredColumnKey
  }

  const invalidMosaicYColumns = new Set([
    '_value',
    'status',
    '_field',
    '_measurement',
  ])
  const preferredValidColumnKeys = validColumnKeys.filter(
    name => !invalidMosaicYColumns.has(name)
  )
  if (preferredValidColumnKeys.length) {
    return preferredValidColumnKeys[0]
  }

  if (validColumnKeys.length) {
    return validColumnKeys[0]
  }
  return null
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

const getS2CellID = (table, index: number): string => {
  const column = table.getColumn('s2_cell_id')
  if (!column) {
    return null
  }
  const value = column[index]
  if (typeof value !== 'string') {
    return null
  }
  return value
}

export const PRECISION_TRIMMING_TABLE = (() => {
  const precisionTable = [BigInt(1)]
  for (let i = 1; i < HEX_DIGIT_PRECISION + 1; i++) {
    precisionTable[i] = precisionTable[i - 1] * BigInt(HEX_DIGIT_PRECISION)
  }
  return precisionTable
})()

export const getLatLon = (table, index: number) => {
  const cellId = getS2CellID(table, index)
  if (cellId === null || cellId.length > HEX_DIGIT_PRECISION) {
    return null
  }
  if (cellId === null || cellId.length > HEX_DIGIT_PRECISION) {
    return null
  }
  const fixed =
    BigInt('0x' + cellId) *
    PRECISION_TRIMMING_TABLE[HEX_DIGIT_PRECISION - cellId.length]
  const latLng = S2.idToLatLng(fixed.toString())
  return {
    lon: latLng.lng,
    lat: latLng.lat,
  }
}
