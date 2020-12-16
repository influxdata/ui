// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {Plot} from '@influxdata/giraffe'
import {flatMap} from 'lodash'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'
import ThresholdMarkers from 'src/shared/components/ThresholdMarkers'
import EventMarkers from 'src/shared/components/EventMarkers'

// Utils
import {getFormatter, filterNoisyColumns} from 'src/shared/utils/vis'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'

// Types
import {
  CheckViewProperties,
  CheckType,
  StatusRow,
  Threshold,
} from 'src/types'
import {useCheckYDomain} from 'src/alerting/utils/vis'
import {updateThresholds} from 'src/alerting/actions/alertBuilder'

// Types
import {VisProps} from 'src/visualization'

interface OwnProps extends VisProps {
  properties: CheckViewProperties
}

const X_COLUMN = '_time'
const Y_COLUMN = '_value'

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const CheckPlot: FC<Props> = ({
  properties,
  result,
  timeRange,
  timeZone,
  theme,

  statuses,
  checkType,
  thresholds,
  onUpdateThresholds,
}) => {
  const [yDomain, onSetYDomain, onResetYDomain] = useCheckYDomain(
    result.table.getColumn(Y_COLUMN, 'number'),
    thresholds
  )

  const columnKeys = result.table.columnKeys
  const isValidView =
    columnKeys.includes(X_COLUMN) && columnKeys.includes(Y_COLUMN)

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const groupKey = [...result.fluxGroupKeyUnion, 'result']

  const xFormatter = getFormatter(result.table.getColumnType(X_COLUMN), {
    timeZone,
    trimZeros: false,
  })

  const yFormatter = getFormatter(result.table.getColumnType(Y_COLUMN), {
    timeZone,
    trimZeros: false,
  })

  const legendColumns = filterNoisyColumns(
    [...groupKey, X_COLUMN, Y_COLUMN],
    result.table
  )

  const thresholdValues = flatMap(thresholds, (t: any) => [
    t.value,
    t.minValue,
    t.maxValue,
  ]).filter(t => t !== undefined)

  const yTicks = thresholdValues.length ? thresholdValues : null

  const colorHexes =
    properties.colors && properties.colors.length
      ? properties.colors.map(c => c.hex)
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const currentTheme = theme === 'light' ? VIS_THEME_LIGHT : VIS_THEME

  return (
    <div className="time-series-container time-series-container--alert-check">
        <Plot config={{
    ...currentTheme,
    table: result.table,
    legendColumns,
    yTicks,
    yDomain,
    onSetYDomain,
    onResetYDomain,
    valueFormatters: {
      [X_COLUMN]: xFormatter,
      [Y_COLUMN]: yFormatter,
    },
    layers: [
      {
        type: 'line',
        x: X_COLUMN,
        y: Y_COLUMN,
        fill: groupKey,
        interpolation: 'linear',
        colors: colorHexes,
      },
      {
        type: 'custom',
        render: ({yScale, yDomain}) => (
          <ThresholdMarkers
            key="thresholds"
            thresholds={checkType === 'threshold' ? thresholds : []}
            onSetThresholds={onUpdateThresholds}
            yScale={yScale}
            yDomain={yDomain}
          />
        ),
      },
      {
        type: 'custom',
        render: ({xScale, xDomain}) => (
          <EventMarkers
            key="events"
            eventsArray={statuses}
            xScale={xScale}
            xDomain={xDomain}
            xFormatter={xFormatter}
          />
        ),
      },
    ],
            }} />
    </div>
  )
}

const mdtp = {
  onUpdateThresholds: updateThresholds,
}

const connector = connect(null, mdtp)

export default connector(CheckPlot)
