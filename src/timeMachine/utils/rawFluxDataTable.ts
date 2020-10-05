import Papa from 'papaparse'
import HtmlEntities from 'he'
import unraw from 'unraw'
import {fromFlux, Table} from '@influxdata/giraffe'

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
  const tables = responses.reduce((acc, curr) => {
    return [...acc, ...fromFluxTableTransformer(curr)]
  }, [])
  const maxColumnCount = Math.max(...tables.map(c => c.length))
  return {data: tables, maxColumnCount}
}

export const fromFluxTableTransformer = (response: string): string[][] => {
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
  let [currVal] = values
  let [currTable] = tables
  let columnHeaders = []
  const tableData = []
  // find where the table splits based on yielded result names
  const groupSet = new Set(fluxGroupKeyUnion)
  for (let i = 0; i < tables.length; i++) {
    if (i === 0) {
      // build out the columnHeader = chunk[3]
      columnHeaders = columnKeys.filter(col =>
        filterColumnHeaders(col, table, i)
      )
      const {groupHeaders, dataTypes, defaultRow} = getGroupDataDefaultHeaders(
        columnHeaders,
        table,
        groupSet,
        values[i]
      )
      tableData.push(groupHeaders, dataTypes, defaultRow, [
        '',
        ...columnHeaders,
      ])
    }
    if (values[i] !== currVal || tables[i] !== currTable) {
      // sets the boundaries for the chunk based on different yields or tables
      currVal = values[i]
      currTable = tables[i]
      // create a chunk
      // build out the columnHeader = chunk[3]
      columnHeaders = columnKeys.filter(col =>
        filterColumnHeaders(col, table, i)
      )
      const {groupHeaders, dataTypes, defaultRow} = getGroupDataDefaultHeaders(
        columnHeaders,
        table,
        groupSet,
        values[i]
      )
      tableData.push([], groupHeaders, dataTypes, defaultRow, [
        '',
        ...columnHeaders,
      ])
    }
    // construct the chunk of data for this given row
    tableData.push(getRowData(columnHeaders, table, i))
  }

  return tableData
}

type Headers = {
  groupHeaders: string[]
  dataTypes: string[]
  defaultRow: string[] // TODO(ariel): can this be a number or bool?
}

const getGroupDataDefaultHeaders = (
  columnHeaders: string[],
  table: Table,
  groupSet: Set<string>,
  value: string | number | boolean
): Headers => {
  // based on the columnHeader we can get the:
  // #group, true, false ...(chunk[0])
  const groupHeaders = buildGroupHeaders(columnHeaders, groupSet)
  // #datatype, 'string', 'long' ...(chunk[1])
  const dataTypes = [
    '#datatype',
    ...columnHeaders.map(col => table.getOriginalColumnType(col)),
  ]
  // #default, result, '', '' ...(chunk[2])
  const defaultRow = ['#default', `${value}`]
  while (defaultRow.length <= columnHeaders.length) {
    defaultRow.push('')
  }
  return {
    groupHeaders,
    dataTypes,
    defaultRow,
  }
}

const filterColumnHeaders = (
  column: string,
  table: Table,
  index: number
): boolean => {
  const columnType: any = table.getColumnType(column)
  const values = table.getColumn(column, columnType)
  return values[index] !== undefined
}

const buildGroupHeaders = (
  columnHeaders: string[],
  groupSet: Set<string>
): string[] =>
  columnHeaders.reduce(
    (acc, col) => {
      return [...acc, `${groupSet.has(col)}`]
    },
    ['#group']
  )

const getRowData = (row: string[], table: Table, index: number): any[] =>
  row.reduce(
    (acc, col) => {
      const type: any = table.getColumnType(col)
      let colData: any = table.getColumn(col, type)[index]
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
  // TODO(ariel): refactor this when we get new types from giraffe
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
