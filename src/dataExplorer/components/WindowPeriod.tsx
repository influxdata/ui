import React, {FC, useCallback, useContext, useMemo} from 'react'

// Components
import {ToggleWithLabelTooltip} from 'src/dataExplorer/components/ToggleWithLabelTooltip'
import SelectorTitle from 'src/dataExplorer/components/SelectorTitle'
import DurationInput from 'src/shared/components/DurationInput'

// Contexts
import {
  AggregateWindow,
  DEFAULT_AGGREGATE_WINDOW,
  DEFAULT_WINDOW_PERIOD,
  PersistenceContext,
} from 'src/dataExplorer/context/persistence'

// Constants
import {
  AGG_WINDOW_AUTO,
  DURATIONS,
} from 'src/timeMachine/constants/queryBuilder'

// Utilities
import {ComponentStatus} from '@influxdata/clockface'

// Styles
import './Sidebar.scss'

const WINDOW_PERIOD_TOOLTIP = `test`

export const WindowPeriod: FC = () => {
  const {selection, setSelection} = useContext(PersistenceContext)
  const {
    isOn,
    isAutoWindowPeriod,
    every: duration,
  }: AggregateWindow = selection.resultOptions?.aggregateWindow ||
  DEFAULT_AGGREGATE_WINDOW

  const handleToggleAutoWindowPeriod = useCallback(() => {
    const isAutoWindowPeriod =
      !selection.resultOptions?.aggregateWindow?.isAutoWindowPeriod
    setSelection({
      resultOptions: {
        aggregateWindow: {
          ...selection.resultOptions?.aggregateWindow,
          isAutoWindowPeriod,
          every: DEFAULT_WINDOW_PERIOD,
        },
      },
    })
  }, [selection.resultOptions?.aggregateWindow, setSelection])

  const handleSetDuration = useCallback(
    (duration: string) => {
      setSelection({
        resultOptions: {
          aggregateWindow: {
            ...selection.resultOptions?.aggregateWindow,
            every: duration,
          },
        },
      })
    },
    [selection.resultOptions?.aggregateWindow, setSelection]
  )

  return useMemo(() => {
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
}
