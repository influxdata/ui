// Libraries
import React, {FC, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Plot} from '@influxdata/giraffe'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {useAxisTicksGenerator} from 'src/visualization/utils/useAxisTicksGenerator'
import {
  useLegendOpacity,
  useLegendOrientationThreshold,
} from 'src/shared/utils/useLegendOrientation'
import {
  useVisXDomainSettings,
  useVisYDomainSettings,
} from 'src/shared/utils/useVisDomainSettings'
import {
  getFormatter,
  getMainColumnName,
  geomToInterpolation,
  filterNoisyColumns,
  parseXBounds,
  parseYBounds,
  defaultXColumn,
  defaultYColumn,
} from 'src/shared/utils/vis'
import {getActiveQueryIndex} from 'src/timeMachine/selectors'

// Constants
import {
  QUERY_BUILDER_MODE,
  VIS_THEME,
  VIS_THEME_LIGHT,
} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'

// Types
import {AppState, BandViewProperties} from 'src/types'
import {VisProps} from 'src/visualization'

interface OwnProps extends VisProps {
  properties: BandViewProperties
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

const BAND_LINE_OPACITY = 0.7
const BAND_LINE_WIDTH = 3
const BAND_SHADE_OPACITY = 0.3

const BandPlot: FC<Props> = ({
  activeQueryIndex,
  properties,
  result,
  timeRange,
  timeZone,
  theme,
}) => {
  // TODO: there's a lot of weight required for getting a string here.
  // We have to pass around all of the queries, assume redux is set up
  // and has an active query context (not the case in notebooks), etc.
  // maybe move to a new level?
  const mainColumnName = useMemo(() => {
    const editMode = properties.queries[activeQueryIndex]?.editMode || 'unknown'
    if (editMode !== QUERY_BUILDER_MODE) {
      return properties.mainColumn
    }

    const aggregateFunctions =
      properties.queries[activeQueryIndex]?.builderConfig?.functions || []
    const selectedFunctions = aggregateFunctions.map(f => f.name)
    return getMainColumnName(
      selectedFunctions,
      properties.upperColumn,
      properties.mainColumn,
      properties.lowerColumn
    )
  }, [
    activeQueryIndex,
    properties.queries,
    properties.upperColumn,
    properties.mainColumn,
    properties.lowerColumn,
  ])

  const axisTicksOptions = useAxisTicksGenerator(properties)
  const tooltipOpacity = useLegendOpacity(properties.legendOpacity)
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

  const memoizedYColumnData = useMemo(
    () => result.table.getColumn(yColumn, 'number'),
    [result.table, yColumn]
  )

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
    prefix: properties.axes.x.prefix,
    suffix: properties.axes.x.suffix,
    base: properties.axes.x.base,
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
        valueFormatters: {
          [xColumn]: xFormatter,
          [yColumn]: yFormatter,
        },
        layers: [
          {
            type: 'band',
            x: xColumn,
            y: yColumn,
            fill: groupKey,
            interpolation,
            colors: colorHexes,
            lineWidth: BAND_LINE_WIDTH,
            lineOpacity: BAND_LINE_OPACITY,
            shadeOpacity: BAND_SHADE_OPACITY,
            hoverDimension: properties.hoverDimension,
            upperColumnName: properties.upperColumn,
            mainColumnName,
            lowerColumnName: properties.lowerColumn,
          },
        ],
      }}
    />
  )
}

const mstp = (state: AppState) => ({
  activeQueryIndex: getActiveQueryIndex(state),
})

const connector = connect(mstp)
export default connector(BandPlot)
