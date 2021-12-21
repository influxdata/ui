// Libraries
import React, {FC, useMemo, useContext} from 'react'
import {connect, ConnectedProps, useDispatch, useSelector} from 'react-redux'
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

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Context
import {AppSettingContext} from 'src/shared/contexts/app'

// Redux
import {isAnnotationsModeEnabled} from 'src/annotations/selectors'
import {getByID} from 'src/resources/selectors'
import {updateViewAndVariables} from 'src/views/actions/thunks'

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
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getColorMappingObjects} from 'src/visualization/utils/colorMappingUtils'

// Annotations
import {addAnnotationLayer} from 'src/visualization/utils/annotationUtils'

type ReduxProps = ConnectedProps<typeof connector>

interface OwnProps extends VisualizationProps {
  properties: XYViewProperties
}

type Props = OwnProps & ReduxProps

const XYPlot: FC<Props> = ({
  properties,
  result,
  timeRange,
  annotations,
  cellID,
  view,
  saveViewPropertiesToIDPE,
  veoOpen,
}) => {
  const {theme, timeZone} = useContext(AppSettingContext)
  const axisTicksOptions = useAxisTicksGenerator(properties)
  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
  const tooltipColorize = properties.legendColorizeRows
  const tooltipHide = properties.legendHide
  const tooltipOrientationThreshold = properties.legendOrientationThreshold
  const staticLegend = useStaticLegend(properties)
  const dispatch = useDispatch()

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
    const [, fillColumnMap] = createGroupIDColumn(result.table, groupKey)
    const {
      colorMappingForGiraffe,
      colorMappingForIDPE,
      needsToSaveToIDPE,
    } = getColorMappingObjects(fillColumnMap, properties)
    colorMapping = colorMappingForGiraffe

    // when the view is in a dashboard cell, and there is a need to save to IDPE, save it.
    if (needsToSaveToIDPE && view?.dashboardID && !veoOpen) {
      console.log('%c updating the view properties to idpe', 'background: #bada55; color: #222',)
      const newView = {...view}
      newView.properties.colorMapping = colorMappingForIDPE
      saveViewPropertiesToIDPE(view.dashboardID, newView)
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

const mapStateToProps = (state: AppState, ownProps: OwnProps) => {
  // the view inside a cell for which we want to update the view properties of
  const view = getByID<View<XYViewProperties>>(
    state,
    ResourceType.Views,
    ownProps.cellID
  )

  const {
    timeMachines: {activeTimeMachineID},
  } = state

  const veoOpen = activeTimeMachineID === 'veo'

  return {
    view,
    veoOpen,
  }
}

const mapDispatchToProps = {
  saveViewPropertiesToIDPE: updateViewAndVariables,
}

const connector = connect(mapStateToProps, mapDispatchToProps)
export default connector(XYPlot)
