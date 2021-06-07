// Libraries
import React, {FunctionComponent, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Config, Plot} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {useAxisTicksGenerator} from 'src/visualization/utils/useAxisTicksGenerator'
import {getFormatter} from 'src/visualization/utils/getFormatter'
import {useLegendOpacity} from 'src/visualization/utils/useLegendOrientation'
import {
  useVisXDomainSettings,
  useVisYDomainSettings,
} from 'src/visualization/utils/useVisDomainSettings'
import {defaultXColumn, defaultYColumn} from 'src/shared/utils/vis'
import {AppSettingContext} from 'src/shared/contexts/app'
import {handleUnsupportedGraphType} from 'src/visualization/utils/annotationUtils'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'

// Types
import {ScatterViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Selectors
import {isWriteModeEnabled} from 'src/annotations/selectors'

interface Props extends VisualizationProps {
  properties: ScatterViewProperties
}

const ScatterPlot: FunctionComponent<Props> = ({
  properties,
  result,
  timeRange,
}) => {
  const {theme, timeZone} = useContext(AppSettingContext)
  const fillColumns = properties.fillColumns || result.fluxGroupKeyUnion || []
  const symbolColumns =
    properties.symbolColumns || result.fluxGroupKeyUnion || []

  const xColumn = properties.xColumn || defaultXColumn(result.table)
  const yColumn = properties.yColumn || defaultYColumn(result.table)

  const columnKeys = result.table.columnKeys

  const axisTicksOptions = useAxisTicksGenerator(properties)
  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
  const tooltipColorize = properties.legendColorizeRows
  const tooltipOrientationThreshold = properties.legendOrientationThreshold

  let timerange

  if (xColumn === '_time') {
    timerange = timeRange
  }

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    properties.xDomain,
    result.table.getColumn(xColumn, 'number'),
    timerange
  )

  const [yDomain, onSetYDomain, onResetYDomain] = useVisYDomainSettings(
    properties.yDomain,
    result.table.getColumn(yColumn, 'number')
  )

  const dispatch = useDispatch()
  const inAnnotationWriteMode = useSelector(isWriteModeEnabled)

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
        type: 'scatter',
        x: xColumn,
        y: yColumn,
        colors: colorHexes,
        fill: fillColumns,
        symbol: symbolColumns,
      },
    ],
  }

  if (inAnnotationWriteMode && isFlagEnabled('annotations')) {
    config.interactionHandlers = {
      singleClick: () => {
        dispatch(handleUnsupportedGraphType('Scatter Plot'))
      },
    }
  }

  return <Plot config={config} />
}

export default ScatterPlot
