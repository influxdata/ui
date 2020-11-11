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
import {getFormatter, defaultXColumn, mosaicYcolumn} from 'src/shared/utils/vis'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'

// Types
import {MosaicViewProperties, TimeZone, TimeRange, Theme} from 'src/types'

interface Props {
  children: (config: Config) => JSX.Element
  fluxGroupKeyUnion?: string[]
  timeRange: TimeRange | null
  table: Table
  timeZone: TimeZone
  viewProperties: MosaicViewProperties
  theme?: Theme
}

const MosaicPlot: FunctionComponent<Props> = ({
  children,
  timeRange,
  timeZone,
  table,
  viewProperties: {
    xAxisLabel,
    yAxisLabel,
    fillColumns: storedFill,
    colors,
    xDomain: storedXDomain,
    yDomain: storedYDomain,
    xColumn: storedXColumn,
    ySeriesColumns: storedYColumn,
    timeFormat,
    legendOpacity,
    legendOrientationThreshold,
    generateXAxisTicks,
    xTotalTicks,
    xTickStart,
    xTickStep,
  },
  theme,
}) => {
  const fillColumns = storedFill || []
  const xColumn = storedXColumn || defaultXColumn(table)
  let yColumn
  if (storedYColumn) {
    yColumn = storedYColumn[0]
  } else {
    yColumn = mosaicYcolumn(table)
  }
  const columnKeys = table.columnKeys

  const axisTicksOptions = useAxisTicksGenerator({
    generateXAxisTicks,
    xTotalTicks,
    xTickStart,
    xTickStep,
    generateYAxisTicks: [],
    yTotalTicks: null,
    yTickStart: null,
    yTickStep: null,
  })
  const tooltipOpacity = useLegendOpacity(legendOpacity)
  const tooltipOrientationThreshold = useLegendOrientationThreshold(
    legendOrientationThreshold
  )

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    storedXDomain,
    table.getColumn(xColumn, 'number'),
    timeRange
  )

  const [yDomain, onSetYDomain, onResetYDomain] = useVisYDomainSettings(
    storedYDomain,
    table.getColumn(yColumn, 'string')
  )

  const isValidView =
    xColumn &&
    columnKeys.includes(xColumn) &&
    yColumn &&
    columnKeys.includes(yColumn) &&
    fillColumns.length !== 0 &&
    fillColumns.every(col => columnKeys.includes(col))

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const colorHexes =
    colors && colors.length ? colors : DEFAULT_LINE_COLORS.map(c => c.hex)

  const xFormatter = getFormatter(table.getColumnType(xColumn), {
    timeZone,
    timeFormat,
  })

  const yFormatter = getFormatter(table.getColumnType(yColumn), {
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
        type: 'mosaic',
        x: xColumn,
        y: yColumn,
        colors: colorHexes,
        fill: fillColumns,
      },
    ],
  }
  return children(config)
}
export default MosaicPlot
