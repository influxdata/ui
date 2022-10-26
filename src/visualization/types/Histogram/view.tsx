// Libraries
import React, {FunctionComponent, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Config, Plot} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {useLegendOpacity} from 'src/visualization/utils/useLegendOpacity'
import {useVisXDomainSettings} from 'src/visualization/utils/useVisDomainSettings'
import {getFormatter} from 'src/visualization/utils/getFormatter'
import {AppSettingContext} from 'src/shared/contexts/app'
import {handleUnsupportedGraphType} from 'src/visualization/utils/annotationUtils'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'

// Types
import {HistogramViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Selectors
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'

interface Props extends VisualizationProps {
  properties: HistogramViewProperties
}

export const Histogram: FunctionComponent<Props> = ({result, properties}) => {
  const {theme, timeZone} = useContext(AppSettingContext)
  const columnKeys = result.table.columnKeys
  const fillColumns = properties.fillColumns || result.fluxGroupKeyUnion

  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
  const tooltipColorize = properties.legendColorizeRows
  const tooltipOrientationThreshold = properties.legendOrientationThreshold

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    properties.xDomain,
    result.table.getColumn(properties.xColumn, 'number')
  )

  const dispatch = useDispatch()
  const inAnnotationMode = useSelector(isAnnotationsModeEnabled)

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

  const config: Config = {
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
  }

  if (inAnnotationMode) {
    config.interactionHandlers = {
      singleClick: () => {
        dispatch(handleUnsupportedGraphType('Histogram'))
      },
    }
  }

  return <Plot config={config} />
}
