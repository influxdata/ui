// Libraries
import React, {FC, useMemo, useContext} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  AnnotationLayerConfig,
  Config,
  DomainLabel,
  InteractionHandlerArguments,
  Plot,
  getDomainDataFromLines,
  lineTransform,
} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Context
import {AppSettingContext} from 'src/shared/contexts/app'

// Redux
import {writeThenFetchAndSetAnnotations} from 'src/annotations/actions/thunks'
import {FALLBACK_COLOR} from 'src/annotations/reducers/index'
import {
  getAnnotationStreams,
  getVisibleAnnotationStreams,
  isSingleClickAnnotationsEnabled,
} from 'src/annotations/selectors'

import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'

// Types
import {XYViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

// Utils
import {useAxisTicksGenerator} from 'src/visualization/utils/useAxisTicksGenerator'
import {getFormatter} from 'src/visualization/utils/getFormatter'
import {
  useLegendOpacity,
  useLegendOrientationThreshold,
  useLegendColorizeRows,
} from 'src/visualization/utils/useLegendOrientation'
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
import {event} from 'src/cloud/utils/reporting'

interface Props extends VisualizationProps {
  properties: XYViewProperties
}

const XYPlot: FC<Props> = ({properties, result, timeRange, annotations}) => {
  const {theme, timeZone} = useContext(AppSettingContext)
  const axisTicksOptions = useAxisTicksGenerator(properties)
  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
  const tooltipColorize = useLegendColorizeRows(properties.legendColorizeRows)
  const tooltipOrientationThreshold = useLegendOrientationThreshold(
    properties.legendOrientationThreshold
  )
  const dispatch = useDispatch()

  // it doesn't know that it is even *in* a dashboard, much less which dashboard it is in.
  // so having annotations on per dashboard is not supported yet
  // these next two values are set in the dashboard, and used whether or not this view is in a dashboard
  // or in configuration/single cell popout mode
  // would need to add the annotation control bar to the VEOHeader to get access to the controls,
  // which are currently global values, not per dashboard
  const inAnnotationWriteMode = useSelector(isSingleClickAnnotationsEnabled)
  const visibleAnnotationStreams = useSelector(getVisibleAnnotationStreams)

  const annotationStreams = useSelector(getAnnotationStreams)

  const storedXDomain = useMemo(() => parseXBounds(properties.axes.x.bounds), [
    properties.axes.x.bounds,
  ])
  const storedYDomain = useMemo(() => parseYBounds(properties.axes.y.bounds), [
    properties.axes.y.bounds,
  ])
  const xColumn = properties.xColumn || defaultXColumn(result.table, '_time')
  const yColumn =
    (result.table.columnKeys.includes(properties.yColumn) &&
      properties.yColumn) ||
    defaultYColumn(result.table)

  const columnKeys = result.table.columnKeys

  const isValidView =
    xColumn &&
    columnKeys.includes(xColumn) &&
    yColumn &&
    columnKeys.includes(yColumn)

  const colorHexes =
    properties.colors && properties.colors.length
      ? properties.colors.map(c => c.hex)
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const interpolation = geomToInterpolation(properties.geom)

  const groupKey = [...result.fluxGroupKeyUnion, 'result']

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    storedXDomain,
    result.table.getColumn(xColumn, 'number'),
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
      return getDomainDataFromLines(lineData, DomainLabel.Y)
    }
    return result.table.getColumn(yColumn, 'number')
  }, [
    result.table,
    yColumn,
    xColumn,
    properties.position,
    colorHexes,
    groupKey,
  ])

  const [yDomain, onSetYDomain, onResetYDomain] = useVisYDomainSettings(
    storedYDomain,
    memoizedYColumnData
  )

  const legendColumns = filterNoisyColumns(
    [...groupKey, xColumn, yColumn],
    result.table
  )

  const xFormatter = getFormatter(result.table.getColumnType(xColumn), {
    prefix: properties.axes.x.prefix,
    suffix: properties.axes.x.suffix,
    base: properties.axes.x.base,
    timeZone,
    timeFormat: properties.timeFormat,
  })

  const yFormatter = getFormatter(result.table.getColumnType(yColumn), {
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

  const makeSingleClickHandler = () => {
    const createAnnotation = userModifiedAnnotation => {
      const {message, startTime} = userModifiedAnnotation
      event('xyplot.annotations.create_annotation.create')
      dispatch(
        writeThenFetchAndSetAnnotations([
          {
            summary: message,
            startTime: new Date(startTime).getTime(),
            endTime: new Date(startTime).getTime(),
          },
        ])
      )
    }

    const singleClickHandler = (
      plotInteraction: InteractionHandlerArguments
    ) => {
      event('xyplot.annotations.create_annotation.show_overlay')
      dispatch(
        showOverlay(
          'add-annotation',
          {
            createAnnotation,
            startTime: plotInteraction.valueX,
          },
          () => {
            event('xyplot.annotations.create_annotation.cancel')
            dismissOverlay()
          }
        )
      )
    }

    return singleClickHandler
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

  if (isFlagEnabled('annotations')) {
    if (inAnnotationWriteMode) {
      config.interactionHandlers = {
        singleClick: makeSingleClickHandler(),
      }
    }

    // show only the streams that are enabled by the user, the 'default' stream is enabled by default.
    let selectedAnnotations: any[] = []

    // we want to check what annotations are enabled
    visibleAnnotationStreams.forEach(visibleStreamName => {
      if (annotations && annotations[visibleStreamName]) {
        const correspondingStream = annotationStreams.find(
          stream => stream.stream === visibleStreamName
        )

        const annotationsWithStreamColor = annotations[visibleStreamName].map(
          annotation => {
            return {
              ...annotation,
              color: correspondingStream?.color ?? FALLBACK_COLOR,
            }
          }
        )
        selectedAnnotations = [...annotationsWithStreamColor]
      }
    })

    if (selectedAnnotations.length) {
      const annotationLayer: AnnotationLayerConfig = {
        type: 'annotation',
        x: xColumn,
        y: yColumn,
        fill: groupKey,
        annotations: selectedAnnotations.map(annotation => {
          return {
            title: annotation.summary,
            description: '',
            color: annotation.color,
            startValue: new Date(annotation.startTime).getTime(),
            stopValue: new Date(annotation.endTime).getTime(),
            dimension: 'x',
            pin: 'start',
          }
        }),
      }

      config.layers.push(annotationLayer)
    }
  }
  return <Plot config={config} />
}

export default XYPlot
