import React, {FC, useCallback, useContext, useMemo} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'

// Contexts
import {
  AggregateWindow,
  DEFAULT_AGGREGATE_WINDOW,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'

// Utilities
import {ComponentStatus} from '@influxdata/clockface'

// Styles
import './Sidebar.scss'

const AGGREGATE_WINDOW_TOOLTIP = `test`

const AggregateWindow: FC = () => {
  const {selection, setSelection} = useContext(PersistanceContext)
  const {isOn, column: selectedColumn}: AggregateWindow =
    selection.resultOptions.aggregateWindow

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

  const handleSelectColumn = useCallback(
    (column: string) => {
      const aggregateWindow: AggregateWindow =
        selection.resultOptions.aggregateWindow
      aggregateWindow.column = column
      setSelection({
        resultOptions: {
          // TODO: what if the user wants to not have column?
          aggregateWindow,
        },
      })
    },
    [selection.resultOptions.aggregateWindow, setSelection]
  )

  const columnSelector = useMemo(() => {
    return (
      isOn && (
        <SearchableDropdown
          options={['column1', 'column2', 'column3']} // TODO: get column from backend
          selectedOption={selectedColumn || 'Select column'}
          onSelect={handleSelectColumn}
          buttonStatus={ComponentStatus.Default} // TODO: use toComponentStatus
          testID="aggregate-window--column--dropdown"
          buttonTestID="aggregate-window--column--dropdown-button"
          menuTestID="aggregate-window--column--dropdown-menu"
          emptyText="No columns found" // TODO: re-phrase it
        />
      )
    )
  }, [isOn, selectedColumn, handleSelectColumn])

  return useMemo(() => {
    return (
      <div className="result-options--item">
        <ToggleWithLabelTooltip
          label="Aggregate"
          active={isOn}
          onChange={() => handleToggleAggregateWindow(isOn)}
          tooltipContents={AGGREGATE_WINDOW_TOOLTIP}
        />
        {columnSelector}
        {/* {functionSelector}
        {durationForm}
        {createEmptyToggle} */}
      </div>
    )
  }, [isOn, handleToggleAggregateWindow, columnSelector])
}

export {AggregateWindow}
