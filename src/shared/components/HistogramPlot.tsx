// Libraries
import React, {FunctionComponent, useMemo} from 'react'
import {Config, Table} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {useVisXDomainSettings} from 'src/shared/utils/useVisDomainSettings'
import {getFormatter} from 'src/shared/utils/vis'

// Constants
import {
  LEGEND_OPACITY_DEFAULT,
  VIS_THEME,
  VIS_THEME_LIGHT,
} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'

// Types
import {HistogramViewProperties, TimeZone, Theme} from 'src/types'

interface Props {
  table: Table
  viewProperties: HistogramViewProperties
  children: (config: Config) => JSX.Element
  timeZone: TimeZone
  theme?: Theme
}

const HistogramPlot: FunctionComponent<Props> = ({
  table,
  children,
  timeZone,
  viewProperties: {
    xColumn,
    fillColumns,
    binCount,
    position,
    colors,
    xAxisLabel,
    xDomain: storedXDomain,
    legendOpacity,
    legendOrientationThreshold,
  },
  theme,
}) => {
  const columnKeys = table.columnKeys

  const tooltipOpacity = useMemo(() => {
    if (isFlagEnabled('legendOrientation')) {
      return legendOpacity
    }
    return LEGEND_OPACITY_DEFAULT
  }, [legendOpacity])

  const tooltipOrientationThreshold = useMemo(() => {
    if (isFlagEnabled('legendOrientation')) {
      return legendOrientationThreshold
    }
    return undefined
  }, [legendOrientationThreshold])

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    storedXDomain,
    table.getColumn(xColumn, 'number')
  )

  const isValidView =
    xColumn &&
    columnKeys.includes(xColumn) &&
    fillColumns.every(col => columnKeys.includes(col))

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const colorHexes =
    colors && colors.length
      ? colors.map(c => c.hex)
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const xFormatter = getFormatter(table.getColumnType(xColumn), {timeZone})

  const currentTheme = theme === 'light' ? VIS_THEME_LIGHT : VIS_THEME

  const config: Config = {
    ...currentTheme,
    table,
    xAxisLabel,
    xDomain,
    onSetXDomain,
    onResetXDomain,
    valueFormatters: {[xColumn]: xFormatter},
    legendOpacity: tooltipOpacity,
    legendOrientationThreshold: tooltipOrientationThreshold,
    layers: [
      {
        type: 'histogram',
        x: xColumn,
        colors: colorHexes,
        fill: fillColumns,
        binCount,
        position,
      },
    ],
  }

  return children(config)
}

export default HistogramPlot
