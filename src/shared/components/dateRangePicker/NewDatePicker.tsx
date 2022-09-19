import React, {FC, useState, useContext, useEffect, useCallback} from 'react'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Dropdown,
  FlexBox,
  FlexDirection,
  Input,
  IconFont,
  InputLabel,
  InputType,
  AlignItems,
  InfluxColors,
  Form,
} from '@influxdata/clockface'
import ReactDatePicker from 'react-datepicker'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Utils
import {getTimeRangeLabel} from 'src/shared/utils/duration'
import {SELECTABLE_TIME_RANGES as REDUX_SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {useSelector} from 'react-redux'
import {getTimeZone} from 'src/dashboards/selectors'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import {SelectableDurationTimeRange} from 'src/types'
import {isValidDatepickerFormat} from 'src/shared/components/dateRangePicker/utils'

const SELECTABLE_TIME_RANGES: SelectableDurationTimeRange[] = [
  {
    seconds: 60,
    lower: 'now() - 1m',
    upper: null,
    label: 'Past 1 minute',
    duration: '1m',
    type: 'selectable-duration',
    windowPeriod: 1000, // 1s
  },
  {
    seconds: 300,
    lower: 'now() - 5m',
    upper: null,
    label: 'Past 5 minutes',
    duration: '5m',
    type: 'selectable-duration',
    windowPeriod: 10000, // 10s
  },
  {
    seconds: 900,
    lower: 'now() - 15m',
    upper: null,
    label: 'Past 15 minutes',
    duration: '15m',
    type: 'selectable-duration',
    windowPeriod: 10000, // 10s
  },
  {
    seconds: 3600,
    lower: 'now() - 1h',
    upper: null,
    label: 'Past 1 hour',
    duration: '1h',
    type: 'selectable-duration',
    windowPeriod: 10000, // 10s
  },
  {
    seconds: 10800,
    lower: 'now() - 3h',
    upper: null,
    label: 'Past 3 hours',
    duration: '3h',
    type: 'selectable-duration',
    windowPeriod: 60000, // 1m
  },
  {
    seconds: 21600,
    lower: 'now() - 6h',
    upper: null,
    label: 'Past 6 hours',
    duration: '6h',
    type: 'selectable-duration',
    windowPeriod: 60000, // 1m
  },
  {
    seconds: 43200,
    lower: 'now() - 12h',
    upper: null,
    label: 'Past 12 hours',
    duration: '12h',
    type: 'selectable-duration',
    windowPeriod: 120000, // 2m
  },
  {
    seconds: 86400,
    lower: 'now() - 24h',
    upper: null,
    label: 'Past 24 hours',
    duration: '24h',
    type: 'selectable-duration',
    windowPeriod: 240000, // 4m
  },
  {
    seconds: 172800,
    lower: 'now() - 2d',
    upper: null,
    label: 'Past 2 days',
    duration: '2d',
    type: 'selectable-duration',
    windowPeriod: 600000, // 10m
  },
  {
    seconds: 604800,
    lower: 'now() - 7d',
    upper: null,
    label: 'Past 7 days',
    duration: '7d',
    type: 'selectable-duration',
    windowPeriod: 1800000, // 30 min
  },
  {
    seconds: 2592000,
    lower: 'now() - 30d',
    upper: null,
    label: 'Past 30 days',
    duration: '30d',
    type: 'selectable-duration',
    windowPeriod: 3600000, // 1h
  },
]

const NBSP = '\u00a0\u00a0'

const DatePicker: FC = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const timeZone = useSelector(getTimeZone)
  const {range, setRange} = useContext(PersistanceContext)

  const [timeRange, setTimeRange] = useState(range)
  const [inputStartDate, setInputStartDate] = useState(timeRange?.lower)
  const [inputEndDate, setInputEndDate] = useState(timeRange?.upper)
  const [inputStartErrorMessage, setInputStartErrorMessage] = useState(NBSP)
  const [inputEndErrorMessage, setInputEndErrorMessage] = useState(NBSP)

  const handleSetTimeRange = useCallback(() => {
    /**
     * NOTE: this is a hack to sync state between the old selectable time ranges format
     * and the new selectable time ranges format.
     */
    let matchingRange = range
    if (range.type === 'selectable-duration') {
      matchingRange = SELECTABLE_TIME_RANGES.find(r => {
        return r.seconds === range.seconds
      })
      setInputStartDate(`-${matchingRange.lower.split(' - ')[1]}`)
    }
    setTimeRange(matchingRange)
  }, [range])

  useEffect(() => {
    handleSetTimeRange()
  }, [handleSetTimeRange, range.lower, range.upper])
  const timeRangeLabel = getTimeRangeLabel(timeRange, timeZone)

  const [dateRange, setDateRange] = useState([null, null])
  const [startDate, endDate] = dateRange

  const resetCalendar = () => {
    setDateRange([null, null])
    setIsDatePickerOpen(false)
    setInputEndDate(null)
  }

  const handleClickDropdownItem = (seconds, collapse) => {
    const selectedTimeRange = REDUX_SELECTABLE_TIME_RANGES.find(
      t => t.seconds === seconds
    )
    resetCalendar()
    setRange(selectedTimeRange)
    collapse()
  }

  const validateInput = value => {
    const durationRegExp = /^(-([0-9]+)(h|s|m|d))+$/g
    return isValidDatepickerFormat(value) || !!value.match(durationRegExp)
  }

  const handleSetStartDate = event => {
    const value = event.target.value
    if (validateInput(value)) {
      if (inputStartErrorMessage !== NBSP) {
        setInputStartErrorMessage(NBSP)
      }
    } else {
      if (inputStartErrorMessage === NBSP) {
        setInputStartErrorMessage('Invalid Format')
      }
    }
    setInputStartDate(value)
  }

  const handleSetEndDate = event => {
    const value = event.target.value
    if (validateInput(value)) {
      if (inputEndErrorMessage !== NBSP) {
        setInputEndErrorMessage(NBSP)
      }
    } else {
      if (inputEndErrorMessage === NBSP) {
        setInputEndErrorMessage('Invalid Format')
      }
    }
    setInputEndDate(value)
  }

  const handleSelectDate = (dates): void => {
    const [start, end] = dates
    if (timeZone === 'UTC') {
      if (start) {
        start.setMinutes(start.getMinutes() + start.getTimezoneOffset())
      }
      if (end) {
        end.setMinutes(end.getMinutes() + end.getTimezoneOffset())
      }
    }
    setDateRange([start, end])
    let startInput = start
    let endInput = end

    const pad = part => part.toString().padStart(2, '0')
    if (startInput instanceof Date) {
      const dateParts = [
        startInput.getFullYear(),
        startInput.getMonth() + 1,
        startInput.getDate(),
      ]
        .map(pad)
        .join('-')
      const timeParts = [startInput.getHours(), startInput.getMinutes()]
        .map(pad)
        .join(':')
      startInput = `${dateParts} ${timeParts}`
    }
    if (endInput instanceof Date) {
      const dateParts = [
        endInput.getFullYear(),
        endInput.getMonth() + 1,
        endInput.getDate(),
      ]
        .map(pad)
        .join('-')
      const timeParts = [endInput.getHours(), endInput.getMinutes()]
        .map(pad)
        .join(':')
      endInput = `${dateParts} ${timeParts}`
    }
    setInputStartDate(startInput)
    setInputEndDate(endInput)
  }

  let inCurrentMonth = false
  const dayClassName = (date: Date) => {
    const day = date.getDate()

    if (day === 1) {
      inCurrentMonth = !inCurrentMonth
    }

    if (date >= new Date(startDate) && date <= new Date(endDate)) {
      return 'range-picker--active-day'
    }

    if (inCurrentMonth) {
      return 'range-picker--day-in-month'
    }

    return 'range-picker--day'
  }

  const handleApplyTimeRange = collapse => {
    // no start or end date
    if (inputStartDate == null && inputEndDate == null) {
      setInputStartErrorMessage('from field required')
    }
    // valid start date, valid end date
    if (validateInput(inputStartDate) && validateInput(inputEndDate)) {
      setRange({
        lower: inputStartDate,
        upper: inputEndDate,
        type: 'custom',
      })
      collapse()
      return
    }
    // valid start date with no end date
    if (validateInput(inputStartDate) && inputEndDate == null) {
      setRange({
        lower: inputStartDate,
        upper: null,
        type: 'custom',
      })
      collapse()
      return
    }
    // valid start date, invalid end date
    if (validateInput(inputStartDate) && !validateInput(inputEndDate)) {
      setInputEndErrorMessage('Invalid Format')
      return
    }
    // invalid start date, valid end date
    if (!validateInput(inputStartDate) && validateInput(inputEndDate)) {
      setInputStartErrorMessage('Invalid Format')
      return
    }
    if (!validateInput(inputStartDate) && !validateInput(inputEndDate)) {
      setInputStartErrorMessage('Invalid Format')
      setInputEndErrorMessage('Invalid Format')
      return
    }
  }

  const handleOpenCalendar = () => {
    setIsDatePickerOpen(prev => !prev)
  }

  return (
    <Dropdown
      style={{width: 159}}
      testID="timerange-dropdown"
      button={(active, onClick) => (
        <Dropdown.Button
          active={active}
          onClick={onClick}
          icon={IconFont.Clock_New}
        >
          {timeRangeLabel}
        </Dropdown.Button>
      )}
      menu={onCollapse => (
        <Dropdown.Menu
          style={{
            background: '#f1f1f31a',
            width: isDatePickerOpen ? 669 : 400,
            position: 'absolute',
            right: 0,
            padding: '0 8px 0 0',
          }}
          maxHeight={367}
        >
          <FlexBox
            direction={FlexDirection.Row}
            alignItems={AlignItems.Stretch}
          >
            {isDatePickerOpen && (
              <Dropdown.Item
                className="react-datepicker-ignore-onclickoutside"
                selected={false}
                style={{
                  background: 'transparent',
                  borderRight: '2px solid rgba(255,255,255,.2)',
                  display: 'flex',
                  alignItems: 'stretch',
                  padding: 8,
                }}
              >
                <div className="date-picker__select-date-picker range-picker--date-pickers">
                  <InputLabel className="date-picker--label__calendar">
                    Date Picker
                  </InputLabel>
                  <ReactDatePicker
                    calendarClassName="range-picker--calendar"
                    dateFormat="yyyy-MM-dd HH:mm"
                    dayClassName={dayClassName}
                    disabledKeyboardNavigation
                    fixedHeight
                    inline
                    selectsRange
                    shouldCloseOnSelect={false}
                    startOpen
                    startDate={startDate}
                    endDate={endDate}
                    onChange={handleSelectDate}
                  />
                </div>
              </Dropdown.Item>
            )}
            <Dropdown.Item
              selected={false}
              style={{
                borderRight: '2px solid rgba(255,255,255,.2)',
                display: 'flex',
                alignItems: 'stretch',
                background: 'transparent',
                padding: 8,
              }}
            >
              <div className="date-picker__select-time-range">
                <InputLabel className="date-picker--label">
                  Select time range
                </InputLabel>
                <Form.Element
                  label="From"
                  errorMessage={inputStartErrorMessage}
                  required
                >
                  <Input
                    className="date-picker__input"
                    onChange={handleSetStartDate}
                    status={
                      inputStartErrorMessage === NBSP
                        ? ComponentStatus.Default
                        : ComponentStatus.Error
                    }
                    type={InputType.Text}
                    value={inputStartDate}
                  >
                    <Button
                      onClick={handleOpenCalendar}
                      icon={IconFont.Calendar}
                      size={ComponentSize.Small}
                      style={{
                        background: InfluxColors.Grey35,
                        top: 2,
                        right: 1,
                        borderRadius: '0 !important',
                      }}
                    />
                  </Input>
                </Form.Element>
                <Form.Element label="To" errorMessage={inputEndErrorMessage}>
                  <Input
                    className="date-picker__input"
                    onChange={handleSetEndDate}
                    status={
                      inputEndErrorMessage === NBSP
                        ? ComponentStatus.Default
                        : ComponentStatus.Error
                    }
                    type={InputType.Text}
                    value={inputEndDate}
                  >
                    <Button
                      onClick={handleOpenCalendar}
                      icon={IconFont.Calendar}
                      size={ComponentSize.Small}
                      style={{
                        background: InfluxColors.Grey35,
                        top: 2,
                        right: 1,
                        borderRadius: '0 !important',
                      }}
                    />
                  </Input>
                </Form.Element>
                <InputLabel className="date-picker--label__timezone">
                  Time Zone
                </InputLabel>
                <div className="date-picker--timezone-container">
                  <TimeZoneDropdown />
                </div>
                <Button
                  className="date-picker__apply-time-range"
                  color={ComponentColor.Primary}
                  size={ComponentSize.Small}
                  onClick={() => handleApplyTimeRange(onCollapse)}
                  text="Apply Time Range"
                  testID="daterange--apply-btn"
                  status={
                    inputStartDate != null &&
                    inputStartErrorMessage === NBSP &&
                    inputEndErrorMessage === NBSP
                      ? ComponentStatus.Default
                      : ComponentStatus.Disabled
                  }
                />
              </div>
            </Dropdown.Item>
            <FlexBox
              direction={FlexDirection.Column}
              style={{background: 'transparent'}}
            >
              <InputLabel className="date-picker--label__options">
                Time range options
              </InputLabel>
              {SELECTABLE_TIME_RANGES.map(range => {
                const {label} = range
                const testID = label.toLowerCase().replace(/\s/g, '')
                return (
                  <Dropdown.Item
                    key={label}
                    value={label}
                    id={label}
                    testID={`dropdown-item-${testID}`}
                    selected={label === timeRangeLabel}
                    style={{width: 135}}
                    onClick={() =>
                      handleClickDropdownItem(range.seconds, onCollapse)
                    }
                  >
                    {label}
                  </Dropdown.Item>
                )
              })}
            </FlexBox>
          </FlexBox>
        </Dropdown.Menu>
      )}
    />
  )
}

export default DatePicker
