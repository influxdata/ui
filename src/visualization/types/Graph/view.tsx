// Libraries
import React, {FC, useMemo, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  Config,
  DomainLabel,
  LINE_COUNT,
  Plot,
  STACKED_LINE_CUMULATIVE,
  createGroupIDColumn,
  getDomainDataFromLines,
  lineTransform,
  LineLayerConfig,
} from '@influxdata/giraffe'
import memoizeOne from 'memoize-one'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Context
import {AppSettingContext} from 'src/shared/contexts/app'

// Redux
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'

// Types
import {AppState, ResourceType, View, XYViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Utils
import {useAxisTicksGenerator} from 'src/visualization/utils/useAxisTicksGenerator'
import {getFormatter} from 'src/visualization/utils/getFormatter'
import {useLegendOpacity} from 'src/visualization/utils/useLegendOpacity'
import {useStaticLegend} from 'src/visualization/utils/useStaticLegend'
import {
  useVisXDomainSettings,
  useVisYDomainSettings,
} from 'src/visualization/utils/useVisDomainSettings'
import {
  geomToInterpolation,
  filterNoisyColumns,
  parseXBounds,
  parseYBounds,
  defaultXColumn,
  defaultYColumn,
} from 'src/shared/utils/vis'

// Annotations
import {addAnnotationLayer} from 'src/visualization/utils/annotationUtils'
import {getColorMappingObjects} from 'src/visualization/utils/colorMappingUtils'
import {isFlagEnabled} from '../../../shared/utils/featureFlag'

// Selectors
import {getByID} from 'src/resources/selectors'
import {updateViewAndVariables} from 'src/views/actions/thunks'

interface Props extends VisualizationProps {
  properties: XYViewProperties
}

const XYPlot: FC<Props> = ({
  properties,
  result,
  timeRange,
  annotations,
  cellID,
}) => {
  const {theme, timeZone} = useContext(AppSettingContext)
  const axisTicksOptions = useAxisTicksGenerator(properties)
  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
  const tooltipColorize = properties.legendColorizeRows
  const tooltipHide = properties.legendHide
  const tooltipOrientationThreshold = properties.legendOrientationThreshold
  const staticLegend = useStaticLegend(properties)
  const dispatch = useDispatch()
  const view = useSelector((state: AppState) =>
    getByID<View<XYViewProperties>>(state, ResourceType.Views, cellID)
  )
  const {activeTimeMachineID} = useSelector(
    (state: AppState) => state.timeMachines
  )
  const isVeoOpen = activeTimeMachineID === 'veo'

  // these two values are set in the dashboard, and used whether or not this view
  // is in a dashboard or in configuration/single cell popout mode
  // would need to add the annotation control bar to the VEOHeader to get access to the controls,
  // which are currently global values, not per dashboard
  const inAnnotationMode = useSelector(isAnnotationsModeEnabled)

  const storedXDomain = useMemo(() => parseXBounds(properties.axes.x.bounds), [
    properties.axes.x.bounds,
  ])
  const storedYDomain = useMemo(() => parseYBounds(properties.axes.y.bounds), [
    properties.axes.y.bounds,
  ])
  const columnKeys = Object.keys(result.table.columns)
  const xColumn = properties.xColumn || defaultXColumn(result.table, '_time')
  const yColumn =
    (columnKeys.includes(properties.yColumn) && properties.yColumn) ||
    defaultYColumn(result.table)

  const isValidView =
    xColumn &&
    columnKeys.includes(xColumn) &&
    yColumn &&
    columnKeys.includes(yColumn)

  const colorHexes = useMemo(() => {
    if (properties.colors && properties.colors.length) {
      return properties.colors.map(color => color.hex)
    }
    return DEFAULT_LINE_COLORS.map(color => color.hex)
  }, [properties.colors])

  const interpolation = geomToInterpolation(properties.geom)

  const groupKey = useMemo(() => [...result.fluxGroupKeyUnion, 'result'], [
    result,
  ])

  const col = result.table.columns[xColumn]
  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    storedXDomain,
    col.type === 'number' ? col.data : null,
    timeRange
  )

  const memoizedYColumnData = useMemo(() => {
    if (properties.position === 'stacked') {
      const {lineData} = lineTransform(
        result.table,
        xColumn,
        yColumn,
        groupKey,
        colorHexes,
        properties.position
      )
      const [fillColumn] = createGroupIDColumn(result.table, groupKey)
      return getDomainDataFromLines(lineData, [...fillColumn], DomainLabel.Y)
    }
    const col = result.table.columns[yColumn]
    return col.type === 'number' ? col.data : null
  }, [
    result.table,
    xColumn,
    yColumn,
    groupKey,
    colorHexes,
    properties.position,
  ])

  const [yDomain, onSetYDomain, onResetYDomain] = useVisYDomainSettings(
    storedYDomain,
    memoizedYColumnData
  )

  const legendColumns = filterNoisyColumns(
    properties.position === 'stacked'
      ? [
          ...groupKey,
          xColumn,
          yColumn,
          `_${STACKED_LINE_CUMULATIVE}`,
          `_${LINE_COUNT}`,
        ]
      : [...groupKey, xColumn, yColumn],
    result.table
  )

  const xFormatter = getFormatter(result.table.columns[xColumn].type, {
    prefix: properties.axes.x.prefix,
    suffix: properties.axes.x.suffix,
    base: properties.axes.x.base,
    timeZone,
    timeFormat: properties.timeFormat,
  })

  const yFormatter = getFormatter(result.table.columns[yColumn].type, {
    prefix: properties.axes.y.prefix,
    suffix: properties.axes.y.suffix,
    base: properties.axes.y.base,
    timeZone,
    timeFormat: properties.timeFormat,
  })

  const currentTheme = theme === 'light' ? VIS_THEME_LIGHT : VIS_THEME

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  let colorMapping = null

  if (isFlagEnabled('graphColorMapping')) {
    const memoizedGetColorMappingObjects = memoizeOne(getColorMappingObjects)
    const [, fillColumnMap] = createGroupIDColumn(result.table, groupKey)
    const {
      colorMappingForGiraffe,
      colorMappingForIDPE,
      needsToSaveToIDPE,
    } = memoizedGetColorMappingObjects(fillColumnMap, properties)
    colorMapping = colorMappingForGiraffe

    // when the view is in a dashboard cell, and there is a need to save to IDPE, save it.
    // when VEO is open, prevent from saving because it causes state issues. It will be handled in the timemachine code separately.
    if (needsToSaveToIDPE && view?.dashboardID && !isVeoOpen) {
      const newView = {...view}
      newView.properties.colorMapping = colorMappingForIDPE

      // save to IDPE
      dispatch(updateViewAndVariables(view.dashboardID, newView))
    }
  }

  const config: Config = {
    ...currentTheme,
    table: result.table,
    xAxisLabel: properties.axes.x.label,
    yAxisLabel: properties.axes.y.label,
    xDomain,
    onSetXDomain,
    onResetXDomain,
    yDomain,
    onSetYDomain,
    onResetYDomain,
    ...axisTicksOptions,
    legendColumns,
    legendOpacity: tooltipOpacity,
    legendOrientationThreshold: tooltipOrientationThreshold,
    legendColorizeRows: tooltipColorize,
    legendHide: tooltipHide,
    staticLegend,
    valueFormatters: {
      [xColumn]: xFormatter,
      [yColumn]: yFormatter,
    },
    layers: [
      {
        type: 'line',
        x: xColumn,
        y: yColumn,
        fill: groupKey,
        interpolation,
        position: properties.position,
        colors: colorHexes,
        shadeBelow: !!properties.shadeBelow,
        shadeBelowOpacity: 0.08,
        hoverDimension: properties.hoverDimension,
      },
    ],
  }

  if (isFlagEnabled('graphColorMapping')) {
    const layer = {...(config.layers[0] as LineLayerConfig)}

    layer.colorMapping = colorMapping

    config.layers[0] = layer
  }

  addAnnotationLayer(
    config,
    inAnnotationMode,
    cellID,
    xColumn,
    yColumn,
    groupKey,
    annotations,
    dispatch
  )

  return <Plot config={config} />
}

export default XYPlot
