// Libraries
import React, {FC, useMemo} from 'react'
import {
  Plot,
  DomainLabel,
  lineTransform,
  getDomainDataFromLines,
} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

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

import {writeAnnotation} from 'src/annotations/api'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'

// Types
import {XYViewProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

interface Props extends VisualizationProps {
  properties: XYViewProperties
}

const XYPlot: FC<Props> = ({
  properties,
  result,
  timeRange,
  timeZone,
  theme,
}) => {
  const axisTicksOptions = useAxisTicksGenerator(properties)
  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
  const tooltipColorize = useLegendColorizeRows(properties.legendColorizeRows)
  const tooltipOrientationThreshold = useLegendOrientationThreshold(
    properties.legendOrientationThreshold
  )

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

  const doubleClickHandler = plotInteraction => {
    const annotationTime = new Date(plotInteraction.valueX).toISOString()
    writeAnnotation([
      {
        summary: 'hi',
        start: annotationTime,
        end: annotationTime,
      },
    ])
  }

  const interactionHandlers = {
    doubleClick: doubleClickHandler,
  }

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  return (
    <Plot
      config={{
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
        interactionHandlers: isFlagEnabled('annotations')
          ? interactionHandlers
          : null,
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
      }}
    />
  )
}

export default XYPlot
