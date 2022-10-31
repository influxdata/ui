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
  const {
    isOn,
    fn: selectedFunction,
    column: selectedColumn,
  }: AggregateWindow = selection.resultOptions.aggregateWindow

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

  const handleSelectFunction = useCallback(
    (fn: string) => {
      const aggregateWindow: AggregateWindow =
        selection.resultOptions.aggregateWindow
      aggregateWindow.fn = fn
      setSelection({
        resultOptions: {
          aggregateWindow,
        },
      })
    },
    [selection.resultOptions.aggregateWindow, setSelection]
  )

  const functionSelector = useMemo(() => {
    return (
      isOn && (
        <SearchableDropdown
          options={['fn1', 'fn2', 'fn3', 'fn4']} // TODO: get aggregate functions from backend
          selectedOption={selectedFunction || 'Select aggregate function'}
          onSelect={handleSelectFunction}
          buttonStatus={ComponentStatus.Default} // TODO: use toComponentStatus
          testID="aggregate-window--function--dropdown"
          buttonTestID="aggregate-window--function--dropdown-button"
          menuTestID="aggregate-window--function--dropdown-menu"
          emptyText="No functions find. Refresh the page and retry." // TODO: re-phrase it
        />
      )
    )
  }, [isOn, selectedFunction, handleSelectFunction])

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
        {functionSelector}
        {/* {durationForm}
        {createEmptyToggle} */}
      </div>
    )
  }, [isOn, columnSelector, functionSelector, handleToggleAggregateWindow])
}

export {AggregateWindow}
