// Libraries
import React, {FunctionComponent, useContext, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Config, Plot} from '@influxdata/giraffe'
import {RemoteDataState} from '@influxdata/clockface'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'
import ViewLoadingSpinner from 'src/visualization/components/internal/ViewLoadingSpinner'

// Utils
import {useAxisTicksGenerator} from 'src/visualization/utils/useAxisTicksGenerator'
import {getFormatter} from 'src/visualization/utils/getFormatter'
import {useLegendOpacity} from 'src/visualization/utils/useLegendOpacity'
import {useZoomQuery} from 'src/visualization/utils/useZoomQuery'
import {
  useZoomRequeryXDomainSettings,
  useZoomRequeryYDomainSettings,
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
import {ScatterViewProperties, InternalFromFluxResult} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Selectors
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'

interface Props extends VisualizationProps {
  properties: ScatterViewProperties
}

const ScatterPlot: FunctionComponent<Props> = ({
  properties,
  result,
  timeRange,
  transmitWindowPeriod,
}) => {
  const [resultState, setResultState] = useState(result)
  const [preZoomResult, setPreZoomResult] =
    useState<InternalFromFluxResult>(null)
  const [requeryStatus, setRequeryStatus] = useState<RemoteDataState>(
    RemoteDataState.NotStarted
  )

  useEffect(() => {
    setResultState(result)
  }, [result])

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

  const {activeQueryIndex, queries: zoomQueries} = useZoomQuery(
    properties.queries
  )

  const [xDomain, onSetXDomain, onResetXDomain] = useZoomRequeryXDomainSettings(
    {
      activeQueryIndex,
      adaptiveZoomHide: properties.adaptiveZoomHide,
      data: resultState.table.getColumn(xColumn, 'number'),
      parsedResult: resultState,
      preZoomResult,
      queries: zoomQueries,
      setPreZoomResult,
      setRequeryStatus,
      setResult: setResultState,
      storedDomain: properties.xDomain,
      timeRange: xColumn === '_time' ? timeRange : null,
      transmitWindowPeriod,
    }
  )

  const [yDomain, onSetYDomain, onResetYDomain] = useZoomRequeryYDomainSettings(
    {
      activeQueryIndex,
      adaptiveZoomHide: properties.adaptiveZoomHide,
      data: resultState.table.getColumn(yColumn, 'number'),
      parsedResult: resultState,
      preZoomResult,
      queries: zoomQueries,
      setPreZoomResult,
      setRequeryStatus,
      setResult: setResultState,
      storedDomain: properties.yDomain,
      transmitWindowPeriod,
    }
  )

  const dispatch = useDispatch()
  const inAnnotationMode = useSelector(isAnnotationsModeEnabled)

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

  if (inAnnotationMode) {
    config.interactionHandlers = {
      singleClick: () => {
        dispatch(handleUnsupportedGraphType('Scatter Plot'))
      },
    }
  }

  return (
    <>
      {isFlagEnabled('zoomRequery') && (
        <ViewLoadingSpinner loading={requeryStatus} />
      )}
      <Plot config={config} />
    </>
  )
}

export default ScatterPlot
