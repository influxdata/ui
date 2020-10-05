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
  let maxColumnCount = 0
  let tables = []
  let curr: any
  responses.forEach(response => {
    curr = fromFluxTableTransformer(response)
    maxColumnCount = Math.max(maxColumnCount, curr.max)
    tables = tables.concat(curr.tableData)
  })
  return {data: tables, maxColumnCount}
}

export const fromFluxTableTransformer = (
  response: string
): {tableData: string[][]; max: number} => {
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

  const tables = table.getColumn('table')
  const values = table.getColumn('result')
  let currVal = null
  let currTable = null
  let columnHeaders = []
  const tableData = []
  let rowData: any[] = []
  let rowType: any
  let columnData: any
  let column: any
  const groupSet = new Set(fluxGroupKeyUnion)
  let max = 0

  for (let i = 0; i < tables.length; i++) {
    if (values[i] !== currVal || tables[i] !== currTable) {
      // sets the boundaries for the chunk based on different yields or tables
      currVal = values[i]
      currTable = tables[i]
      // build out the columnHeader = chunk[3]
      columnHeaders = columnKeys.filter(col => {
        const columnType: any = table.getColumnType(col)
        const values = table.getColumn(col, columnType)
        return values[i] !== undefined
      })
      // based on the columnHeader we can get the:
      // #datatype, 'string', 'long' ...(chunk[1])
      const dataTypes = ['#datatype']
      // #default, result, '', '' ...(chunk[2])
      const defaultRow = ['#default', `${values[i]}`]
      // #group, true, false ...(chunk[0])
      const groupHeaders = ['#group']
      let curr
      tableData.push([], groupHeaders, dataTypes, defaultRow, [
        '',
        ...columnHeaders,
      ])
      for (let j = 0; j < columnHeaders.length; j++) {
        curr = columnHeaders[j]
        groupHeaders.push(`${groupSet.has(curr)}`)
        dataTypes.push(table.getOriginalColumnType(curr))
      }
      max = Math.max(groupHeaders.length, dataTypes.length, max)
    }
    rowData = ['']
    for (let index = 0; index < columnHeaders.length; index++) {
      column = columnHeaders[index]
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
    tableData.push(rowData)
  }
  // this removes the unnecessary [] that's prepended to the table
  tableData.shift()
  return {tableData, max}
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
