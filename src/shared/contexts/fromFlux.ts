import {csvParse, csvParseRows} from 'd3-dsv'

export const assert = (condition: boolean, errorMessage: string) => {
  if (!condition) {
    throw new Error(errorMessage)
  }
}

export const RESULT = 'result'

export interface Table {
  getColumn: any
  getColumnName: (columnKey: string) => string | null // null if the column is not available
  getColumnType: (columnKey: string) => any | null // null if the column is not available
  getOriginalColumnType: (columnKey: string) => any | null // null if the column is not available
  columnKeys: string[]
  length: number
  addColumn: (
    columnKey: string,
    fluxDataType: any,
    type: any,
    data: any,
    name?: string
  ) => Table
}

// Don't export me!
class SimpleTable implements Table {
  public readonly length: number = 0

  private columns: {
    [colKey: string]: {
      name: string
      fluxDataType: any
      type: any
      data: any
    }
  } = {}

  constructor(length: number) {
    this.length = length
  }

  get columnKeys(): string[] {
    return Object.keys(this.columns)
  }

  getColumn(columnKey: string, columnType?: any): any[] | null {
    const column = this.columns[columnKey]

    if (!column) {
      return null
    }

    // Allow time columns to be retrieved as number columns
    const isWideningTimeType = columnType === 'number' && column.type === 'time'

    if (columnType && columnType !== column.type && !isWideningTimeType) {
      return null
    }

    switch (columnType) {
      case 'number':
        return column.data as number[]
      case 'time':
        return column.data as number[]
      case 'string':
        return column.data as string[]
      case 'boolean':
        return column.data as boolean[]
      default:
        return column.data as any[]
    }
  }

  getColumnName(columnKey: string): string {
    const column = this.columns[columnKey]

    if (!column) {
      return null
    }

    return column.name
  }

  getColumnType(columnKey: string): any {
    const column = this.columns[columnKey]

    if (!column) {
      return null
    }

    return column.type
  }

  getOriginalColumnType(columnKey: string): any {
    const column = this.columns[columnKey]

    if (!column) {
      return null
    }

    return column.fluxDataType
  }

  addColumn(
    columnKey: string,
    fluxDataType: any,
    type: any,
    data: any,
    name?: string
  ): any {
    if (this.columns[columnKey]) {
      throw new Error('column already exists')
    }

    if (data.length !== this.length) {
      throw new Error(
        `expected column of length ${this.length}, got column of length ${data.length} instead`
      )
    }

    const table = new SimpleTable(this.length)

    table.columns = {
      ...this.columns,
      [columnKey]: {
        name: name || columnKey,
        fluxDataType,
        type,
        data,
      },
    }

    return table
  }
}

export const newTable = (length: number): any => new SimpleTable(length)

