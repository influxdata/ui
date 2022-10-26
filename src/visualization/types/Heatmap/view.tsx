// Libraries
import React, {FunctionComponent, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Config, Plot} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {useAxisTicksGenerator} from 'src/visualization/utils/useAxisTicksGenerator'
import {getFormatter} from 'src/visualization/utils/getFormatter'
import {useLegendOpacity} from 'src/visualization/utils/useLegendOpacity'
import {
  useVisXDomainSettings,
  useVisYDomainSettings,
} from 'src/visualization/utils/useVisDomainSettings'
import {handleUnsupportedGraphType} from 'src/visualization/utils/annotationUtils'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'
import {AppSettingContext} from 'src/shared/contexts/app'

// Types
import {HeatmapViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Selectors
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'

interface Props extends VisualizationProps {
  properties: HeatmapViewProperties
}

export const Heatmap: FunctionComponent<Props> = ({
  result,
  properties,
  timeRange,
}) => {
  const {theme, timeZone} = useContext(AppSettingContext)
  const columnKeys = result.table.columnKeys
  const xColumn =
    properties.xColumn ||
    ['_time', '_start', '_stop'].filter(field =>
      result.table.columnKeys.includes(field)
    )[0] ||
    result.table.columnKeys[0]
  const yColumn =
    properties.yColumn ||
    ['_value'].filter(field => result.table.columnKeys.includes(field))[0] ||
    result.table.columnKeys[0]

  const axisTicksOptions = useAxisTicksGenerator(properties)
  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
  const tooltipColorize = properties.legendColorizeRows
  const tooltipOrientationThreshold = properties.legendOrientationThreshold

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    properties.xDomain,
    result.table.getColumn(xColumn, 'number'),
    timeRange
  )

  const [yDomain, onSetYDomain, onResetYDomain] = useVisYDomainSettings(
    properties.yDomain,
    result.table.getColumn(yColumn, 'number')
  )

  const dispatch = useDispatch()
  const inAnnotationMode = useSelector(isAnnotationsModeEnabled)

  const isValidView =
    xColumn &&
    yColumn &&
    columnKeys.includes(yColumn) &&
    columnKeys.includes(xColumn)

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const colors: string[] =
    properties.colors && properties.colors.length
      ? properties.colors
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const xFormatter = getFormatter(result.table.getColumnType(xColumn), {
    prefix: properties.xPrefix,
    suffix: properties.xSuffix,
    timeZone,
    timeFormat: properties.timeFormat,
  })

  const yFormatter = getFormatter(result.table.getColumnType(yColumn), {
    prefix: properties.yPrefix,
    suffix: properties.ySuffix,
    timeZone,
    timeFormat: properties.timeFormat,
  })

  const currentTheme = theme === 'light' ? VIS_THEME_LIGHT : VIS_THEME

  const config: Config = {
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
    legendColorizeRows: tooltipColorize,
    valueFormatters: {
      [xColumn]: xFormatter,
      [yColumn]: yFormatter,
    },
    layers: [
      {
        type: 'heatmap',
        x: xColumn,
        y: yColumn,
        colors,
        binSize: properties.binSize,
      },
    ],
  }

  if (inAnnotationMode) {
    config.interactionHandlers = {
      singleClick: () => {
        dispatch(handleUnsupportedGraphType('Heatmap'))
      },
    }
  }

  return <Plot config={config} />
}
