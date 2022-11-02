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
import {defaultXColumn} from 'src/shared/utils/vis'
import {AppSettingContext} from 'src/shared/contexts/app'
import {handleUnsupportedGraphType} from 'src/visualization/utils/annotationUtils'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'

// Types
import {MosaicViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Selectors
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'

interface Props extends VisualizationProps {
  properties: MosaicViewProperties
}

export const Mosaic: FunctionComponent<Props> = ({
  properties,
  result,
  timeRange,
}) => {
  const {theme, timeZone} = useContext(AppSettingContext)
  const fillColumns = properties.fillColumns || []
  const xColumn = properties.xColumn || defaultXColumn(result.table)
  const ySeriesColumns = properties.ySeriesColumns || []
  const columnKeys = result.table.columnKeys

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
    result.table.getColumn(ySeriesColumns[0], 'string')
  )

  const dispatch = useDispatch()
  const inAnnotationMode = useSelector(isAnnotationsModeEnabled)

  const isValidView =
    xColumn &&
    columnKeys.includes(xColumn) &&
    ySeriesColumns.every(ySeriesColumn => columnKeys.includes(ySeriesColumn)) &&
    fillColumns.length !== 0 &&
    fillColumns.every(fillColumn => columnKeys.includes(fillColumn))

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const colorHexes =
    properties.colors && properties.colors.length
      ? properties.colors
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const xFormatter = getFormatter(result.table.getColumnType(xColumn), {
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
    },
    layers: [
      {
        type: 'mosaic',
        x: xColumn,
        y: ySeriesColumns,
        yLabelColumns: properties.yLabelColumns,
        yLabelColumnSeparator: properties.yLabelColumnSeparator,
        colors: colorHexes,
        fill: fillColumns,
      },
    ],
  }

  if (inAnnotationMode) {
    config.interactionHandlers = {
      singleClick: () => {
        dispatch(handleUnsupportedGraphType('Mosaic'))
      },
    }
  }
  return <Plot config={config} />
}
