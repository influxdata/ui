// Libraries
import React, {FC, useContext, useCallback, useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'

// Utils
import {resetQueryCache} from 'src/shared/apis/queryCache'

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
import {AutoRefreshStatus, AppState, CustomTimeRange} from 'src/types'

// Actions
import {
  setAutoRefreshInterval,
  setAutoRefreshStatus,
} from 'src/shared/actions/autoRefresh'

const INACTIVITY_ARRAY = [...Array(61).keys()].map(num => num.toString())
INACTIVITY_ARRAY[0] = 'None'
export const AutoRefreshOverlay: FC = () => {
  // For now, these details can be held in state - these should be moved to redux if/when this is implemented with corresponding backend changes
  const [refreshState, setRefreshState] = useState({
    duration: '',
    inactivityTimeout: 'None',
    inactivityTimeoutCategory: 'Minutes',
    timeRange: {
      lower: new Date().toISOString(),
      upper: new Date().toISOString(),
      type: 'custom',
    } as CustomTimeRange,
  })

  const {onClose} = useContext(OverlayContext)
  const dispatch = useDispatch()
  const {currentDashboardId, autoRefresh} = useSelector((state: AppState) => ({
    autoRefresh: state.autoRefresh[state.currentDashboard.id],
    currentDashboardId: state.currentDashboard.id,
  }))

  const handleChooseAutoRefresh = (milliseconds: number) => {
    dispatch(setAutoRefreshInterval(currentDashboardId, milliseconds))

    if (milliseconds === 0) {
      dispatch(
        setAutoRefreshStatus(currentDashboardId, AutoRefreshStatus.Paused)
      )
      return
    }

    dispatch(setAutoRefreshStatus(currentDashboardId, AutoRefreshStatus.Active))
  }

  const resetCacheAndRefresh = useCallback((): void => {
    // We want to invalidate the existing cache when a user manually refreshes the dashboard
    // resetQueryCache()
    // onManualRefresh()
    console.log('refresh yo')
  }, [])

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
              onManualRefresh={resetCacheAndRefresh}
              selected={autoRefresh}
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
            <span>Between: </span>
            <TimeRangeDropdown
              timeRange={refreshState.timeRange}
              onSetTimeRange={x =>
                setRefreshState(prev => ({...prev, timeRange: x}))
              }
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
                  refreshState.inactivityTimeout !== 'None' ? '1fr 1fr' : '1fr'
                }`,
              }}
            >
              <SelectDropdown
                options={INACTIVITY_ARRAY}
                selectedOption={refreshState.inactivityTimeout}
                onSelect={x =>
                  setRefreshState(prev => ({
                    ...prev,
                    inactivityTimeout: x,
                  }))
                }
                buttonColor={ComponentColor.Default}
              />
              {refreshState.inactivityTimeout !== 'None' && (
                <SelectDropdown
                  style={{padding: '0 0 0 10px', flex: 1}}
                  options={['Minutes', 'Hours', 'Days']}
                  selectedOption={refreshState.inactivityTimeoutCategory}
                  onSelect={x =>
                    setRefreshState(prev => ({
                      ...prev,
                      inactivityTimeoutCategory: x,
                    }))
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
              onClick={() => console.log('Confirm')}
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
