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
      originalType = table.getOriginalColumnType(column)
      columnData = table.getColumn(column, rowType)[i]
      if (
        originalType === 'dateTime:RFC3339' &&
        typeof columnData === 'number' &&
        !isNaN(columnData)
      ) {
        columnData = new Date(columnData).toISOString()
      }
      if (typeof columnData === 'string') {
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
