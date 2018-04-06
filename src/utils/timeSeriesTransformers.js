import _ from 'lodash'
import {shiftDate} from 'shared/query/helpers'
import {map, reduce, filter, forEach, concat, clone} from 'fast.js'
import calculateSize from 'calculate-size'
import {
  CELL_HORIZONTAL_PADDING,
  calculateTimeColumnWidth,
  TIME_FIELD_DEFAULT,
} from 'src/shared/constants/tableGraph'

/**
 * Accepts an array of raw influxdb responses and returns a format
 * that Dygraph understands.
 **/

const DEFAULT_SIZE = 0
const cells = {
  label: new Array(DEFAULT_SIZE),
  value: new Array(DEFAULT_SIZE),
  time: new Array(DEFAULT_SIZE),
  seriesIndex: new Array(DEFAULT_SIZE),
  responseIndex: new Array(DEFAULT_SIZE),
}

const timeSeriesTransform = (raw = []) => {
  // collect results from each influx response
  const results = reduce(
    raw,
    (acc, rawResponse, responseIndex) => {
      const responses = _.get(rawResponse, 'response.results', [])
      const indexedResponses = map(responses, response => ({
        ...response,
        responseIndex,
      }))
      return [...acc, ...indexedResponses]
    },
    []
  )

  // collect each series
  const serieses = reduce(
    results,
    (acc, {series = [], responseIndex}, index) => {
      return [...acc, ...map(series, item => ({...item, responseIndex, index}))]
    },
    []
  )

  const size = reduce(
    serieses,
    (acc, {columns, values}) => {
      if (columns.length && (values && values.length)) {
        return acc + (columns.length - 1) * values.length
      }
      return acc
    },
    0
  )

  // convert series into cells with rows and columns
  let cellIndex = 0
  let labels = []

  forEach(
    serieses,
    ({
      name: measurement,
      columns,
      values,
      index: seriesIndex,
      responseIndex,
      tags = {},
    }) => {
      const rows = map(values || [], vals => ({
        vals,
      }))

      // tagSet is each tag key and value for a series
      const tagSet = map(Object.keys(tags), tag => `[${tag}=${tags[tag]}]`)
        .sort()
        .join('')
      const unsortedLabels = map(columns.slice(1), field => ({
        label: `${measurement}.${field}${tagSet}`,
        responseIndex,
        seriesIndex,
      }))
      labels = concat(labels, unsortedLabels)

      forEach(rows, ({vals}) => {
        const [time, ...rowValues] = vals

        forEach(rowValues, (value, i) => {
          cells.label[cellIndex] = unsortedLabels[i].label
          cells.value[cellIndex] = value
          cells.time[cellIndex] = time
          cells.seriesIndex[cellIndex] = seriesIndex
          cells.responseIndex[cellIndex] = responseIndex
          cellIndex++ // eslint-disable-line no-plusplus
        })
      })
    }
  )

  const sortedLabels = _.sortBy(labels, 'label')
  const tsMemo = {}
  const nullArray = Array(sortedLabels.length).fill(null)

  const labelsToValueIndex = reduce(
    sortedLabels,
    (acc, {label, seriesIndex}, i) => {
      // adding series index prevents overwriting of two distinct labels that have the same field and measurements
      acc[label + seriesIndex] = i
      return acc
    },
    {}
  )

  const timeSeries = []
  for (let i = 0; i < size; i++) {
    let time = cells.time[i]
    const value = cells.value[i]
    const label = cells.label[i]
    const seriesIndex = cells.seriesIndex[i]

    if (label.includes('_shifted__')) {
      const [, quantity, duration] = label.split('__')
      time = +shiftDate(time, quantity, duration).format('x')
    }

    let existingRowIndex = tsMemo[time]

    if (existingRowIndex === undefined) {
      timeSeries.push({
        time,
        values: clone(nullArray),
      })

      existingRowIndex = timeSeries.length - 1
      tsMemo[time] = existingRowIndex
    }

    timeSeries[existingRowIndex].values[
      labelsToValueIndex[label + seriesIndex]
    ] = value
  }
  const sortedTimeSeries = _.sortBy(timeSeries, 'time')

  return {
    sortedLabels,
    sortedTimeSeries,
  }
}

