// Libraries
import React, {FC, useCallback, useContext, useState} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {
  Overlay,
  Button,
  ComponentColor,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  AlignItems,
  SelectGroup,
  ButtonShape,
  Dropdown,
} from '@influxdata/clockface'
import DurationInput from 'src/shared/components/DurationInput'
import {OverlayContext} from 'src/overlays/components/OverlayController'
import TimeRangeDropdown from 'src/shared/components/DeleteDataForm/TimeRangeDropdown'
import AutoRefreshInput from 'src/dashboards/components/AutoRefreshInput'

// Types
import {AutoRefreshStatus, CustomTimeRange, TimeRangeDirection} from 'src/types'

// Context
import {addDurationToDate} from 'src/shared/utils/dateTimeUtils'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {
  setAutoRefreshDuration,
  setInactivityTimeout as setInactivityTimeoutAction,
  setAutoRefreshInterval,
  setAutoRefreshStatus,
} from 'src/shared/actions/autoRefresh'

import './AutoRefresh.scss'

// Metrics
import {event} from 'src/cloud/utils/reporting'
import {PROJECT_NAME} from 'src/flows'

enum TIMEOUT_CATEGORY {
  Minutes = 'Minutes',
  Hours = 'Hours',
  Days = 'Days',
}

const MAX_MINUTE = 60
const MAX_HOUR = 25
const MAX_DAY = 30

const jumpAheadTime = () => {
  const newTime = addDurationToDate(new Date(), 1, 'h')

  const formatter = createDateTimeFormatter('YYYY-MM-DD HH:mm:ss')
  return formatter.format(newTime)
}

const calculateTimeout = (timeout: string, timeoutUnit: string) => {
  const timeoutNumber = parseInt(timeout, 10)
  const startTime = new Date()
  const endTime = addDurationToDate(
    startTime,
    timeoutNumber,
    timeoutUnit[0].toLowerCase()
  )
  const cutoff = endTime.getTime() - startTime.getTime()

  return cutoff
}

