// Libraries
import React, {FC, useContext, useCallback} from 'react'

// Components
import {
  Overlay,
  Grid,
  Button,
  ComponentColor,
  SelectDropdown,
} from '@influxdata/clockface'
import {OverlayContext} from 'src/overlays/components/OverlayController'
import AutoRefreshDropdown from 'src/shared/components/dropdown_auto_refresh/AutoRefreshDropdown'
import TimeRangeDropdown from 'src/shared/components/DeleteDataForm/TimeRangeDropdown'

// Types
import {CustomTimeRange, AutoRefreshStatus} from 'src/types'

// Context
import AutoRefreshContextProvider, {
  AutoRefreshContext,
} from 'src/dashboards/components/RefreshContext'

import './AutoRefresh.scss'

const INACTIVITY_ARRAY = [...Array(25).keys()].map(num => num.toString())
INACTIVITY_ARRAY[0] = 'None'

export const AutoRefreshForm: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const {state, dispatch: setRefreshContext, activateAutoRefresh} = useContext(
    AutoRefreshContext
  )

  const handleChooseAutoRefresh = milliseconds => {
    const status =
      milliseconds === 0 ? AutoRefreshStatus.Paused : AutoRefreshStatus.Active
    setRefreshContext({
      type: 'SET_REFRESH_MILLISECONDS',
      refreshMilliseconds: {status, interval: milliseconds},
    })
  }

  // Because we are not using the manual refresh in the dropdown, this function is a no-op
  const noop = useCallback((): void => {}, [])
  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header title="Configure Auto Refresh" onDismiss={onClose} />
      <Grid>
        <Grid.Column className="refresh-form-column">
          <div className="refresh-form-container">
            <span>Select Refresh Frequency: </span>
            <AutoRefreshDropdown
              onChoose={handleChooseAutoRefresh}
              onManualRefresh={noop}
              selected={state.refreshMilliseconds}
              showManualRefresh={false}
            />
          </div>
          <div className="refresh-form-container">
            <span className="refresh-form-container-child">Until: </span>
            <TimeRangeDropdown
              timeRange={state.duration}
              onSetTimeRange={(timeRange: CustomTimeRange) =>
                setRefreshContext({type: 'SET_DURATION', duration: timeRange})
              }
              singleDirection="upper"
              className="refresh-form-container-child"
            />
          </div>
          <div className="refresh-form-container">
            <span className="refresh-form-container-child">
              Inactivity Timeout:{' '}
            </span>
            <div
              className={
                state.inactivityTimeout === 'None'
                  ? 'refresh-form-container-child inactive'
                  : 'refresh-form-container-child active'
              }
            >
              <SelectDropdown
                options={INACTIVITY_ARRAY}
                selectedOption={state.inactivityTimeout}
                onSelect={(timeout: string) =>
                  setRefreshContext({
                    type: 'SET_INACTIVITY_TIMEOUT',
                    inactivityTimeout: timeout,
                  })
                }
                buttonColor={ComponentColor.Default}
              />
              {state.inactivityTimeout !== 'None' && (
                <SelectDropdown
                  className="refresh-form-timeout-dropdown"
                  options={['Hours', 'Days']}
                  selectedOption={state.inactivityTimeoutCategory}
                  onSelect={(timeoutCategory: string) =>
                    setRefreshContext({
                      type: 'SET_INACTIVITY_TIMEOUT_CATEGORY',
                      inactivityTimeoutCategory: timeoutCategory,
                    })
                  }
                  buttonColor={ComponentColor.Default}
                />
              )}
            </div>
          </div>
          <div className="refresh-form-buttons">
            <Button
              onClick={onClose}
              text="Cancel"
              color={ComponentColor.Default}
              className="refresh-form-cancel-button"
            />
            <Button
              onClick={() => {
                activateAutoRefresh()
                onClose()
              }}
              text="Enable"
              color={ComponentColor.Success}
              className="refresh-form-activate-button"
            />
          </div>
        </Grid.Column>
      </Grid>
    </Overlay.Container>
  )
}
export const AutoRefreshOverlay: FC = () => {
  return (
    <AutoRefreshContextProvider>
      <AutoRefreshForm />
    </AutoRefreshContextProvider>
  )
}
