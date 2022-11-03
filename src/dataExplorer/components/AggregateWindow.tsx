import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import SearchableDropdown from 'src/shared/components/SearchableDropdown'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import DurationInput from 'src/shared/components/DurationInput'
import {ColumnSelector} from 'src/dataExplorer/components/ColumnSelector'

// Contexts
import {
  AggregateWindow,
  DEFAULT_AGGREGATE_WINDOW,
  DEFAULT_WINDOW_PERIOD,
  PersistanceContext,
} from 'src/dataExplorer/context/persistance'

// Constants
import {
  AGG_WINDOW_AUTO,
  DURATIONS,
  AGGREGATE_FUNCTIONS,
} from 'src/timeMachine/constants/queryBuilder'

// Utilities
import {ComponentStatus} from '@influxdata/clockface'

// Styles
import './Sidebar.scss'

const AGGREGATE_WINDOW_TOOLTIP = `test`
const WINDOW_PERIOD_TOOLTIP = `test`

const AggregateWindow: FC = () => {
  // Contexts
  const {selection, setSelection} = useContext(PersistanceContext)

  // States
  const [functionSearchTerm, setFunctionSearchTerm] = useState('')
  const {
    isOn,
    isAutoWindowPeriod,
    every: duration,
    fn: selectedFunction,
    createEmpty,
  }: AggregateWindow = selection?.resultOptions?.aggregateWindow ||
  DEFAULT_AGGREGATE_WINDOW

  useEffect(() => {
    setSelection({
      resultOptions: {
        aggregateWindow: JSON.parse(JSON.stringify(DEFAULT_AGGREGATE_WINDOW)),
      },
    })

    setFunctionSearchTerm('')
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
    if (!toBeOn) {
      setFunctionSearchTerm('')
    }
  }, [selection.resultOptions.aggregateWindow, setSelection])

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
      setFunctionSearchTerm('')
    },
    [selection.resultOptions.aggregateWindow, setSelection]
  )

  const functionSelector = useMemo(() => {
    return (
      isOn && (
        <div className="result-options--item--row">
          <SearchableDropdown
            options={AGGREGATE_FUNCTIONS.map(f => f.name)}
            selectedOption={selectedFunction || 'Select aggregate function'}
            onSelect={handleSelectFunction}
            searchPlaceholder="Search aggregate function"
            searchTerm={functionSearchTerm}
            onChangeSearchTerm={setFunctionSearchTerm}
            emptyText="No functions found"
            buttonStatus={ComponentStatus.Default}
            testID="aggregate-window--function--dropdown"
            buttonTestID="aggregate-window--function--dropdown-button"
            menuTestID="aggregate-window--function--dropdown-menu"
          />
        </div>
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
          every: DEFAULT_WINDOW_PERIOD,
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
          <div className="aggregate-window-period--title">
            <SelectorTitle
              label="Window Period"
              tooltipContents={WINDOW_PERIOD_TOOLTIP}
            />
          </div>
          <ToggleWithLabelTooltip
            label="Auto window period"
            active={isAutoWindowPeriod}
            onChange={handleToggleAutoWindowPeriod}
          />
          <div className="result-options--item--row">
            <DurationInput
              suggestions={DURATIONS}
              onSubmit={handleSetDuration}
              value={durationDisplay}
              submitInvalid={false}
              status={durationInputStatus}
            />
          </div>
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
      <div>
        <ToggleWithLabelTooltip
          label="Aggregate"
          active={isOn}
          onChange={handleToggleAggregateWindow}
          tooltipContents={AGGREGATE_WINDOW_TOOLTIP}
          disabled={!selection.measurement}
        />
        <ColumnSelector />
        {functionSelector}
        {windowPeriodForm}
        {createEmptyToggle}
      </div>
    )
  }, [
    isOn,
    selection.measurement,
    functionSelector,
    windowPeriodForm,
    createEmptyToggle,
    handleToggleAggregateWindow,
  ])
}

export {AggregateWindow}