export const fromFlux = (fluxCSV: string): any => {
  const start = performance.now()
  const columns: any = {}
  const fluxGroupKeyUnion = new Set<string>()
  const resultColumnNames = new Set<string>()
  let tableLength = 0
  try {
    fluxCSV = fluxCSV.trimEnd()

    if (fluxCSV === '') {
      return {
        table: newTable(0),
        fluxGroupKeyUnion: [],
        resultColumnNames: [],
      }
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

    // finds the first non-whitespace character
    let curr = fluxCSV.search(/\S/)

    const chunks = []
    while (curr !== -1) {
      const oldVal = curr
      const nextIndex = fluxCSV
        .substring(curr, fluxCSV.length)
        .search(/\n\s*\n#/)
      if (nextIndex === -1) {
        chunks.push([oldVal, fluxCSV.length])
        curr = -1
        break
      } else {
        chunks.push([oldVal, oldVal + nextIndex])
        curr = oldVal + nextIndex + 2
      }
    }

    // declaring all nested variables here to reduce memory drain
    let tableText = ''
    let tableData: any = []
    let annotationText = ''
    let columnType: any = ''
    let columnKey = ''
    let columnDefault: any = ''

    let chunk = ''
    for (const [start, end] of chunks) {
      let index = 0
      chunk = fluxCSV.substring(start, end)

      annotationText = ''
      tableText = ''

      while (index !== -1) {
        const oldIndex = index
        index = chunk.substring(oldIndex, chunk.length).search(/\n/)

        if (index === -1) {
          if (chunk[oldIndex] === '#') {
            annotationText = `${annotationText}${chunk.substring(
              oldIndex,
              chunk.length
            )}`
          } else {
            tableText = `${tableText}${chunk.substring(oldIndex, chunk.length)}`
          }
          break
        } else {
          if (chunk[oldIndex] === '#') {
            annotationText = `${annotationText}${chunk.substring(
              oldIndex,
              oldIndex + index + 1
            )}`
          } else {
            tableText = `${tableText}${chunk.substring(
              oldIndex,
              oldIndex + index + 1
            )}`
          }
          index = index + oldIndex + 1
        }
      }

      assert(
        !!tableText,
        'could not find annotation lines in Flux response; are `annotations` enabled in the Flux query `dialect` option?'
      )

      /**
       * csvParse is a slow operation, but so we may want to see whether we can
       * find an alternative solution to the problem.
       *
       * Also, the trimStart here is because we're getting a \n prepended at some point,
       * so this trims that off
       */
      tableData = csvParse(tableText.trimStart())

      assert(
        !!annotationText,
        'could not find annotation lines in Flux response; are `annotations` enabled in the Flux query `dialect` option?'
      )
      const annotationData = parseAnnotations(annotationText, tableData.columns)

      for (const columnName of tableData.columns.slice(1)) {
        columnType =
          TO_COLUMN_TYPE[annotationData.datatypeByColumnName[columnName]]

        assert(
          !!columnType,
          `encountered unknown Flux column type ${annotationData.datatypeByColumnName[columnName]}`
        )

        columnKey = `${columnName} (${columnType})`

        if (!columns[columnKey]) {
          columns[columnKey] = {
            name: columnName,
            type: columnType,
            fluxDataType: annotationData.datatypeByColumnName[columnName],
            data: [],
          }
        }

        columnDefault = annotationData.defaultByColumnName[columnName]

        for (let i = 0; i < tableData.length; i++) {
          if (columnName === RESULT) {
            if (columnDefault.length) {
              resultColumnNames.add(columnDefault)
            } else if (tableData[i][columnName].length) {
              resultColumnNames.add(tableData[i][columnName])
            }
          }

          const value = tableData[i][columnName] || columnDefault
          let result = null

          if (value === undefined) {
            result = undefined
          } else if (value === 'null') {
            result = null
          } else if (value === 'NaN') {
            result = NaN
          } else if (columnType === 'boolean' && value === 'true') {
            result = true
          } else if (columnType === 'boolean' && value === 'false') {
            result = false
          } else if (columnType === 'string') {
            result = value
          } else if (columnType === 'time') {
            result = Date.parse(value.trim())
          } else if (columnType === 'number') {
            if (value === '') {
              result = null
            } else {
              const parsedValue = Number(value)
              result = parsedValue === parsedValue ? parsedValue : value
            }
          } else {
            result = null
          }

          columns[columnKey].data[tableLength + i] = result
        }

        if (annotationData.groupKey.includes(columnName)) {
          fluxGroupKeyUnion.add(columnKey)
        }
      }

      tableLength += tableData.length
    }

    resolveNames(columns, fluxGroupKeyUnion)

    const table = Object.entries(columns).reduce((table, d: any) => {
      const [key, {name, fluxDataType, type, data}] = d
      data.length = tableLength
      return table.addColumn(key, fluxDataType, type, data, name)
    }, newTable(tableLength))

    const result = {
      table,
      fluxGroupKeyUnion: Array.from(fluxGroupKeyUnion),
      resultColumnNames: Array.from(resultColumnNames),
    }

    return result
  } catch (error) {
    return {
      error: error as Error,
      table: newTable(0),
      fluxGroupKeyUnion: [],
      resultColumnNames: [],
    }
  }
}

const parseAnnotations = (
  annotationData: string,
  headerRow: string[]
): {
  groupKey: string[]
  datatypeByColumnName: {[columnName: string]: any}
  defaultByColumnName: {[columnName: string]: any}
} => {
  const rows = csvParseRows(annotationData)

  const groupRow = rows.find(row => row[0] === '#group')
  const datatypeRow = rows.find(row => row[0] === '#datatype')
  const defaultRow = rows.find(row => row[0] === '#default')

  assert(!!groupRow, 'could not find group annotation in Flux response')
  assert(!!datatypeRow, 'could not find datatype annotation in Flux response')
  assert(!!defaultRow, 'could not find default annotation in Flux response')

  const groupKey = groupRow.reduce(
    (acc, val, i) => (val === 'true' ? [...acc, headerRow[i]] : acc),
    []
  )

  const datatypeByColumnName = datatypeRow
    .slice(1)
    .reduce((acc, val, i) => ({...acc, [headerRow[i + 1]]: val}), {})

  const defaultByColumnName = defaultRow
    .slice(1)
    .reduce((acc, val, i) => ({...acc, [headerRow[i + 1]]: val}), {})

  return {groupKey, datatypeByColumnName, defaultByColumnName}
}

const TO_COLUMN_TYPE: {[fluxDatatype: string]: any} = {
  boolean: 'boolean',
  unsignedLong: 'number',
  long: 'number',
  double: 'number',
  string: 'string',
  'dateTime:RFC3339': 'time',
}

/*
  Each column in a parsed `Table` can only have a single type, but because we
  combine columns from multiple Flux tables into a single table, we may
  encounter conflicting types for a given column during parsing.
  To avoid this issue, we seperate the concept of the column _key_ and column
  _name_ in the `Table` object, where each key is unique but each name is not
  necessarily unique. We name the keys something like "foo (int)", where "foo"
  is the name and "int" is the type.
  But since type conflicts are rare and the public API requires referencing
  columns by key, we want to avoid unwieldy keys whenever possible. So the last
  stage of parsing is to rename all column keys from the `$NAME ($TYPE)` format
  to just `$NAME` if we can do so safely. That is what this function does.
*/
const resolveNames = (columns: any, fluxGroupKeyUnion: Set<string>): void => {
  const colNameCounts = Object.values(columns)
    .map((col: any) => col.name)
    .reduce((acc, name) => ({...acc, [name]: (acc[name] || 0) + 1}), {})

  const uniqueColNames = Object.entries(colNameCounts)
    .filter(([_, count]) => count === 1)
    .map(([name]) => name)

  for (const uniqueName of uniqueColNames) {
    const [columnKey, column] = Object.entries(columns).find(
      ([_, col]) => (col as any).name === uniqueName
    )

    columns[uniqueName] = column

    delete columns[columnKey]

    if (fluxGroupKeyUnion.has(columnKey)) {
      fluxGroupKeyUnion.delete(columnKey)
      fluxGroupKeyUnion.add(uniqueName)
    }
  }
}
