// Libraries
import React, {FC, useCallback, useContext, useState} from 'react'
import {useDispatch} from 'react-redux'

// Components
import {
  Overlay,
  Grid,
  Button,
  ComponentColor,
  SelectDropdown,
  ComponentStatus,
  FlexBox,
  FlexDirection,
  AlignItems,
  SelectGroup,
  ButtonShape,
} from '@influxdata/clockface'
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
  const [inactivityTimeoutCategory, setInactivityTimeoutCategory] = useState(
    'Hours'
  )

  const refreshOptions = [
    {
      id: 'indefinite-auto-refresh',
      title: 'Indefinite',
      active: infiniteDuration,
    },
    {
      id: 'custom-auto-refresh',
      title: 'Custom',
      active: !infiniteDuration,
    },
  ]

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

  const handleCancel = () => {
    event('dashboards.autorefresh.autorefreshoverlay.cancelcustom')
    onClose()
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
            How often your dashboard will refresh
          </div>
          <AutoRefreshInput
            handleRefreshMilliseconds={handleRefreshMilliseconds}
            label={refreshMilliseconds?.label}
          />
        </FlexBox.Child>
      </FlexBox>
      <Grid>
        <Grid.Column className="refresh-form-column">
          <div className="refresh-form-container">
            <span className="refresh-form-container-child">
              Inactivity Timeout:{' '}
            </span>
            <div
              className={`refresh-form-container-child ${
                inactivityTimeout === 'Never' ? 'inactive' : 'active'
              }`}
            >
              <SelectDropdown
                options={selectInactivityArray(inactivityTimeoutCategory)}
                selectedOption={inactivityTimeout}
                onSelect={(timeout: string) => setInactivityTimeout(timeout)}
                buttonColor={ComponentColor.Default}
                testID="inactivity-timeout-dropdown"
              />
              {inactivityTimeout !== 'Never' && (
                <SelectDropdown
                  className="refresh-form-timeout-dropdown"
                  options={['Minutes', 'Hours', 'Days']}
                  selectedOption={inactivityTimeoutCategory}
                  onSelect={(timeoutCategory: string) =>
                    setInactivityTimeoutCategory(timeoutCategory)
                  }
                  buttonColor={ComponentColor.Default}
                  testID="inactivity-timeout-category-dropdown"
                />
              )}
            </div>
          </div>
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
                refreshMilliseconds.interval === 0
                  ? ComponentStatus.Disabled
                  : ComponentStatus.Default
              }
            />
          </div>
        </Grid.Column>
      </Grid>
    </Overlay.Container>
  )
}

export default AutoRefreshOverlay
