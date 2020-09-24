// Libraries
import React, {FC, useMemo} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Config, Table} from '@influxdata/giraffe'
import {get} from 'lodash'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
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
  BAND_LINE_OPACITY,
  BAND_LINE_WIDTH,
  BAND_SHADE_OPACITY,
  QUERY_BUILDER_MODE,
  VIS_THEME,
  VIS_THEME_LIGHT,
} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'

// Types
import {
  AppState,
  BandViewProperties,
  TimeZone,
  TimeRange,
  Theme,
} from 'src/types'

interface OwnProps {
  children: (config: Config) => JSX.Element
  fluxGroupKeyUnion: string[]
  timeRange?: TimeRange | null
  table: Table
  timeZone: TimeZone
  viewProperties: BandViewProperties
  theme: Theme
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps & OwnProps

const BandPlot: FC<Props> = ({
  activeQueryIndex,
  children,
  fluxGroupKeyUnion,
  timeRange,
  table,
  timeZone,
  viewProperties: {
    geom,
    colors,
    xColumn: storedXColumn,
    yColumn: storedYColumn,
    upperColumn: upperColumnName,
    lowerColumn: lowerColumnName,
    mainColumn,
    hoverDimension,
    legendOpacity,
    legendOrientationThreshold,
    axes: {
      x: {
        label: xAxisLabel,
        prefix: xTickPrefix,
        suffix: xTickSuffix,
        base: xTickBase,
        bounds: xBounds,
      },
      y: {
        label: yAxisLabel,
        prefix: yTickPrefix,
        suffix: yTickSuffix,
        bounds: yBounds,
        base: yTickBase,
      },
    },
    timeFormat,
    queries,
  },
  theme,
}) => {
  const mainColumnName = useMemo(() => {
    const editMode = get(queries, `${activeQueryIndex}.editMode`, 'unknown')
    if (editMode !== QUERY_BUILDER_MODE) {
      return mainColumn
    }

    const aggregateFunctions = get(
      queries,
      `${activeQueryIndex}.builderConfig.functions`,
      []
    )
    const selectedFunctions = aggregateFunctions.map(f => f.name)
    return getMainColumnName(
      selectedFunctions,
      upperColumnName,
      mainColumn,
      lowerColumnName
    )
  }, [activeQueryIndex, queries, upperColumnName, mainColumn, lowerColumnName])

  const tooltipOpacity = useLegendOpacity(legendOpacity)
  const tooltipOrientationThreshold = useLegendOrientationThreshold(
    legendOrientationThreshold
  )

  const storedXDomain = useMemo(() => parseXBounds(xBounds), [xBounds])
  const storedYDomain = useMemo(() => parseYBounds(yBounds), [yBounds])
  const xColumn = storedXColumn || defaultXColumn(table, '_time')
  const yColumn =
    (table.columnKeys.includes(storedYColumn) && storedYColumn) ||
    defaultYColumn(table)

  const columnKeys = table.columnKeys

  const isValidView =
    xColumn &&
    columnKeys.includes(xColumn) &&
    yColumn &&
    columnKeys.includes(yColumn)

  const colorHexes =
    colors && colors.length
      ? colors.map(c => c.hex)
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const interpolation = geomToInterpolation(geom)

  const groupKey = [...fluxGroupKeyUnion, 'result']

  const [xDomain, onSetXDomain, onResetXDomain] = useVisXDomainSettings(
    storedXDomain,
    table.getColumn(xColumn, 'number'),
    timeRange
  )

  const memoizedYColumnData = useMemo(
    () => table.getColumn(yColumn, 'number'),
    [table, yColumn]
  )

  const [yDomain, onSetYDomain, onResetYDomain] = useVisYDomainSettings(
    storedYDomain,
    memoizedYColumnData
  )

  const legendColumns = filterNoisyColumns(
    [...groupKey, xColumn, yColumn],
    table
  )

  const xFormatter = getFormatter(table.getColumnType(xColumn), {
    prefix: xTickPrefix,
    suffix: xTickSuffix,
    base: xTickBase,
    timeZone,
    timeFormat,
  })

  const yFormatter = getFormatter(table.getColumnType(yColumn), {
    prefix: yTickPrefix,
    suffix: yTickSuffix,
    base: yTickBase,
    timeZone,
    timeFormat,
  })

  const currentTheme = theme === 'light' ? VIS_THEME_LIGHT : VIS_THEME

  const config: Config = {
    ...currentTheme,
    table,
    xAxisLabel,
    yAxisLabel,
    xDomain,
    onSetXDomain,
    onResetXDomain,
    yDomain,
    onSetYDomain,
    onResetYDomain,
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
        hoverDimension,
        upperColumnName,
        mainColumnName,
        lowerColumnName,
      },
    ],
  }

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  return children(config)
}

const mstp = (state: AppState) => ({
  activeQueryIndex: getActiveQueryIndex(state),
})

const connector = connect(mstp)
export default connector(BandPlot)
