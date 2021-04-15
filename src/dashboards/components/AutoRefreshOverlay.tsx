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

  const noop = useCallback((): void => {}, [])
  return (
    <Overlay.Container maxWidth={500}>
      <Overlay.Header title="Auto Refresh Menu" onDismiss={onClose} />
      <Grid>
        <Grid.Column style={{display: 'grid'}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 50px',
            }}
          >
            <span>Select Refresh Frequency: </span>
            <AutoRefreshDropdown
              onChoose={handleChooseAutoRefresh}
              onManualRefresh={noop}
              selected={state.refreshMilliseconds}
              showManualRefresh={false}
            />
          </div>
          <div
            style={{
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: '1fr 1fr',
              padding: '10px 50px',
            }}
          >
            <span>Until: </span>
            <TimeRangeDropdown
              timeRange={state.duration}
              onSetTimeRange={(timeRange: CustomTimeRange) =>
                setRefreshContext({type: 'SET_DURATION', duration: timeRange})
              }
              singleDirection="upper"
            />
          </div>
          <div
            style={{
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: '1fr 1fr',
              padding: '10px 50px',
            }}
          >
            <span style={{flex: 1}}>Inactivity Timeout: </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `${
                  state.inactivityTimeout !== 'None' ? '1fr 1fr' : '1fr'
                }`,
              }}
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
                  style={{padding: '0 0 0 10px', flex: 1}}
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto auto',
              gridGap: '10px',
              padding: '30px 10px 15px 10px',
            }}
          >
            <Button
              onClick={onClose}
              text="Cancel"
              color={ComponentColor.Default}
              style={{width: '60%', justifySelf: 'end'}}
            />
            <Button
              onClick={() => {
                activateAutoRefresh()
                onClose()
              }}
              text="Enable"
              color={ComponentColor.Success}
              style={{width: '60%'}}
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
