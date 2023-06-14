import {FromFluxResult} from '@influxdata/giraffe'

export const parseFromFluxResults = (
  parsedChunk: FromFluxResult
): {tableData: string[][]; max: number} => {
  const {
    fluxGroupKeyUnion,
    table,
    table: {columnKeys: keys},
  } = parsedChunk

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
  let originalType: any
  let columnData: any
  let column: any
  const groupSet = new Set(fluxGroupKeyUnion)
  let max = 0

  // checks whether the string is valid JSON object or not
  const isJsonObject = jsonString => {
    try {
      const object = JSON.parse(jsonString)
      if (object && typeof object === 'object') {
        return true
      }
    } catch {}

    return false
  }

  for (let i = 0; i < tables?.length; i++) {
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
      originalType = table.getOriginalColumnType(column)
      columnData = table.getColumn(column, rowType)[i]
      if (
        originalType === 'dateTime:RFC3339' &&
        typeof columnData === 'number' &&
        !isNaN(columnData)
      ) {
        columnData = new Date(columnData).toISOString()
      }

      // (Sahas):
      // the columnData can have a comma (,) in two cases
      // 1. it's a JSON Object
      // 2. It's a string of CSV
      if (isJsonObject(columnData)) {
        // 1. replace Double quotes \" with Single quotes \' in a json object
        // 2. then wrap the JSON object in double quotes
        columnData = `"${columnData.replace(/['"]+/g, "'")}"`
      } else if (typeof columnData === 'string' && columnData.includes(',')) {
        columnData = `"${columnData}"`
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
