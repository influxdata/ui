import React, {FC, useState} from 'react'
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
} from 'src/shared/actions/autoRefresh'

// Selectors
import {getCurrentDashboardId} from 'src/dashboards/selectors'
import {getAutoRefreshForDashboard} from 'src/shared/selectors/autoRefresh'

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
  const [inputValue, setInputValue] = useState('None')
  const dispatch = useDispatch()
  const currentDashboardId = useSelector(getCurrentDashboardId)

  const {interval} = useSelector(getAutoRefreshForDashboard)
  const handleChooseAutoRefresh = (selection: string) => {
    if (selection === 'None') {
      setInputValue('None')
      dispatch(resetDashboardAutoRefresh(currentDashboardId))
      return
    }
    const unit = selection[selection.length - 1]
    let multiplier
    if (unit === 's') {
      multiplier = 1
    } else if (unit === 'm') {
      multiplier = 60
    } else if (unit === 'h') {
      multiplier = 3600
    }

    const calculatedMilliseconds =
      Number(selection.slice(0, selection.length - 1)) * multiplier * 1000

    if (unit === 's' || unit === 'm' || unit === 'h') {
      setInputValue(selection)
      dispatch(
        setAutoRefreshInterval(currentDashboardId, calculatedMilliseconds)
      )
      dispatch(
        setAutoRefreshStatus(currentDashboardId, AutoRefreshStatus.Active)
      )
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
        value={interval === 0 ? 'None' : inputValue}
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
      />
    </ButtonGroup>
  )
}

export default AutoRefreshInput
