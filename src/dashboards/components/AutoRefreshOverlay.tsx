// Libraries
import React, {FC, useContext} from 'react'

// Components
import {
  Overlay,
  Button,
  ComponentColor,
  ComponentStatus,
  SelectGroup,
  ButtonShape,
  FlexBox,
  FlexDirection,
  AlignItems,
  Dropdown,
} from '@influxdata/clockface'
import {OverlayContext} from 'src/overlays/components/OverlayController'
import TimeRangeDropdown from 'src/shared/components/DeleteDataForm/TimeRangeDropdown'
import DurationInput from 'src/shared/components/DurationInput'
import AutoRefreshInput from 'src/dashboards/components/AutoRefreshInput'

// Types
import {CustomTimeRange, TimeRangeDirection} from 'src/types'

// Context
import AutoRefreshContextProvider, {
  AutoRefreshContext,
} from 'src/dashboards/components/RefreshContext'

import './AutoRefresh.scss'

// Metrics
import {event} from 'src/cloud/utils/reporting'

const selectInactivityArray = (unit: string) => {
  let selectionAmount = 0
  switch (unit) {
    case 'Minutes':
      selectionAmount = 60
      break
    case 'Hours':
      selectionAmount = 25
      break
    case 'Days':
      selectionAmount = 30
      break
  }
  // This array creates an array of [0...24] for the hours selection, [0...59] for the minutes, and [0...30] for the days
  const INACTIVITY_ARRAY = [...Array(selectionAmount).keys()].map(num =>
    num.toString()
  )
  // This line replaces the 0 (the first value) with 'Never' for the dropdown
  INACTIVITY_ARRAY[0] = 'Never'

  return INACTIVITY_ARRAY
}

const AutoRefreshForm: FC = () => {
  const {onClose} = useContext(OverlayContext)
  const {
    state,
    dispatch: setRefreshContext,
    setAutoRefreshSettings,
  } = useContext(AutoRefreshContext)

  const handleCancel = () => {
    event('dashboards.autorefresh.autorefreshoverlay.cancelcustom')
    onClose()
  }

  const setRefreshState = () => {
    setRefreshContext({
      type: 'SET_INFINITE_DURATION',
      infiniteDuration: !state.infiniteDuration,
    })
  }

  const refreshOptions = [
    {
      id: 'indefinite-auto-refresh',
      title: 'Indefinite',
      active: state.infiniteDuration,
    },
    {
      id: 'custom-auto-refresh',
      title: 'Custom',
      active: !state.infiniteDuration,
    },
  ]

  return (
    <Overlay.Container maxWidth={500} testID="auto-refresh-overlay">
      <Overlay.Header
        className="refresh-form-header"
        title="Configure Auto Refresh"
        onDismiss={handleCancel}
      />
      <FlexBox
        className="refresh-form-body"
        direction={FlexDirection.Column}
        alignItems={AlignItems.Stretch}
      >
        <FlexBox.Child>
          <div className="refresh-form-container-title">
            Refresh Dashboard Until
          </div>
          <SelectGroup shape={ButtonShape.StretchToFit}>
            {refreshOptions.map(option => (
              <SelectGroup.Option
                key={option.id}
                id={option.id}
                name="refreshOptions"
                active={option.active}
                value={option.id}
                titleText={option.title}
                onClick={setRefreshState}
              >
                {option.title}
              </SelectGroup.Option>
            ))}
          </SelectGroup>
          {!state.infiniteDuration && (
            <div data-testid="timerange-popover-button">
              <TimeRangeDropdown
                timeRange={state.duration}
                onSetTimeRange={(timeRange: CustomTimeRange) => {
                  setRefreshContext({
                    type: 'SET_DURATION',
                    duration: timeRange,
                  })
                  setRefreshContext({
                    type: 'SET_INFINITE_DURATION',
                    infiniteDuration: false,
                  })
                }}
                singleDirection={TimeRangeDirection.Upper}
                className="timerange-dropdown"
              />
            </div>
          )}
        </FlexBox.Child>
        <FlexBox.Child className="refresh-form-container">
          <div className="refresh-form-container-title">Refresh Interval</div>
          <div className="refresh-form-container-description">
            How often your dashboard will refresh
          </div>
          <AutoRefreshInput />
        </FlexBox.Child>
        <FlexBox.Child className="refresh-form-container">
          <div className="refresh-form-container-title">Inactivity Timeout</div>
          <div className="refresh-form-container-description">
            When your dashboard refresh will timeout
          </div>
          <div className="refresh-inactivity-timeout-container">
            <div className="refresh-inactivity-timeout-num">
              <DurationInput
                suggestions={selectInactivityArray(
                  state.inactivityTimeoutCategory
                )}
                onSubmit={(timeout: string) =>
                  setRefreshContext({
                    type: 'SET_INACTIVITY_TIMEOUT',
                    inactivityTimeout: timeout,
                  })
                }
                value={state.inactivityTimeout}
                validFunction={() => true} // TODO: write a valid function
                // TODO: do we want submitInvalid?
                menuMaxHeight={150}
                testID="inactivity-timeout-dropdown"
              />
            </div>
            {state.inactivityTimeout !== 'Never' && (
              <Dropdown
                className="refresh-inactivity-timeout-unit"
                menu={onCollapse => (
                  <Dropdown.Menu onCollapse={onCollapse}>
                    {['Minutes', 'Hours', 'Days'].map(option => (
                      <Dropdown.Item
                        key={option}
                        onClick={() =>
                          setRefreshContext({
                            type: 'SET_INACTIVITY_TIMEOUT_CATEGORY',
                            inactivityTimeoutCategory: option,
                          })
                        }
                        selected={state.inactivityTimeoutCategory === option}
                      >
                        {option}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                )}
                button={(active, onClick) => (
                  <Dropdown.Button active={active} onClick={onClick}>
                    {state.inactivityTimeoutCategory}
                  </Dropdown.Button>
                )}
                testID="inactivity-timeout-category-dropdown"
              />
            )}
          </div>
        </FlexBox.Child>
        <div className="refresh-form-buttons">
          <Button
            onClick={handleCancel}
            text="Cancel"
            color={ComponentColor.Tertiary}
            className="refresh-form-cancel-button"
            testID="refresh-form-cancel-button"
          />
          <Button
            onClick={() => {
              setAutoRefreshSettings()
              onClose()
              event('dashboards.autorefresh.autorefreshoverlay.confirmcustom', {
                customAutoRefreshState: JSON.stringify(state),
              })
            }}
            text="Confirm"
            color={ComponentColor.Primary}
            className="refresh-form-activate-button"
            testID="refresh-form-activate-button"
            status={
              state.refreshMilliseconds.interval === 0
                ? ComponentStatus.Disabled
                : ComponentStatus.Default
            }
          />
        </div>
      </FlexBox>
    </Overlay.Container>
  )
}
const AutoRefreshOverlay: FC = () => {
  return (
    <AutoRefreshContextProvider>
      <AutoRefreshForm />
    </AutoRefreshContextProvider>
  )
}

export default AutoRefreshOverlay
