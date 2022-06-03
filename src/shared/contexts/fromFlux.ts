import Papa from 'papaparse'
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
  const columns: any = {}
  let tableLength = 0
  try {
    // finds the first non-whitespace character
    let curr = fluxCSV.search(/\S/)

    if (curr === -1) {
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
    let columnKey = ''
    const fluxGroupKeyUnion = new Set<string>()
    const resultColumnNames = new Set<string>()

    for (const [start, end] of chunks) {
      let annotationMode = true

      const parsed = {
        group: [],
        datatype: [],
        default: [],
        header: [],
        columnKey: [],
      }
      Papa.parse(fluxCSV.substring(start, end), {
        step: function(results) {
          if (results.data[0] === '#group') {
            parsed.group = results.data.slice(1)
          } else if (results.data[0] === '#datatype') {
            parsed.datatype = results.data.slice(1)
          } else if (results.data[0] === '#default') {
            parsed.default = results.data.slice(1)
          } else if (results.data[0][0] !== '#' && annotationMode === true) {
            annotationMode = false
            parsed.header = results.data.slice(1)
            parsed.header.reduce((acc, curr, index) => {
              columnKey = `${curr} (${TO_COLUMN_TYPE[parsed.datatype[index]]})`
              parsed.columnKey.push(columnKey)
              if (!acc[columnKey]) {
                acc[columnKey] = {
                  name: curr,
                  type: TO_COLUMN_TYPE[parsed.datatype[index]],
                  fluxDataType: parsed.datatype[index],
                  data: [],
                }
              }
              if (parsed.group[index] === 'true') {
                fluxGroupKeyUnion.add(columnKey)
              }
              return acc
            }, columns)
          } else {
            results.data.slice(1).forEach((data, index) => {
              const value = data || parsed.default[index]
              let result = null

              if (value === undefined) {
                result = undefined
              } else if (value === 'null') {
                result = null
              } else if (value === 'NaN') {
                result = NaN
              } else if (
                TO_COLUMN_TYPE[parsed.datatype[index]] === 'boolean' &&
                value === 'true'
              ) {
                result = true
              } else if (
                TO_COLUMN_TYPE[parsed.datatype[index]] === 'boolean' &&
                value === 'false'
              ) {
                result = false
              } else if (TO_COLUMN_TYPE[parsed.datatype[index]] === 'string') {
                result = value
              } else if (TO_COLUMN_TYPE[parsed.datatype[index]] === 'time') {
                if (/\s/.test(value)) {
                  result = Date.parse(value.trim())
                } else {
                  result = Date.parse(value)
                }
              } else if (TO_COLUMN_TYPE[parsed.datatype[index]] === 'number') {
                if (value === '') {
                  result = null
                } else {
                  const parsedValue = Number(value)
                  result = parsedValue === parsedValue ? parsedValue : value
                }
              } else {
                result = null
              }

              if (columns[parsed.columnKey[index]] !== undefined) {
                if (
                  columns[parsed.columnKey[index]].name === RESULT &&
                  result
                ) {
                  resultColumnNames.add(result)
                }
                columns[parsed.columnKey[index]].data[tableLength] = result
              }
            })
            tableLength++
          }
        },
      })
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

export const fastFromFlux = (fluxCSV: string): any => {
  const columns: any = {}
  const fluxGroupKeyUnion = new Set<string>()
  const resultColumnNames = new Set<string>()
  let tableLength = 0

  try {
    // finds the first non-whitespace character
    let curr = fluxCSV.search(/\S/)

    if (curr === -1) {
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

    for (const [start, end] of chunks) {
      annotationText = ''
      tableText = ''

      let index = start

      while (index < end) {
        const startsWithHash = fluxCSV[index] === '#'
        const isPrevNewLine =
          fluxCSV[index - 1] === '\n' || fluxCSV[index - 1] === undefined
        // check to see if the one before that is whitespace or a new line
        const isWhitespaceOrNewLine =
          fluxCSV[index - 2] === undefined ||
          fluxCSV[index - 2]?.search(/\S/) === -1
        if (startsWithHash && isPrevNewLine && isWhitespaceOrNewLine) {
          const nextIndex =
            fluxCSV.substring(index, end).lastIndexOf('\n#') + index
          const endOfAnnotation = fluxCSV.indexOf('\n', nextIndex + 1)

          if (nextIndex === -1 || endOfAnnotation === -1) {
            throw new Error(
              'annotation text was incompelte and could not be processed'
            )
          }
          // TODO(ariel): check to see if this is in the middle of a string
          // or if this is actually the end of the annotation text
          annotationText = fluxCSV.substring(index, endOfAnnotation)
          index = endOfAnnotation + 1
        } else {
          tableText = fluxCSV.substring(index, end)
          index = end
          break
        }
      }

      assert(
        !!tableText,
        'could not find table text lines in Flux response; are `annotations` enabled in the Flux query `dialect` option?'
      )

      /**
       * csvParse is a slow operation, so we may want to see whether we can
       * find an alternative solution to the problem.
       */
      tableData = csvParse(tableText)

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
          } as any
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
            if (/\s/.test(value)) {
              result = Date.parse(value.trim())
            } else {
              result = Date.parse(value)
            }
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

    const table = Object.entries(columns).reduce(
      (table, [key, {name, fluxDataType, type, data}]) => {
        data.length = tableLength
        return table.addColumn(key, fluxDataType, type, data, name)
      },
      newTable(tableLength)
    )

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
