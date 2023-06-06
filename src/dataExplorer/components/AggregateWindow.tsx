import React, {FC, useCallback, useContext, useEffect, useMemo} from 'react'

// Components
import {ComponentStatus} from '@influxdata/clockface'
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import {ColumnSelector} from 'src/dataExplorer/components/ColumnSelector'
import {AggregateFunctionsSelector} from 'src/dataExplorer/components/AggregateFunctionSelector'
import {WindowPeriod} from 'src/dataExplorer/components/WindowPeriod'
import {FillValuesToggle} from 'src/dataExplorer/components/FillValuesToggle'

// Contexts
import {
  AggregateWindow,
  DEFAULT_AGGREGATE_WINDOW,
  PersistenceContext,
} from 'src/dataExplorer/context/persistence'

// Styles
import './Sidebar.scss'

const AGGREGATE_WINDOW_TOOLTIP = `test`

const AggregateWindow: FC = () => {
  // Contexts
  const {selection, setSelection} = useContext(PersistenceContext)

  const {isOn}: AggregateWindow =
    selection.resultOptions?.aggregateWindow || DEFAULT_AGGREGATE_WINDOW

  useEffect(() => {
    setSelection({
      resultOptions: {
        aggregateWindow: JSON.parse(JSON.stringify(DEFAULT_AGGREGATE_WINDOW)),
      },
    })
  }, [selection.bucket, selection.measurement])

  const handleToggleAggregateWindow = useCallback(() => {
    setSelection({
      resultOptions: {
        aggregateWindow: {
          ...JSON.parse(JSON.stringify(DEFAULT_AGGREGATE_WINDOW)),
          isOn: !selection.resultOptions?.aggregateWindow?.isOn,
        },
      },
    })
  }, [selection.resultOptions?.aggregateWindow, setSelection])

  return useMemo(() => {
    return (
      <div>
        <ToggleWithLabelTooltip
          label="Aggregate"
          active={isOn}
          onChange={handleToggleAggregateWindow}
          tooltipContents={AGGREGATE_WINDOW_TOOLTIP}
          status={
            selection.measurement
              ? ComponentStatus.Default
              : ComponentStatus.Disabled
          }
        />
        <ColumnSelector />
        <AggregateFunctionsSelector />
        <WindowPeriod />
        <FillValuesToggle />
      </div>
    )
  }, [isOn, selection.measurement, handleToggleAggregateWindow])
}

export {AggregateWindow}
