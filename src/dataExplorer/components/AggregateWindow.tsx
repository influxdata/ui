import React, {FC, useCallback, useContext, useMemo, useState} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import DurationInput from 'src/shared/components/DurationInput'

// Contexts
import {
  AggregateWindow,
  DEFAULT_AGGREGATE_WINDOW,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'

// Constants
import {
  AGG_WINDOW_AUTO,
  DURATIONS,
  FUNCTIONS,
} from 'src/timeMachine/constants/queryBuilder'

// Utilities
import {ComponentStatus} from '@influxdata/clockface'

// Styles
import './Sidebar.scss'

const AGGREGATE_WINDOW_TOOLTIP = `test`
const WINDOW_PERIOD_TOOLTIP = `test`

const AggregateWindow: FC = () => {
  const {selection, setSelection} = useContext(PersistanceContext)
  const [columnSearchTerm, setColumnSearchTerm] = useState('')
  const [functionSearchTerm, setFunctionSearchTerm] = useState('')
  const {
    isOn,
    isAutoWindowPeriod,
    every: duration,
    fn: selectedFunction,
    column: selectedColumn,
    createEmpty,
  }: AggregateWindow = selection?.resultOptions?.aggregateWindow ||
  DEFAULT_AGGREGATE_WINDOW

  const handleToggleAggregateWindow = useCallback(() => {
    setSelection({
      resultOptions: {
        aggregateWindow: {
          ...JSON.parse(JSON.stringify(DEFAULT_AGGREGATE_WINDOW)),
          isOn: !selection?.resultOptions?.aggregateWindow?.isOn,
        },
      },
    })
  }, [selection.resultOptions.aggregateWindow, setSelection])

  const handleSelectColumn = useCallback(
    (column: string) => {
      setSelection({
        resultOptions: {
          aggregateWindow: {
            ...selection?.resultOptions?.aggregateWindow,
            column,
          },
        },
      })
    },
    [selection.resultOptions.aggregateWindow, setSelection]
  )

  const columnSelector = useMemo(() => {
    // TODO: what if the user wants to not have column?
    return (
      isOn && (
        <SearchableDropdown
          options={[
            'column1',
            'column2',
            'column3',
            'column4',
            'column5',
            'column6',
          ]} // TODO: get column from backend
          selectedOption={selectedColumn || 'Select column'}
          onSelect={handleSelectColumn}
          searchPlaceholder="Search columns"
          searchTerm={columnSearchTerm}
          onChangeSearchTerm={setColumnSearchTerm}
          emptyText="No columns found"
          buttonStatus={ComponentStatus.Default} // TODO: use toComponentStatus
          testID="aggregate-window--column--dropdown"
          buttonTestID="aggregate-window--column--dropdown-button"
          menuTestID="aggregate-window--column--dropdown-menu"
        />
      )
    )
  }, [isOn, selectedColumn, columnSearchTerm, handleSelectColumn])

  const handleSelectFunction = useCallback(
    (fn: string) => {
      setSelection({
        resultOptions: {
          aggregateWindow: {
            ...selection?.resultOptions?.aggregateWindow,
            fn,
          },
        },
      })
    },
    [selection.resultOptions.aggregateWindow, setSelection]
  )

  const functionSelector = useMemo(() => {
    return (
      isOn && (
        <SearchableDropdown
          options={FUNCTIONS.map(f => f.name)}
          selectedOption={selectedFunction || 'Select aggregate function'}
          onSelect={handleSelectFunction}
          searchPlaceholder="Search aggregate function"
          searchTerm={functionSearchTerm}
          onChangeSearchTerm={setFunctionSearchTerm}
          emptyText="No functions found"
          buttonStatus={ComponentStatus.Default} // TODO: use toComponentStatus
          testID="aggregate-window--function--dropdown"
          buttonTestID="aggregate-window--function--dropdown-button"
          menuTestID="aggregate-window--function--dropdown-menu"
        />
      )
    )
  }, [isOn, selectedFunction, functionSearchTerm, handleSelectFunction])

  const handleToggleAutoWindowPeriod = useCallback(() => {
    const isAutoWindowPeriod =
      !selection?.resultOptions?.aggregateWindow?.isAutoWindowPeriod
    setSelection({
      resultOptions: {
        aggregateWindow: {
          ...selection?.resultOptions?.aggregateWindow,
          isAutoWindowPeriod,
          every: '10s', // TODO: use duration type, any enum?
        },
      },
    })
  }, [selection.resultOptions.aggregateWindow, setSelection])

  const handleSetDuration = useCallback(
    (duration: string) => {
      setSelection({
        resultOptions: {
          aggregateWindow: {
            ...selection?.resultOptions?.aggregateWindow,
            every: duration,
          },
        },
      })
    },
    [selection.resultOptions.aggregateWindow, setSelection]
  )

  const windowPeriodForm = useMemo(() => {
    const durationInputStatus = isAutoWindowPeriod
      ? ComponentStatus.Disabled
      : ComponentStatus.Default

    const durationDisplay = isAutoWindowPeriod
      ? `(${AGG_WINDOW_AUTO}) ${duration}`
      : `${duration}`

    return (
      isOn && (
        <div>
          <SelectorTitle
            label="Window Period"
            tooltipContents={WINDOW_PERIOD_TOOLTIP}
          />
          <ToggleWithLabelTooltip
            label="Auto window period"
            active={isAutoWindowPeriod}
            onChange={handleToggleAutoWindowPeriod}
          />
          <DurationInput
            suggestions={DURATIONS}
            onSubmit={handleSetDuration}
            value={durationDisplay}
            submitInvalid={false}
            status={durationInputStatus}
          />
        </div>
      )
    )
  }, [
    isOn,
    isAutoWindowPeriod,
    duration,
    handleSetDuration,
    handleToggleAutoWindowPeriod,
  ])

  const handleToggleCreateEmpty = useCallback(() => {
    const createEmpty = !selection?.resultOptions?.aggregateWindow?.createEmpty
    setSelection({
      resultOptions: {
        aggregateWindow: {
          ...selection.resultOptions.aggregateWindow,
          createEmpty,
        },
      },
    })
  }, [selection.resultOptions.aggregateWindow, setSelection])

  const createEmptyToggle = useMemo(() => {
    return (
      isOn && (
        <ToggleWithLabelTooltip
          label="Fill missing values"
          active={createEmpty}
          onChange={handleToggleCreateEmpty}
        />
      )
    )
  }, [isOn, createEmpty, handleToggleCreateEmpty])

  return useMemo(() => {
    return (
      <div className="result-options--item">
        <ToggleWithLabelTooltip
          label="Aggregate"
          active={isOn}
          onChange={handleToggleAggregateWindow}
          tooltipContents={AGGREGATE_WINDOW_TOOLTIP}
        />
        {columnSelector}
        {functionSelector}
        {windowPeriodForm}
        {createEmptyToggle}
      </div>
    )
  }, [
    isOn,
    columnSelector,
    functionSelector,
    windowPeriodForm,
    createEmptyToggle,
    handleToggleAggregateWindow,
  ])
}

export {AggregateWindow}
