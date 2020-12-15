// Libraries
import React, {FunctionComponent} from 'react'
import {Plot} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {useAxisTicksGenerator} from 'src/visualization/utils/useAxisTicksGenerator'
import {
  useLegendOpacity,
  useLegendOrientationThreshold,
} from 'src/shared/utils/useLegendOrientation'
import {
  useVisXDomainSettings,
  useVisYDomainSettings,
} from 'src/shared/utils/useVisDomainSettings'
import {getFormatter} from 'src/shared/utils/vis'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'

// Types
import {HeatmapViewProperties} from 'src/types'
import {VisProps} from 'src/visualization'

interface Props extends VisProps {
  properties: HeatmapViewProperties
}

const HeatmapPlot: FunctionComponent<Props> = ({
  result,
  properties,
  timeRange,
  timeZone,
  theme,
}) => {
  const columnKeys = result.table.columnKeys

  const axisTicksOptions = useAxisTicksGenerator(properties)
  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
  const tooltipOrientationThreshold = useLegendOrientationThreshold(
    properties.legendOrientationThreshold
  )

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    properties.xDomain,
    result.table.getColumn(properties.xColumn, 'number'),
    timeRange
  )

  const [yDomain, onSetYDomain, onResetYDomain] = useVisYDomainSettings(
    properties.yDomain,
    result.table.getColumn(properties.yColumn, 'number')
  )

  const isValidView =
    properties.xColumn &&
    properties.yColumn &&
    columnKeys.includes(properties.yColumn) &&
    columnKeys.includes(properties.xColumn)

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const colors: string[] =
    properties.colors && properties.colors.length
      ? properties.colors
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const xFormatter = getFormatter(
    result.table.getColumnType(properties.xColumn),
    {
      prefix: properties.xPrefix,
      suffix: properties.xSuffix,
      timeZone,
      timeFormat: properties.timeFormat,
    }
  )

  const yFormatter = getFormatter(
    result.table.getColumnType(properties.yColumn),
    {
      prefix: properties.yPrefix,
      suffix: properties.ySuffix,
      timeZone,
      timeFormat: properties.timeFormat,
    }
  )

  const currentTheme = theme === 'light' ? VIS_THEME_LIGHT : VIS_THEME

  return (
    <Plot
      config={{
        ...currentTheme,
        table: result.table,
        xAxisLabel: properties.xAxisLabel,
        yAxisLabel: properties.yAxisLabel,
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
          [properties.xColumn]: xFormatter,
          [properties.yColumn]: yFormatter,
        },
        layers: [
          {
            type: 'heatmap',
            x: properties.xColumn,
            y: properties.yColumn,
            colors,
            binSize: properties.binSize,
          },
        ],
      }}
    />
  )
}

export default HeatmapPlot