export const timeSeriesToDygraph = (raw = [], isInDataExplorer) => {
  const {sortedLabels, sortedTimeSeries} = timeSeriesTransform(raw)

  const dygraphSeries = reduce(
    sortedLabels,
    (acc, {label, responseIndex}) => {
      if (!isInDataExplorer) {
        acc[label] = {
          axis: responseIndex === 0 ? 'y' : 'y2',
        }
      }
      return acc
    },
    {}
  )

  return {
    labels: ['time', ...map(sortedLabels, ({label}) => label)],
    timeSeries: map(sortedTimeSeries, ({time, values}) => [
      new Date(time),
      ...values,
    ]),
    dygraphSeries,
  }
}

export const timeSeriesToTableGraph = raw => {
  const {sortedLabels, sortedTimeSeries} = timeSeriesTransform(raw)

  const labels = ['time', ...map(sortedLabels, ({label}) => label)]

  const tableData = map(sortedTimeSeries, ({time, values}) => [time, ...values])
  const data = tableData.length ? [labels, ...tableData] : [[]]
  return {
    labels,
    data,
  }
}

export const filterTableColumns = (data, fieldNames) => {
  const visibility = {}
  const filteredData = map(data, (row, i) => {
    return filter(row, (col, j) => {
      if (i === 0) {
        const foundField = fieldNames.find(field => field.internalName === col)
        visibility[j] = foundField ? foundField.visible : true
      }
      return visibility[j]
    })
  })
  return filteredData[0].length ? filteredData : [[]]
}

const updateMaxWidths = (
  row,
  maxColumnWidths,
  topRow,
  isTopRow,
  fieldNames,
  timeFormatWidth,
  verticalTimeAxis
) => {
  return reduce(
    row,
    (acc, col, c) => {
      const foundField = isTopRow
        ? fieldNames.find(field => field.internalName === col)
        : undefined
      const colValue =
        foundField && foundField.displayName ? foundField.displayName : `${col}`
      const columnLabel = topRow[c]

      const useTimeWidth =
        (columnLabel === TIME_FIELD_DEFAULT.internalName &&
          verticalTimeAxis &&
          !isTopRow) ||
        (!verticalTimeAxis &&
          isTopRow &&
          topRow[0] === TIME_FIELD_DEFAULT.internalName)

      const currentWidth = useTimeWidth
        ? timeFormatWidth
        : calculateSize(colValue, {
            font: isTopRow ? '"Roboto"' : '"RobotoMono", monospace',
            fontSize: '13px',
            fontWeight: 'bold',
          }).width + CELL_HORIZONTAL_PADDING

      const {widths: maxWidths} = maxColumnWidths
      const maxWidth = _.get(maxWidths, `${columnLabel}`, 0)

      if (isTopRow || currentWidth > maxWidth) {
        acc.widths[columnLabel] = currentWidth
        acc.totalWidths += currentWidth - maxWidth
      }
      return acc
    },
    {...maxColumnWidths}
  )
}

const calculateColumnWidths = (
  data,
  fieldNames,
  timeFormat,
  verticalTimeAxis
) => {
  const timeFormatWidth = calculateTimeColumnWidth(
    timeFormat === '' ? new Date().toISOString() : timeFormat
  )
  return reduce(
    data,
    (acc, row, r) => {
      return updateMaxWidths(
        row,
        acc,
        data[0],
        r === 0,
        fieldNames,
        timeFormatWidth,
        verticalTimeAxis
      )
    },
    {widths: {}, totalWidths: 0}
  )
}

export const processTableData = (
  data,
  sortFieldName,
  direction,
  verticalTimeAxis,
  fieldNames,
  timeFormat
) => {
  const sortIndex = _.indexOf(data[0], sortFieldName)
  const sortedData = [
    data[0],
    ..._.orderBy(_.drop(data, 1), sortIndex, [direction]),
  ]
  const sortedTimeVals = map(sortedData, r => r[0])
  const filteredData = filterTableColumns(sortedData, fieldNames)
  const processedData = verticalTimeAxis ? filteredData : _.unzip(filteredData)
  const {widths: columnWidths, totalWidths} = calculateColumnWidths(
    processedData,
    fieldNames,
    timeFormat,
    verticalTimeAxis
  )

  return {processedData, sortedTimeVals, columnWidths, totalWidths}
}

export default timeSeriesToDygraph
