// Libraries
import React, {FunctionComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  SelectGroup,
  ButtonShape,
  ComponentStatus,
  ComponentSize,
} from '@influxdata/clockface'
import DurationInput from 'src/shared/components/DurationInput'

// Actions
import {
  setWindowPeriodSelectionMode,
  selectAggregateWindow,
} from 'src/timeMachine/actions/queryBuilderThunks'

// Utils
import {
  getActiveQuery,
  getWindowPeriodFromTimeRange,
  getIsInCheckOverlay,
} from 'src/timeMachine/selectors'

// Constants
import {
  DURATIONS,
  AGG_WINDOW_AUTO,
} from 'src/timeMachine/constants/queryBuilder'

// Types
import {AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const WindowPeriod: FunctionComponent<Props> = ({
  period,
  autoWindowPeriod,
  everyWindowPeriod,
  onSetWindowPeriodSelectionMode,
  onSelectAggregateWindow,
  isInCheckOverlay,
}) => {
  const isAutoWindowPeriod = isInCheckOverlay || period === AGG_WINDOW_AUTO

  let durationDisplay = period

  if (!period || isAutoWindowPeriod) {
    durationDisplay = AGG_WINDOW_AUTO
    if (autoWindowPeriod) {
      durationDisplay = `${AGG_WINDOW_AUTO} (${autoWindowPeriod})`
      if (isInCheckOverlay) {
        durationDisplay = `${AGG_WINDOW_AUTO} (${everyWindowPeriod})`
      }
    }
  }

  const durationInputStatus = isAutoWindowPeriod
    ? ComponentStatus.Disabled
    : ComponentStatus.Default

  if (isInCheckOverlay) {
    return (
      <DurationInput
        onSubmit={onSelectAggregateWindow}
        value={durationDisplay}
        suggestions={DURATIONS}
        submitInvalid={false}
        status={durationInputStatus}
      />
    )
  }

  return (
    <>
      <SelectGroup
        shape={ButtonShape.StretchToFit}
        size={ComponentSize.ExtraSmall}
      >
        <SelectGroup.Option
          name="custom"
          id="custom-window-period"
          testID="custom-window-period"
          active={!isAutoWindowPeriod}
          value="custom"
          onClick={onSetWindowPeriodSelectionMode}
          titleText="Custom"
        >
          Custom
        </SelectGroup.Option>
        <SelectGroup.Option
          name="auto"
          id="auto-window-period"
          testID="auto-window-period"
          active={isAutoWindowPeriod}
          value="auto"
          onClick={onSetWindowPeriodSelectionMode}
          titleText="Auto"
        >
          Auto
        </SelectGroup.Option>
      </SelectGroup>
      <DurationInput
        onSubmit={onSelectAggregateWindow}
        value={durationDisplay}
        suggestions={DURATIONS}
        submitInvalid={false}
        status={durationInputStatus}
      />
    </>
  )
}

const mstp = (state: AppState) => {
  const {builderConfig} = getActiveQuery(state)
  const everyWindowPeriod = state.alertBuilder.every
  return {
    period: builderConfig?.aggregateWindow?.period ?? '',
    isInCheckOverlay: getIsInCheckOverlay(state),
    autoWindowPeriod: getWindowPeriodFromTimeRange(state),
    everyWindowPeriod,
  }
}

const mdtp = {
  onSetWindowPeriodSelectionMode: setWindowPeriodSelectionMode,
  onSelectAggregateWindow: selectAggregateWindow,
}

const connector = connect(mstp, mdtp)

export default connector(WindowPeriod)