const selectInactivityArray = (unit: string) => {
  let selectionAmount = 0
  switch (unit) {
    case TIMEOUT_CATEGORY.Minutes:
      selectionAmount = 60
      break
    case TIMEOUT_CATEGORY.Hours:
      selectionAmount = 25
      break
    case TIMEOUT_CATEGORY.Days:
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
const AutoRefreshOverlay: FC = () => {
  const {onClose, params} = useContext(OverlayContext)
  const dispatch = useDispatch()

  const [refreshMilliseconds, setRefreshMilliseconds] = useState({
    interval: 60000,
    status: AutoRefreshStatus.Active,
    label: '60s',
  })
  const [duration, setDuration] = useState({
    lower: new Date().toISOString(),
    upper: jumpAheadTime(),
    type: 'custom',
  } as CustomTimeRange)
  const [infiniteDuration, setInfiniteDuration] = useState(false)
  const [inactivityTimeout, setInactivityTimeout] = useState('1')
  const [inactivityTimeoutCategory, setInactivityTimeoutCategory] =
    useState('Hours')

  const refreshOptions = [
    {
      id: 'indefinite-auto-refresh',
      title: 'Indefinite',
      isInfinite: infiniteDuration,
    },
    {
      id: 'custom-auto-refresh',
      title: 'Custom',
      isInfinite: !infiniteDuration,
    },
  ]

  const isValidTimeoutInput = (input: string) => {
    if (input === 'Never') {
      return true
    }
    if (+input <= 0) {
      return false
    }
    const unit = inactivityTimeoutCategory
    let isValid = false
    switch (unit) {
      case TIMEOUT_CATEGORY.Minutes:
        isValid = +input < MAX_MINUTE
        break
      case TIMEOUT_CATEGORY.Hours:
        isValid = +input < MAX_HOUR
        break
      case TIMEOUT_CATEGORY.Days:
        isValid = +input < MAX_DAY
        break
    }
    return isValid
  }

  const handleRefreshMilliseconds = useCallback(
    (interval: {
      interval: number
      status: AutoRefreshStatus
      label: string
    }) => {
      setRefreshMilliseconds(interval)
    },
    []
  )

  const handleConfirm = useCallback(() => {
    try {
      dispatch(
        setAutoRefreshInterval(
          params.id,
          refreshMilliseconds.interval,
          refreshMilliseconds.label
        )
      )

      if (refreshMilliseconds.interval === 0) {
        dispatch(setAutoRefreshStatus(params.id, AutoRefreshStatus.Paused))
        return
      }

      dispatch(setAutoRefreshStatus(params.id, AutoRefreshStatus.Active))

      if (inactivityTimeout !== 'Never') {
        const cutoff = calculateTimeout(
          inactivityTimeout,
          inactivityTimeoutCategory
        )
        dispatch(setInactivityTimeoutAction(params.id, cutoff))
      }

      dispatch(setAutoRefreshDuration(params.id, duration))
      onClose()
      const [app] = params.id.split('-')
      event('AutoRefresh Confirm Clicked', {
        customAutoRefreshState: JSON.stringify({
          app,
          duration,
          inactivityTimeout,
          inactivityTimeoutCategory,
        }),
      })
    } catch (error) {
      console.error({error})
    }
  }, [
    dispatch,
    duration,
    inactivityTimeout,
    inactivityTimeoutCategory,
    onClose,
    params?.id,
    refreshMilliseconds,
  ])

  let refreshContext = 'Dashboards'

  if (params.id.toLowerCase().includes(PROJECT_NAME.toLowerCase())) {
    refreshContext = PROJECT_NAME
  }

  const handleCancel = () => {
    event(
      `${refreshContext.toLowerCase()}.autorefresh.autorefreshoverlay.cancelcustom`
    )
    onClose()
  }

  const isValidSubmit = () => {
    const isValidInterval = refreshMilliseconds.interval > 0
    const isValidTimeout = isValidTimeoutInput(inactivityTimeout)
    return isValidInterval && isValidTimeout
  }

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
            Refresh {refreshContext} Until
          </div>
          <SelectGroup shape={ButtonShape.StretchToFit}>
            {refreshOptions.map(option => (
              <SelectGroup.Option
                key={option.id}
                id={option.id}
                name="refreshOptions"
                active={option.isInfinite}
                value={option.id}
                titleText={option.title}
                onClick={() =>
                  setInfiniteDuration(prevInfinite => !prevInfinite)
                }
              >
                {option.title}
              </SelectGroup.Option>
            ))}
          </SelectGroup>
          {!infiniteDuration && (
            <div
              className="timerange-popover-button"
              data-testid="timerange-popover-button"
            >
              <TimeRangeDropdown
                timeRange={duration}
                onSetTimeRange={(timeRange: CustomTimeRange) => {
                  setDuration(timeRange)
                  setInfiniteDuration(false)
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
            How often your {refreshContext.toLowerCase()} will refresh
          </div>
          <AutoRefreshInput
            handleRefreshMilliseconds={handleRefreshMilliseconds}
            label={refreshMilliseconds?.label}
          />
        </FlexBox.Child>
        <FlexBox.Child className="refresh-form-container">
          <div className="refresh-form-container-title">Inactivity Timeout</div>
          <div className="refresh-form-container-description">
            When your {refreshContext.toLowerCase()} refresh will timeout
          </div>
          <div className="refresh-inactivity-timeout-container">
            <div className="refresh-inactivity-timeout-num">
              <DurationInput
                suggestions={selectInactivityArray(inactivityTimeoutCategory)}
                onSubmit={(timeout: string) => setInactivityTimeout(timeout)}
                value={inactivityTimeout}
                validFunction={isValidTimeoutInput}
                menuMaxHeight={150}
                testID="inactivity-timeout-dropdown"
              />
            </div>
            {inactivityTimeout !== 'Never' && (
              <Dropdown
                className="refresh-inactivity-timeout-unit"
                menu={onCollapse => (
                  <Dropdown.Menu onCollapse={onCollapse}>
                    {[
                      TIMEOUT_CATEGORY.Minutes,
                      TIMEOUT_CATEGORY.Hours,
                      TIMEOUT_CATEGORY.Days,
                    ].map(option => (
                      <Dropdown.Item
                        key={option}
                        onClick={() => setInactivityTimeoutCategory(option)}
                        selected={inactivityTimeoutCategory === option}
                      >
                        {option}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                )}
                button={(active, onClick) => (
                  <Dropdown.Button active={active} onClick={onClick}>
                    {inactivityTimeoutCategory}
                  </Dropdown.Button>
                )}
                testID="inactivity-timeout-category-dropdown"
              />
            )}
          </div>
        </FlexBox.Child>
        <FlexBox.Child>
          <div className="refresh-form-buttons">
            <Button
              onClick={handleCancel}
              text="Cancel"
              color={ComponentColor.Tertiary}
              className="refresh-form-cancel-button"
              testID="refresh-form-cancel-button"
            />
            <Button
              onClick={handleConfirm}
              text="Confirm"
              color={ComponentColor.Primary}
              className="refresh-form-activate-button"
              testID="refresh-form-activate-button"
              status={
                isValidSubmit()
                  ? ComponentStatus.Default
                  : ComponentStatus.Disabled
              }
            />
          </div>
        </FlexBox.Child>
      </FlexBox>
    </Overlay.Container>
  )
}

export default AutoRefreshOverlay
