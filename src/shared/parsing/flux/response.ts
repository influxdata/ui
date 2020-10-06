import Papa from 'papaparse'
import _ from 'lodash'
import uuid from 'uuid'

import {FluxTable} from 'src/types'
import {fromFlux} from '@influxdata/giraffe'

export const parseResponseError = (response: string): FluxTable[] => {
  const data = Papa.parse(response.trim()).data as string[][]

  return [
    {
      id: uuid.v4(),
      name: 'Error',
      result: '',
      groupKey: {},
      dataTypes: {},
      data,
    },
  ]
}

/*
  A Flux CSV response can contain multiple CSV files each joined by a newline.
  This function splits up a CSV response into these individual CSV files.

  See https://github.com/influxdata/flux/blob/master/docs/SPEC.md#multiple-tables.
*/
export const parseChunks = (response: string): string[] => {
  const trimmedResponse = response.trim()

  if (trimmedResponse === '') {
    return []
  }

  // Split the response into separate chunks whenever we encounter:
  //
  // 1. A newline
  // 2. Followed by any amount of whitespace
  // 3. Followed by a newline
  // 4. Followed by a `#` character
  //
  // The last condition is [necessary][0] for handling CSV responses with
  // values containing newlines.
  //
  // [0]: https://github.com/influxdata/influxdb/issues/15017

  const chunks = trimmedResponse
    .split(/\n\s*\n#/)
    .map((s, i) => (i === 0 ? s : `#${s}`))

  return chunks
}

export const parseResponse = (response: string): FluxTable[] => {
  const chunks = parseChunks(response)
  const tables = chunks.reduce((acc, chunk) => {
    return [...acc, ...parseTables(chunk)]
  }, [])

  return tables
}

export const parseTables = (responseChunk: string): FluxTable[] => {
  const lines = responseChunk.split('\n')
  const annotationLines: string = lines
    .filter(line => line.startsWith('#'))
    .join('\n')
    .trim()
  const nonAnnotationLines: string = lines
    .filter(line => !line.startsWith('#'))
    .join('\n')
    .trim()

  if (_.isEmpty(annotationLines)) {
    throw new Error('Unable to extract annotation data')
  }

  if (_.isEmpty(nonAnnotationLines)) {
    // A response may be truncated on an arbitrary line. This guards against
    // the case where a response is truncated on annotation data
    return []
  }

  const nonAnnotationData = Papa.parse(nonAnnotationLines).data
  const annotationData = Papa.parse(annotationLines).data
  const headerRow = nonAnnotationData[0]
  const tableColIndex = headerRow.findIndex(h => h === 'table')
  const resultColIndex = headerRow.findIndex(h => h === 'result')

  interface TableGroup {
    [tableId: string]: string[]
  }

  // Group rows by their table id
  const tablesData = Object.values(
    _.groupBy<TableGroup[]>(
      nonAnnotationData.slice(1),
      row => row[tableColIndex]
    )
  )

  const groupRow = annotationData.find(row => row[0] === '#group')
  const defaultsRow = annotationData.find(row => row[0] === '#default')
  const dataTypeRow = annotationData.find(row => row[0] === '#datatype')

  // groupRow = ['#group', 'false', 'true', 'true', 'false']
  const groupKeyIndices = groupRow.reduce((acc, value, i) => {
    if (value === 'true') {
      return [...acc, i]
    }

    return acc
  }, [])

  const tables = tablesData.map(tableData => {
    const dataRow = _.get(tableData, '0', defaultsRow)

    const result: string =
      _.get(dataRow, resultColIndex, '') ||
      _.get(defaultsRow, resultColIndex, '')

    const groupKey = groupKeyIndices.reduce((acc, i) => {
      return {...acc, [headerRow[i]]: _.get(dataRow, i, '')}
    }, {})

    const name = Object.entries(groupKey)
      .filter(([k]) => !['_start', '_stop'].includes(k))
      .map(([k, v]) => `${k}=${v}`)
      .join(' ')

    const dataTypes = dataTypeRow.reduce(
      (acc, dataType, i) => ({
        ...acc,
        [headerRow[i]]: dataType,
      }),
      {}
    )

    return {
      id: uuid.v4(),
      data: [[...headerRow], ...tableData],
      name,
      result,
      groupKey,
      dataTypes,
    }
  })

  return tables
}

export const parseResponseWithFromFlux = (response: string): FluxTable[] => {
  const {
    fluxGroupKeyUnion,
    table,
    table: {columnKeys: keys},
  } = fromFlux(response)

  const columnKeys = [
    'result',
    'table',
    ...keys.filter(k => k !== 'result' && k !== 'table'),
  ]
  // tables, values, and the index references will be used to
  // help delineate when a chunk begins and ends
  const tables = table.getColumn('table')
  const values = table.getColumn('result')
  let valueIndex = 0
  let tableIndex = 0

  // The groupSet is the basis for identifying whether a column is grouped or not
  const groupSet = new Set(['result', ...fluxGroupKeyUnion])

  // build out the dataTypes here based on the columnKeys, this should never be reassigned
  const dataTypes = {
    '': '#datatype',
  }
  columnKeys.forEach(col => {
    dataTypes[col] = table.getOriginalColumnType(col)
  })

  // assigning these variables here since they'll also be used by the transformation below
  let columnType: any
  let columnValues

  // build out the columnHeaders. The columnHeaders are the basis for the groupKey & represent the first row of each data chunk
  let columnHeaders = columnKeys.filter(col => {
    columnType = table.getColumnType(col)
    columnValues = table.getColumn(col, columnType)
    return columnValues[valueIndex] !== undefined
  })

  // assigning these variables here since they'll also be used by the transformation below
  let groupKey = {}
  let currentValue: any
  // build out the current groupKey based on the columnHeaders
  columnHeaders.forEach(column => {
    columnType = table.getColumnType(column)
    columnValues = table.getColumn(column, columnType)
    currentValue = columnValues[valueIndex]
    if (
      (column === '_start' || column === '_stop') &&
      typeof currentValue === 'number'
    ) {
      currentValue = new Date(currentValue).toISOString()
    }
    if (groupSet.has(column)) {
      groupKey[column] = currentValue
    }
  })
  // prepend an empty string onto the columnHeaders
  columnHeaders.unshift('')

  let data: string[][] = []
  // set the columnHeaders as the beginning of the chunk
  data.push(columnHeaders)

  // get the current result
  let result: string = `${values[valueIndex]}`
  // build the name based on the groupKey
  let name = Object.entries(groupKey)
    .filter(([k]) => !['_start', '_stop'].includes(k))
    .map(([k, v]) => `${k}=${v}`)
    .join(' ')

  let tableResult = {
    id: uuid.v4(),
    name, // this is based on the groupKey
    data, // based on all the columnHeaders
    result, // based on the index
    groupKey, // groupKey is based on the values for that chunk
    dataTypes, // this will never change
  }

  // shared data for the transformations below
  let rowData: any[] = []
  let rowType: any
  let columnData: any
  let column: any
  // final table that will be returned
  const tableData = []

  for (let i = 0; i < tables.length; i++) {
    if (values[i] !== values[valueIndex] || tables[i] !== tables[tableIndex]) {
      // push the chunk to the table
      tableData.push(tableResult)
      // reset the groupKey here after the chunk has been pushed to prevent any JS memory leaks
      groupKey = {}

      valueIndex = i
      tableIndex = i
      // reset the columnHeaders
      columnHeaders = columnKeys.filter(col => {
        columnType = table.getColumnType(col)
        columnValues = table.getColumn(col, columnType)
        return columnValues[i] !== undefined
      })
      // rebuild the groupKey based on the new headers
      columnHeaders.forEach(col => {
        columnType = table.getColumnType(col)
        columnValues = table.getColumn(col, columnType)
        currentValue = columnValues[i]
        if (
          (col === '_start' || col === '_stop') &&
          typeof currentValue === 'number'
        ) {
          currentValue = new Date(currentValue).toISOString()
        }
        if (groupSet.has(col)) {
          groupKey[col] = currentValue
        }
      })

      columnHeaders.unshift('')
      // reset the data to prevent any memory leaks
      data = []
      // set the columnHeaders as the beginning of the chunk
      data.push(columnHeaders)

      // get the current result
      result = `${values[i]}`
      // build the name based on the groupKey
      name = Object.entries(groupKey)
        .filter(([k]) => !['_start', '_stop'].includes(k))
        .map(([k, v]) => `${k}=${v}`)
        .join(' ')

      tableResult = {
        id: uuid.v4(),
        name, // this is based on the groupKey
        data, // based on all the columnHeaders
        result, // based on the index
        groupKey, // groupKey is based on the values for that chunk
        dataTypes, // this will never change
      }
    }
    // prepend an empty string onto the tables
    rowData = ['']
    for (let index = 0; index < columnHeaders.length; index++) {
      column = columnHeaders[index]

      if (column === '') {
        continue
      }

      rowType = table.getColumnType(column)
      columnData = table.getColumn(column, rowType)[i]

      if (
        (column === '_start' || column === '_stop' || column === '_time') &&
        typeof columnData === 'number'
      ) {
        columnData = new Date(columnData).toISOString()
      }

      if (column === 'result') {
        // setting the column data for result as an empty string since the default
        // value given is set in the default headers:
        // https://github.com/influxdata/flux/blob/master/docs/SPEC.md#response-format
        columnData = ''
      }

      rowData.push(`${columnData}`)
    }
    // construct the chunk of data for this given row
    data.push(rowData)
  }
  // push the remaining chunk of data onto the table
  tableData.push(tableResult)

  return tableData
}
