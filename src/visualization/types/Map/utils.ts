import {ColumnData, Table} from '@influxdata/giraffe'
import _ from 'lodash'

export const findTags = (table: Table, latLon: boolean = false) => {
  return table.columnKeys.reduce((acc, k) => {
    const columnType = table.getColumnType(k)
    if (columnType === 'time') {
      return acc
    }

    if (
      k === '_measurement' ||
      k === 'id' ||
      k === '_field' ||
      k === 'result'
    ) {
      return acc
    }
    if (latLon && k === 's2_cell_id') {
      return acc
    }

    return {
      ...acc,
      [k]: {
        key: 'tag',
        column: table.getColumnName(k),
      },
    }
  }, {})
}

export const findFields = (table: Table) => {
  const results = {}

  const fieldValues: ColumnData = table.getColumn('_field')
  if (fieldValues) {
    const fields = new Set([...fieldValues])
    fields.forEach((field: string) => {
      results[field] = {
        key: 'field',
        column: field,
      }
    })
  }

  return results
}
