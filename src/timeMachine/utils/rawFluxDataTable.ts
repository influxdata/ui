import Papa from 'papaparse'
import HtmlEntities from 'he'
import unraw from 'unraw'
import {fromFlux} from '@influxdata/giraffe'

import {parseChunks} from 'src/shared/parsing/flux/response'
import {
  CSV_OBJECT_BASE_NAME,
  CSV_OBJECT_START_STRING,
  CSV_OBJECT_END_STRING,
} from 'src/shared/constants/rawFluxData'

export interface ParseFilesResult {
  data: string[][]
  maxColumnCount: number
}

export const parseFilesWithFromFlux = (
  responses: string[]
): ParseFilesResult => {
  const chunks = parseChunks(responses.join('\n\n'))
  const parsedChunks = chunks.map(c => fromFluxTableTransformer(c))
  let data = []
  parsedChunks.forEach((chunk, i) => {
    data = data.concat(chunk)
    if (i !== parsedChunks.length - 1) {
      data.push([])
    }
  })
  const maxColumnCount = Math.max(...parsedChunks.map(c => c[0].length))
  return {data, maxColumnCount}
}

export const fromFluxTableTransformer = (response: string): string[][] => {
  const dataTypes = ['#datatype']
  const groupKey = {}
  const dataStore = {}
  const {
    fluxGroupKeyUnion,
    table,
    table: {columnKeys},
  } = fromFlux(response)

  const groupSet = new Set(fluxGroupKeyUnion)
  const groupRow = ['#group']
  columnKeys.forEach(col => groupRow.push(`${groupSet.has(col)}`))

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
    if (!groupSet.has(col)) {
      groupKey[col] = val
    }
    dataTypes.push(type)
    dataStore[col] = values
  })

  const values = table.getColumn('result')
  const defaultRow = ['#default', values[0]]
  while (defaultRow.length < columnKeys.length) {
    defaultRow.push('')
  }
  const data: any[] = [
    groupRow,
    dataTypes,
    defaultRow,
    ['', ...columnKeys],
  ].concat(mapTableData(columnKeys, dataStore))

  return data
}

const mapTableData = (headerRow: string[], data): string[][] => {
  const tableData = []
  for (let i = 0; i < data._start.length; i++) {
    const rowData = getRowData(headerRow, data, i)
    tableData.push(rowData)
  }
  return tableData
}

const getRowData = (headerRow: string[], data: any, index: number): any[] =>
  headerRow.reduce(
    (acc, col) => {
      let colData = data[col][index]
      if (needsTimestampConversion(col, colData)) {
        colData = new Date(colData).toISOString()
      }
      if (col === 'result') {
        // setting the column data for result as an empty string since the default
        // value given is set in the default headers:
        // https://github.com/influxdata/flux/blob/master/docs/SPEC.md#response-format
        colData = ''
      }
      acc.push(`${colData}`)
      return acc
    },
    ['']
  )

const needsTimestampConversion = (
  col: string,
  data: number | string
): boolean => {
  if (col !== '_start' && col !== '_stop') {
    return false
  }
  return typeof data === 'number'
}

export const parseFiles = (responses: string[]): ParseFilesResult => {
  const chunks = parseChunks(responses.join('\n\n'))
  const parsedChunks = chunks.map(c => Papa.parse(c).data)
  const maxColumnCount = Math.max(...parsedChunks.map(c => c[0].length))
  const data = []

  for (let i = 0; i < parsedChunks.length; i++) {
    if (i !== 0) {
      // Seperate each chunk by an empty line, just like in the unparsed CSV
      data.push([])
    }

    for (let j = 0; j < parsedChunks[i].length; j++) {
      // Danger zone! Since the contents of each chunk are potentially quite
      // large, the contents need to be concated using a loop rather than with
      // `concat`, a splat or similar. Otherwise we see a "Maximum call size
      // exceeded" error for large CSVs
      data.push(parsedChunks[i][j])
    }
  }

  return {data, maxColumnCount}
}

export const parseFilesWithObjects = (
  responses: string[]
): ParseFilesResult => {
  const chunks = parseChunks(responses.join('\n\n'))
  const parsedChunks = chunks.map(c => {
    const objList = []
    let updatedString = c
    let startIndex = 0
    let endIndex = 0

    /* ********************************************************************
     * Parse objects in the CSV by decoding the html and removing
     * the following inside the objects, so that the stringified version is
     * parsable by JSON.parse and becomes useful to the user:
     *   - double double-quotes
     *   - escaped double-quotes
     *   - newlines
     *   - tabs
     *   - escaped null
     */
    while (startIndex !== -1 && endIndex !== -1) {
      startIndex = updatedString.indexOf(CSV_OBJECT_START_STRING)
      endIndex = updatedString.indexOf(CSV_OBJECT_END_STRING)
      if (startIndex !== -1 && endIndex !== -1) {
        objList.push(
          unraw(
            HtmlEntities.decode(
              updatedString.slice(
                startIndex + CSV_OBJECT_START_STRING.length - 1,
                endIndex + 1
              )
            )
              .replace(/""/g, '"')
              .replace(/:",/g, ':"",')
              .replace(/"","}/g, '","}')
              .replace(/\\"/g, '')
              .replace(/\\n/g, ' ')
              .replace(/\\t/g, '')
              .replace(/\\u0000/g, '')
          )
        )
        updatedString =
          updatedString.slice(0, startIndex + 1) +
          `${CSV_OBJECT_BASE_NAME}${objList.length - 1}` +
          updatedString.slice(endIndex + CSV_OBJECT_END_STRING.length - 1)
      }
    }

    const {data} = Papa.parse(updatedString)

    // After we parse the CSV, if we have a list of parsed objects
    //   go back and re-insert them
    let iterator = 0
    objList.forEach((obj, objIndex) => {
      let dataIndex = -1
      while (iterator < data.length && dataIndex === -1) {
        dataIndex = data[iterator].findIndex(
          element => element === `${CSV_OBJECT_BASE_NAME}${objIndex}`
        )
        if (dataIndex > -1) {
          data[iterator][dataIndex] = data[iterator][dataIndex].replace(
            `${CSV_OBJECT_BASE_NAME}${objIndex}`,
            obj
          )
        } else {
          iterator += 1
        }
      }
    })

    return data
  })
  const maxColumnCount = Math.max(...parsedChunks.map(c => c[0].length))
  const data = []

  for (let i = 0; i < parsedChunks.length; i++) {
    if (i !== 0) {
      // Separate each chunk by an empty line, just like in the unparsed CSV
      data.push([])
    }

    for (let j = 0; j < parsedChunks[i].length; j++) {
      // Danger zone! Since the contents of each chunk are potentially quite
      // large, the contents need to be concated using a loop rather than with
      // `concat`, a splat or similar. Otherwise we see a "Maximum call size
      // exceeded" error for large CSVs
      data.push(parsedChunks[i][j])
    }
  }

  return {data, maxColumnCount}
}
