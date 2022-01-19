import React, {FC, useContext} from 'react'

// Components
import DurationInput from 'src/shared/components/DurationInput'
import {
  ButtonGroup,
  TypeAheadDropDown,
  SelectableItem,
  ComponentStatus,
} from '@influxdata/clockface'

// Types
import {AutoRefreshStatus} from 'src/types'

// Metrics
import {event} from 'src/cloud/utils/reporting'

// Context
import {AutoRefreshContext} from 'src/dashboards/components/RefreshContext'
const SUGGESTIONS = [
  'Paused',
  '10s',
  '15s',
  '30s',
  '1m',
  '5m',
  '10m',
  '30m',
  '1h',
]

const PAUSED: SelectableItem = {id: '0', name: 'Paused'}

const SUGGESTION_ITEMS: SelectableItem[] = [
  PAUSED,
  {id: '10', name: '10s'},
  {id: '20', name: '15s'},
  {id: '30', name: '30s'},
  // {id: '40', name: '60s'}, // TODO: remove this one bc it was not in the original suggestion array
  {id: '50', name: '1m'},
  {id: '60', name: '5m'},
  {id: '70', name: '10m'},
  {id: '80', name: '30m'},
  {id: '90', name: '1h'},
]

const AutoRefreshInput: FC = () => {
  const {state, dispatch: setRefreshContext} = useContext(AutoRefreshContext)

  const handleChooseAutoRefresh = (selection: string) => {
    if (selection === 'Paused') {
      setRefreshContext({
        type: 'SET_REFRESH_MILLISECONDS',
        refreshMilliseconds: {
          interval: 0,
          status: AutoRefreshStatus.Paused,
          label: 'Paused',
        },
      })
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

      setRefreshContext({
        type: 'SET_REFRESH_MILLISECONDS',
        refreshMilliseconds: {
          interval: calculatedMilliseconds,
          status: AutoRefreshStatus.Active,
          label: selection,
        },
      })
      event('dashboards.autorefresh.autorefreshinput.intervalchange', {
        interval: calculatedMilliseconds,
      })
    }
  }

  const handleSelectAutoRefresh = (selection: SelectableItem) => {
    if (selection === null || selection.name === PAUSED.name) {
      setRefreshContext({
        type: 'SET_REFRESH_MILLISECONDS',
        refreshMilliseconds: {
          interval: 0,
          status: AutoRefreshStatus.Paused,
          label: PAUSED.name,
          selection,
        },
      })
      event('dashboards.autorefresh.autorefreshinput.intervalchange', {
        interval: 0,
      })
      return
    }
    const unit = selection.name.charAt(selection.name.length - 1)
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
        Number(selection.name.slice(0, selection.name.length - 1)) *
        multiplier *
        1000

      setRefreshContext({
        type: 'SET_REFRESH_MILLISECONDS',
        refreshMilliseconds: {
          interval: calculatedMilliseconds,
          status: AutoRefreshStatus.Active,
          label: selection.name,
          selection,
        },
      })
      event('dashboards.autorefresh.autorefreshinput.intervalchange', {
        interval: calculatedMilliseconds,
      })
    }
  }

  const isValidInput = (input: string) => {
    const durationRegExp = /^(([0-9]+)(h|s|m))+$/g

    return input === PAUSED.name || !!input.match(durationRegExp)
  }

  const selectedOption = SUGGESTION_ITEMS.find(
    d => d.name === state.refreshMilliseconds.label
  )

  return (
    <>
      <ButtonGroup>
        <DurationInput
          submitInvalid={false}
          value={state.refreshMilliseconds?.label ?? 'Paused'}
          onSubmit={handleChooseAutoRefresh}
          suggestions={SUGGESTIONS}
          customClass="refresh-input"
          validFunction={isValidInput}
          testID="auto-refresh-input"
          // TODO: remove this component
        />
      </ButtonGroup>
      <div className="refresh-input">
        <TypeAheadDropDown
          items={SUGGESTION_ITEMS}
          onSelect={handleSelectAutoRefresh}
          testID="auto-refresh-input"
          selectedOption={selectedOption}
          sortNames={false}
          status={
            state.refreshMilliseconds?.selection === null
              ? ComponentStatus.Error
              : ComponentStatus.Default
          }
          // TODO:
          // may rewrite cypress test
          // check where the default value 60s was set, it is not in the SUGGESTION_ITEMS
        />
      </div>
    </>
  )
}

export default AutoRefreshInput
