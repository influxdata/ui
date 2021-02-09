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
import LatestValueTransform from 'src/visualization/components/LatestValueTransform'

// Utils
import {useAxisTicksGenerator} from 'src/visualization/utils/useAxisTicksGenerator'
import {getFormatter} from 'src/visualization/utils/getFormatter'
import {formatStatValue} from 'src/visualization/utils/formatStatValue'
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
import {generateThresholdsListHexs} from 'src/shared/constants/colorOperations'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'

// Types
import {LinePlusSingleStatProperties} from 'src/types'
import {VisualizationProps} from 'src/visualization'

interface Props extends VisualizationProps {
  properties: LinePlusSingleStatProperties
}

const SingleStatWithLine: FC<Props> = ({
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

  const _colors = properties.colors.filter(c => c.type === 'scale')
  const colorHexes =
    _colors && _colors.length
      ? _colors.map(c => c.hex)
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const interpolation = geomToInterpolation('line')

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
    >
      <LatestValueTransform table={result.table} allowString={true}>
        {latestValue => {
          const {
            bgColor: backgroundColor,
            textColor,
          } = generateThresholdsListHexs({
            colors: properties.colors.filter(c => c.type !== 'scale'),
            lastValue: latestValue,
            cellType: 'single-stat',
          })

          const formattedValue = formatStatValue(latestValue, {
            decimalPlaces: properties.decimalPlaces,
            prefix: properties.prefix,
            suffix: properties.suffix,
          })
          return (
            <div
              className="single-stat"
              style={{backgroundColor}}
              data-testid="single-stat"
            >
              <div className="single-stat--resizer">
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${formattedValue.length * 55} 100`}
                >
                  <text
                    className="single-stat--text"
                    data-testid="single-stat--text"
                    fontSize="100"
                    y="59%"
                    x="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    style={{fill: textColor}}
                  >
                    {formattedValue}
                  </text>
                </svg>
              </div>
            </div>
          )
        }}
      </LatestValueTransform>
    </Plot>
  )
}

export default SingleStatWithLine
