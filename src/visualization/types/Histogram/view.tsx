// Libraries
import React, {FunctionComponent} from 'react'
import {Plot} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {
  useLegendOpacity,
  useLegendOrientationThreshold,
  useLegendColorizeRows,
} from 'src/visualization/utils/useLegendOrientation'
import {useVisXDomainSettings} from 'src/visualization/utils/useVisDomainSettings'
import {getFormatter} from 'src/visualization/utils/getFormatter'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'

// Types
import {HistogramViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

interface Props extends VisualizationProps {
  properties: HistogramViewProperties
}

const HistogramPlot: FunctionComponent<Props> = ({
  result,
  timeZone,
  properties,
  theme,
}) => {
  const columnKeys = result.table.columnKeys
  const fillColumns = properties.fillColumns || result.fluxGroupKeyUnion

  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
  const tooltipColorize = useLegendColorizeRows(properties.legendColorizeRows)
  const tooltipOrientationThreshold = useLegendOrientationThreshold(
    properties.legendOrientationThreshold
  )

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    properties.xDomain,
    result.table.getColumn(properties.xColumn, 'number')
  )

  const isValidView =
    properties.xColumn &&
    columnKeys.includes(properties.xColumn) &&
    fillColumns.every(col => columnKeys.includes(col))

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const colorHexes =
    properties.colors && properties.colors.length
      ? properties.colors.map(c => c.hex)
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const xFormatter = getFormatter(
    result.table.getColumnType(properties.xColumn),
    {timeZone}
  )

  const currentTheme = theme === 'light' ? VIS_THEME_LIGHT : VIS_THEME

  return (
    <Plot
      config={{
        ...currentTheme,
        table: result.table,
        xAxisLabel: properties.xAxisLabel,
        xDomain,
        onSetXDomain,
        onResetXDomain,
        valueFormatters: {[properties.xColumn]: xFormatter},
        legendOpacity: tooltipOpacity,
        legendOrientationThreshold: tooltipOrientationThreshold,
        legendColorizeRows: tooltipColorize,
        layers: [
          {
            type: 'histogram',
            x: properties.xColumn,
            colors: colorHexes,
            fill: properties.fillColumns || [],
            binCount: properties.binCount,
            position: properties.position,
          },
        ],
      }}
    />
  )
}

export default HistogramPlot
