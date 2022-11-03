import React, {FC, useCallback, useContext, useEffect, useMemo} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import {ColumnSelector} from 'src/dataExplorer/components/ColumnSelector'
import {AggregateFunctionsSelector} from 'src/dataExplorer/components/AggregateFunctionSelector'
import {WindowPeriod} from 'src/dataExplorer/components/WindowPeriod'
import {FillValuesToggle} from 'src/dataExplorer/components/FillValuesToggle'

// Contexts
import {
  AggregateWindow,
  DEFAULT_AGGREGATE_WINDOW,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'

// Styles
import './Sidebar.scss'

const AGGREGATE_WINDOW_TOOLTIP = `test`

const AggregateWindow: FC = () => {
  // Contexts
  const {selection, setSelection} = useContext(PersistanceContext)

  const {isOn}: AggregateWindow =
    selection?.resultOptions?.aggregateWindow || DEFAULT_AGGREGATE_WINDOW

  useEffect(() => {
    setSelection({
      resultOptions: {
        aggregateWindow: JSON.parse(JSON.stringify(DEFAULT_AGGREGATE_WINDOW)),
      },
    })
  }, [selection.bucket, selection.measurement])

  const handleToggleAggregateWindow = useCallback(() => {
    const toBeOn = !selection?.resultOptions?.aggregateWindow?.isOn
    setSelection({
      resultOptions: {
        aggregateWindow: {
          ...JSON.parse(JSON.stringify(DEFAULT_AGGREGATE_WINDOW)),
          isOn: toBeOn,
        },
      },
    })
  }, [selection.resultOptions.aggregateWindow, setSelection])

  return useMemo(() => {
    return (
      <div>
        <ToggleWithLabelTooltip
          label="Aggregate"
          active={isOn}
          onChange={handleToggleAggregateWindow}
          tooltipContents={AGGREGATE_WINDOW_TOOLTIP}
          disabled={!selection.measurement}
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
