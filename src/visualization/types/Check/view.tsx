// Libraries
import React, {FC, useContext} from 'react'
import {Plot} from '@influxdata/giraffe'
import {flatMap} from 'lodash'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'
import ThresholdMarkers from 'src/shared/components/ThresholdMarkers'
import EventMarkers from 'src/shared/components/EventMarkers'

// Utils
import {getFormatter} from 'src/visualization/utils/getFormatter'
import {filterNoisyColumns} from 'src/shared/utils/vis'
import {CheckContext} from 'src/checks/utils/context'

// Constants
import {VIS_THEME, VIS_THEME_LIGHT} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/visualization/constants'

// Types
import {CheckViewProperties} from 'src/types'
import {useCheckYDomain} from 'src/alerting/utils/vis'

// Types
import {VisualizationProps} from 'src/visualization'

interface Props extends VisualizationProps {
  properties: CheckViewProperties
}

const X_COLUMN = '_time'
const Y_COLUMN = '_value'

const CheckPlot: FC<Props> = ({properties, result, timeZone, theme}) => {
  const {statuses, thresholds, updateThresholds} = useContext(CheckContext)

  const [yDomain, onSetYDomain, onResetYDomain] = useCheckYDomain(
    result.table.getColumn(Y_COLUMN, 'number'),
    thresholds
  )

  const columnKeys = result.table.columnKeys
  const isValidView =
    columnKeys.includes(X_COLUMN) && columnKeys.includes(Y_COLUMN)
  const isYNumeric = result.table.getColumnType(Y_COLUMN) === 'number'

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  if (!isYNumeric) {
    return (
      <EmptyGraphMessage
        message="Checks only support numeric values. Please try choosing another field."
        testID="empty-graph--numeric"
      />
    )
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
      <Plot
        config={{
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
                  thresholds={thresholds}
                  onSetThresholds={updateThresholds}
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
        }}
      />
    </div>
  )
}

export default CheckPlot
