import Papa from 'papaparse'
import _ from 'lodash'
import uuid from 'uuid'

import {FluxTable, GroupKey} from 'src/types'
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

export const fromFluxTableTransformer = (response: string): FluxTable[] => {
  const dataTypes = {
    '': '#datatype',
  }
  const groupKey = {}
  const dataStore = {}

  const {
    table,
    table: {columnKeys},
  } = fromFlux(response)

  columnKeys.forEach(col => {
    let type: any = table.getColumnType(col)
    const values = table.getColumn(col, type)
    let [val]: any = values
    if (type === 'time') {
      type = 'dateTime:RFC3339'
      val = new Date(val).toISOString()
    }
    if (col === 'table') {
      type = 'long'
    }
    dataTypes[col] = type
    if (!['result', '_time', '_value', 'table'].includes(col)) {
      groupKey[col] = val
    }
    if (!['', 'result', 'table'].includes(col)) {
      dataStore[col] = values
    }
  })

  const headerRow = columnKeys.filter(c => c !== 'result' && c !== 'table')
  const data = [headerRow].concat(mapTableData(headerRow, dataStore))

  const [result] = `${table.getColumn('result')}`
  const name = getNameByGroupKey(groupKey)

  return [
    {
      id: uuid.v4(),
      name,
      data,
      result,
      groupKey,
      dataTypes,
    },
  ]
}

const getNameByGroupKey = (groupKey: GroupKey): string =>
  Object.entries(groupKey)
    .filter(([k]) => !['_start', '_stop'].includes(k))
    .map(([k, v]) => `${k}=${v}`)
    .join(' ')

const mapTableData = (headerRow: string[], data): string[][] => {
  const tableData = []
  for (let i = 0; i < data._start.length; i++) {
    const rowData = getRowData(headerRow, data, i)
    tableData.push(rowData)
  }
  return tableData
}

const getRowData = (headerRow: string[], data: any, index: number): any[] =>
  headerRow.reduce((acc, col) => {
    let colData = data[col][index]
    if (needsTimestampConversion(col, colData)) {
      colData = new Date(colData).toISOString()
    }
    acc.push(colData)
    return acc
  }, [])

const needsTimestampConversion = (
  col: string,
  data: number | string
): boolean => {
  if (col !== '_start' && col !== '_stop') {
    return false
  }
  return typeof data === 'number'
}
