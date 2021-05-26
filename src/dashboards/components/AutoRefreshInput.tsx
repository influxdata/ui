import React, {FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import DurationInput from 'src/shared/components/DurationInput'
import {ButtonGroup} from '@influxdata/clockface'
// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Types
import {AutoRefreshStatus} from 'src/types'

// Actions
import {
  setAutoRefreshInterval,
  setAutoRefreshStatus,
  resetDashboardAutoRefresh,
  setAutoRefreshInputValue,
} from 'src/shared/actions/autoRefresh'

// Selectors
import {getCurrentDashboardId} from 'src/dashboards/selectors'
import {getAutoRefreshForDashboard} from 'src/shared/selectors/autoRefresh'

// Metrics
import {event} from 'src/cloud/utils/reporting'

const SUGGESTIONS = [
  'None',
  '10s',
  '15s',
  '30s',
  '1m',
  '5m',
  '10m',
  '30m',
  '1h',
]

const AutoRefreshInput: FC = () => {
  const dispatch = useDispatch()
  const currentDashboardId = useSelector(getCurrentDashboardId)

  const autoRefresh = useSelector(getAutoRefreshForDashboard)

  const handleChooseAutoRefresh = (selection: string) => {
    if (selection === 'None') {
      dispatch(resetDashboardAutoRefresh(currentDashboardId))
      event('dashboards.autorefresh.autorefreshinput.intervalchange', {
        interval: 0,
      })
      return
    }
    const unit = selection.charAt(selection.length - 1)
    let multiplier
    if (unit === 's') {
      multiplier = 1
    } else if (unit === 'm') {
      multiplier = 60
    } else if (unit === 'h') {
      multiplier = 3600
    }

    if (unit === 's' || unit === 'm' || unit === 'h') {
      const calculatedMilliseconds =
        Number(selection.slice(0, selection.length - 1)) * multiplier * 1000
      dispatch(
        setAutoRefreshInterval(currentDashboardId, calculatedMilliseconds)
      )
      dispatch(
        setAutoRefreshStatus(currentDashboardId, AutoRefreshStatus.Active)
      )
      dispatch(setAutoRefreshInputValue(currentDashboardId, selection))
      event('dashboards.autorefresh.autorefreshinput.intervalchange', {
        interval: autoRefresh?.refreshInputValue,
      })
    }
  }

  const isValidInput = (input: string) => {
    const durationRegExp = /^(([0-9]+)(h|s|m))+$/g

    return input === 'None' || !!input.match(durationRegExp)
  }

  return (
    <ButtonGroup>
      <DurationInput
        submitInvalid={false}
        value={autoRefresh?.refreshInputValue ?? 'None'}
        onSubmit={handleChooseAutoRefresh}
        suggestions={SUGGESTIONS}
        customClass="refresh-input"
        validFunction={isValidInput}
        dividerText="Customize"
        dividerOnClick={() => {
          dispatch(
            showOverlay('toggle-auto-refresh', null, () =>
              dispatch(dismissOverlay())
            )
          )
        }}
        testID="auto-refresh-input"
      />
    </ButtonGroup>
  )
}

export default AutoRefreshInput
