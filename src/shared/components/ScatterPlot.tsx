// Libraries
import React, {FunctionComponent} from 'react'
import {Config, Table} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {useAxisTicksGenerator} from 'src/shared/utils/useAxisTicksGenerator'
import {
  useLegendOpacity,
  useLegendOrientationThreshold,
} from 'src/shared/utils/useLegendOrientation'
import {
  useVisXDomainSettings,
  useVisYDomainSettings,
} from 'src/shared/utils/useVisDomainSettings'
import {
  getFormatter,
  defaultXColumn,
  defaultYColumn,
} from 'src/shared/utils/vis'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'

// Types
import {ScatterViewProperties, TimeZone, TimeRange, Theme} from 'src/types'

interface Props {
  children: (config: Config) => JSX.Element
  fluxGroupKeyUnion?: string[]
  table: Table
  timeZone: TimeZone
  timeRange?: TimeRange | null
  viewProperties: ScatterViewProperties
  theme?: Theme
}

const ScatterPlot: FunctionComponent<Props> = ({
  children,
  timeZone,
  table,
  timeRange,
  viewProperties: {
    xAxisLabel,
    yAxisLabel,
    xPrefix,
    xSuffix,
    yPrefix,
    ySuffix,
    fillColumns: storedFill,
    symbolColumns: storedSymbol,
    colors,
    xDomain: storedXDomain,
    yDomain: storedYDomain,
    xColumn: storedXColumn,
    yColumn: storedYColumn,
    timeFormat,
    legendOpacity,
    legendOrientationThreshold,
    generateXAxisTicks,
    xTotalTicks,
    xTickStart,
    xTickStep,
    generateYAxisTicks,
    yTotalTicks,
    yTickStart,
    yTickStep,
  },
  theme,
}) => {
  const fillColumns = storedFill || []
  const symbolColumns = storedSymbol || []

  const xColumn = storedXColumn || defaultXColumn(table)
  const yColumn = storedYColumn || defaultYColumn(table)

  const columnKeys = table.columnKeys

  const axisTicksOptions = useAxisTicksGenerator({
    generateXAxisTicks,
    xTotalTicks,
    xTickStart,
    xTickStep,
    generateYAxisTicks,
    yTotalTicks,
    yTickStart,
    yTickStep,
  })
  const tooltipOpacity = useLegendOpacity(legendOpacity)
  const tooltipOrientationThreshold = useLegendOrientationThreshold(
    legendOrientationThreshold
  )

  let timerange

  if (xColumn === '_time') {
    timerange = timeRange
  }

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    storedXDomain,
    table.getColumn(xColumn, 'number'),
    timerange
  )

  const [yDomain, onSetYDomain, onResetYDomain] = useVisYDomainSettings(
    storedYDomain,
    table.getColumn(yColumn, 'number')
  )

  const isValidView =
    xColumn &&
    columnKeys.includes(xColumn) &&
    yColumn &&
    columnKeys.includes(yColumn) &&
    fillColumns.every(col => columnKeys.includes(col)) &&
    symbolColumns.every(col => columnKeys.includes(col))

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const colorHexes =
    colors && colors.length ? colors : DEFAULT_LINE_COLORS.map(c => c.hex)

  const xFormatter = getFormatter(table.getColumnType(xColumn), {
    prefix: xPrefix,
    suffix: xSuffix,
    timeZone,
    timeFormat,
  })

  const yFormatter = getFormatter(table.getColumnType(yColumn), {
    prefix: yPrefix,
    suffix: ySuffix,
    timeZone,
    timeFormat,
  })

  const currentTheme = theme === 'light' ? VIS_THEME_LIGHT : VIS_THEME

  const config: Config = {
    ...currentTheme,
    table,
    xAxisLabel,
    yAxisLabel,
    xDomain,
    onSetXDomain,
    onResetXDomain,
    yDomain,
    onSetYDomain,
    onResetYDomain,
    ...axisTicksOptions,
    legendOpacity: tooltipOpacity,
    legendOrientationThreshold: tooltipOrientationThreshold,
    valueFormatters: {
      [xColumn]: xFormatter,
      [yColumn]: yFormatter,
    },
    layers: [
      {
        type: 'scatter',
        x: xColumn,
        y: yColumn,
        colors: colorHexes,
        fill: fillColumns,
        symbol: symbolColumns,
      },
    ],
  }
  return children(config)
}

export default ScatterPlot
