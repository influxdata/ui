import React, {FC, useCallback, useContext, useEffect, useMemo} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import DurationInput from 'src/shared/components/DurationInput'
import {ColumnSelector} from 'src/dataExplorer/components/ColumnSelector'
import {AggregateFunctionsSelector} from 'src/dataExplorer/components/AggregateFunctionSelector'

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

  const {
    isOn,
    isAutoWindowPeriod,
    every: duration,
    createEmpty,
  }: AggregateWindow = selection?.resultOptions?.aggregateWindow ||
  DEFAULT_AGGREGATE_WINDOW

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
        <AggregateFunctionsSelector />
        {windowPeriodForm}
        {createEmptyToggle}
      </div>
    )
  }, [
    isOn,
    selection.measurement,
    windowPeriodForm,
    createEmptyToggle,
    handleToggleAggregateWindow,
  ])
}

export {AggregateWindow}
