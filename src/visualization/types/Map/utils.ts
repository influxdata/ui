import {Table} from '@influxdata/giraffe'
import _ from 'lodash'

export const findTags = (table: Table, latLon: boolean = false) => {
  return table.columnKeys.reduce((acc, k) => {
    const columnType = table.getColumnType(k)
    if (columnType === 'number' || columnType === 'time') {
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
  const fieldValues = table.getColumn('_field')
  const uniqueFields = _.uniq(fieldValues)
  const fields = uniqueFields.reduce(function(result, item) {
    result[item] = {
      key: 'field',
      column: item,
    }
    return result
  }, {})

  return fields
}
