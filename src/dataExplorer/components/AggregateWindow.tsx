import React, {FC, useCallback, useContext, useMemo} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'

// Contexts
import {
  AggregateWindow,
  DEFAULT_AGGREGATE_WINDOW,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'

// Styles
import './Sidebar.scss'

const AGGREGATE_TOOLTIP = `test`

const AggregateWindow: FC = () => {
  const {selection, setSelection} = useContext(PersistanceContext)
  const {isOn}: AggregateWindow = selection.resultOptions.aggregateWindow

  const handleToggleAggregateWindow = useCallback(
    (isOn: boolean) => {
      const aggregateWindow: AggregateWindow = JSON.parse(
        JSON.stringify(DEFAULT_AGGREGATE_WINDOW)
      )
      aggregateWindow.isOn = !isOn
      setSelection({
        resultOptions: {
          aggregateWindow,
        },
      })
    },
    [setSelection]
  )

  return useMemo(() => {
    return (
      <ToggleWithLabelTooltip
        label="Aggregate"
        active={isOn}
        onChange={() => handleToggleAggregateWindow(isOn)}
        tooltipContents={AGGREGATE_TOOLTIP}
      />
    )
  }, [isOn, handleToggleAggregateWindow])
}

export {AggregateWindow}
