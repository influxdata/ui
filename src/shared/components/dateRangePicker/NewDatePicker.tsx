import React, {FC, useState, useContext, useEffect, useCallback} from 'react'
import {
  AlignItems,
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Dropdown,
  FlexBox,
  FlexDirection,
  Form,
  Input,
  IconFont,
  InputLabel,
  InputType,
  QuestionMarkTooltip,
} from '@influxdata/clockface'
import ReactDatePicker from 'react-datepicker'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Utils
import {getTimeRangeLabel} from 'src/shared/utils/duration'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {useSelector} from 'react-redux'
import {getTimeZone} from 'src/dashboards/selectors'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import {isValidDatepickerFormat} from 'src/shared/components/dateRangePicker/utils'

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
    let matchingRange = range
    if (range.type === 'selectable-duration') {
      matchingRange = SELECTABLE_TIME_RANGES.find(r => {
        return r.seconds === range.seconds
      })
      setInputStartDate(`-${matchingRange.lower.split(' - ')[1]}`)
      setInputEndDate('now()')
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

  const handleClickDropdownItem = (selectedTimeRange, collapse) => {
    resetCalendar()
    setRange(selectedTimeRange)
    collapse()
  }

  const validateInput = value => {
    const durationRegExp = /([0-9]+)(y|mo|w|d|h|ms|s|m|us|µs|ns)$/g
    return (
      isValidDatepickerFormat(value) ||
      !!value.match(durationRegExp) ||
      value === 'now()' ||
      isNaN(Number(value)) === false
    )
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
    if (validateInput(inputStartDate) && inputEndDate == null) {
      setRange({
        lower: inputStartDate,
        upper: 'now()',
        type: 'custom',
      })
      resetCalendar()
      collapse()
      return
    }
    // valid start date, valid end date
    if (validateInput(inputStartDate) && validateInput(inputEndDate)) {
      setRange({
        lower: inputStartDate,
        upper: inputEndDate,
        type: 'custom',
      })
      resetCalendar()
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
            width: isDatePickerOpen ? 669 : 400,
          }}
          className="date-picker--menu"
          maxHeight={367}
        >
          <FlexBox
            direction={FlexDirection.Row}
            alignItems={AlignItems.Stretch}
          >
            {isDatePickerOpen && (
              <Dropdown.Item
                className="react-datepicker-ignore-onclickoutside date-picker--calendar-dropdown"
                selected={false}
              >
                <div className="date-picker__select-date-picker range-picker--date-pickers">
                  <InputLabel className="date-picker--label__calendar">
                    Calendar
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
              className="date-picker--calendar-dropdown"
              selected={false}
            >
              <div className="date-picker__select-time-range">
                <InputLabel className="date-picker--label">
                  Select time range
                  <QuestionMarkTooltip
                    className="date-picker--question-mark"
                    diameter={18}
                    color={ComponentColor.Primary}
                    tooltipContents={
                      <>
                        Use a relative duration (now(), -1h, -5m),{'\n'}
                        absolute time (2022-08-28 14:26:00),{'\n'}
                        or integer (Unix timestamp in seconds,{'\n'}
                        like 1567029600).&nbsp;
                      </>
                    }
                    tooltipStyle={{maxWidth: 285}}
                  />
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
                      className="date-picker--calendar-icon"
                      onClick={handleOpenCalendar}
                      icon={IconFont.Calendar}
                      size={ComponentSize.Small}
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
                      className="date-picker--calendar-icon"
                      onClick={handleOpenCalendar}
                      icon={IconFont.Calendar}
                      size={ComponentSize.Small}
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
                    onClick={() => handleClickDropdownItem(range, onCollapse)}
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
