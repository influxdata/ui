import React, {FC, useState, useContext, useEffect, useCallback} from 'react'
import moment from 'moment'
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
  Icon,
} from '@influxdata/clockface'
import ReactDatePicker from 'react-datepicker'
import {PersistanceContext} from 'src/dataExplorer/context/persistance'

// Utils
import {getTimeRangeLabel} from 'src/shared/utils/duration'
import {isISODate} from 'src/shared/utils/dateTimeUtils'
import {SELECTABLE_TIME_RANGES} from 'src/shared/constants/timeRanges'
import {useSelector} from 'react-redux'
import {getTimeZone} from 'src/dashboards/selectors'
import TimeZoneDropdown from 'src/shared/components/TimeZoneDropdown'
import {isValidDatepickerFormat} from 'src/shared/components/dateRangePicker/utils'
import {TimeRange, TimeZone} from 'src/types'

const NBSP = '\u00a0\u00a0'
const MAX_WIDTH_FOR_CUSTOM_TIMES = 325

// if the input time is in ISO format: 'YYYY-MM-DDTHH:mm:ss.sssZ',
// then convert it to 'YYYY-MM-DD HH:mm'
const convertToDisplayFormat = (time: string, timeZone: TimeZone): string => {
  if (!time || !isISODate(time)) {
    return time
  }

  const FORMAT = 'YYYY-MM-DD HH:mm'

  if (timeZone !== 'UTC') {
    return moment(time).format(FORMAT)
  }

  // since the data is in ISO format, and moment formats
  // to local time. so when our app is in UTC mode, to make
  // the moment formating respect that timezone, we have to
  // manually manipulate the time
  const convertedTime = new Date(time)
  convertedTime.setMinutes(
    convertedTime.getMinutes() + convertedTime.getTimezoneOffset()
  )
  return moment(convertedTime).format(FORMAT)
}

interface Props {
  onCollapse: () => void
  timeRange: TimeRange
  timeRangeLabel: string
}

const DatePickerMenu: FC<Props> = ({onCollapse, timeRange, timeRangeLabel}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const timeZone = useSelector(getTimeZone)
  const {setRange} = useContext(PersistanceContext)

  const [inputStartDate, setInputStartDate] = useState(timeRange?.lower)
  const [inputEndDate, setInputEndDate] = useState(timeRange?.upper)
  const [inputStartErrorMessage, setInputStartErrorMessage] = useState(NBSP)
  const [inputEndErrorMessage, setInputEndErrorMessage] = useState(NBSP)

  const handleSetTimeRange = useCallback(() => {
    let matchingRange = timeRange
    if (timeRange.type === 'selectable-duration') {
      matchingRange = SELECTABLE_TIME_RANGES.find(r => {
        return r.seconds === timeRange.seconds
      })
      setInputStartDate(`-${matchingRange.lower.split(' - ')[1]}`)
      setInputEndDate('now()')
    }
  }, [timeRange])

  useEffect(() => {
    handleSetTimeRange()
  }, [handleSetTimeRange, timeRange.lower, timeRange.upper])

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

  const durationRegExp = /([0-9]+)(y|mo|w|d|h|ms|s|m|us|µs|ns)$/g

  const validateInput = (value: string) => {
    return (
      isValidDatepickerFormat(value) ||
      !!value?.match(durationRegExp) ||
      value === 'now()' ||
      isNaN(Number(value)) === false
    )
  }

  const handleSetStartDate = event => {
    const value = event.target.value
    if (!value) {
      setInputStartErrorMessage('from field required')
    } else if (validateInput(value)) {
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
      const endDate = new Date(endInput)
      // this sets the time to the end of the selected end day
      endDate.setMinutes(endDate.getMinutes() - 1)
      const dateParts = [
        endDate.getFullYear(),
        endDate.getMonth() + 1,
        endDate.getDate() + 1,
      ]
        .map(pad)
        .join('-')
      const timeParts = [endDate.getHours(), endDate.getMinutes()]
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
    const isInputStartDateDuration =
      !inputStartDate.match(durationRegExp) && !isNaN(Number(inputStartDate))
    const isInputEndDateDuration =
      inputEndDate &&
      !inputEndDate.match(durationRegExp) &&
      !isNaN(Number(inputEndDate))

    if (isInputStartDateDuration || isInputEndDateDuration) {
      if (isInputStartDateDuration) {
        setInputStartDate(`${inputStartDate}ms`)
      }
      if (isInputEndDateDuration) {
        setInputEndDate(`${inputEndDate}ms`)
      }
    } else if (validateInput(inputStartDate)) {
      // persist custom time in ISO format:
      // 'YYYY-MM-DDTHH:mm:ss.sssZ', i.e. UTC time zone
      let lower: string = inputStartDate
      if (isValidDatepickerFormat(inputStartDate)) {
        const date =
          timeZone === 'UTC' && !isISODate(inputStartDate)
            ? new Date(inputStartDate + 'Z')
            : new Date(inputStartDate)
        lower = date.toISOString()
      }

      let upper: string = inputEndDate || 'now()'
      if (isValidDatepickerFormat(inputEndDate)) {
        const date =
          timeZone === 'UTC' && !isISODate(inputEndDate)
            ? new Date(inputEndDate + 'Z')
            : new Date(inputEndDate)
        upper = date.toISOString()
      }

      if (!inputEndDate || validateInput(inputEndDate)) {
        setRange({
          lower,
          upper,
          type: 'custom',
        })
        resetCalendar()
        collapse()
      }
    }

    if (!validateInput(inputStartDate)) {
      setInputStartErrorMessage('Invalid Format')
    }
    if (!validateInput(inputEndDate)) {
      setInputEndErrorMessage('Invalid Format')
    }
  }

  const handleOpenCalendar = () => {
    setIsDatePickerOpen(prev => !prev)
  }

  return (
    <Dropdown.Menu
      style={{
        width: isDatePickerOpen ? 669 : 400,
      }}
      className="date-picker--menu"
      maxHeight={367}
    >
      <FlexBox direction={FlexDirection.Row} alignItems={AlignItems.Stretch}>
        {isDatePickerOpen && (
          <div className="react-datepicker-ignore-onclickoutside date-picker--calendar-dropdown">
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
          </div>
        )}
        <div className="date-picker--calendar-dropdown">
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
                    or absolute time (2022-08-28 14:26:00).
                  </>
                }
                tooltipStyle={{maxWidth: 290}}
              />
            </InputLabel>
            <Form.Element
              className="date-picker--form"
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
                value={convertToDisplayFormat(inputStartDate, timeZone) ?? ''}
              >
                <div
                  className="date-picker--calendar-icon"
                  onClick={handleOpenCalendar}
                >
                  <Icon glyph={IconFont.Calendar} />
                </div>
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
                value={convertToDisplayFormat(inputEndDate, timeZone) ?? ''}
              >
                <div
                  className="date-picker--calendar-icon"
                  onClick={handleOpenCalendar}
                >
                  <Icon glyph={IconFont.Calendar} />
                </div>
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
        </div>
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
  )
}

const DatePicker: FC = () => {
  const timeZone = useSelector(getTimeZone)
  const {range} = useContext(PersistanceContext)

  const [timeRange, setTimeRange] = useState(range)

  const handleSetTimeRange = useCallback(() => {
    let matchingRange = range
    if (range.type === 'selectable-duration') {
      matchingRange = SELECTABLE_TIME_RANGES.find(r => {
        return r.seconds === range.seconds
      })
    }
    setTimeRange(matchingRange)
  }, [range])

  useEffect(() => {
    handleSetTimeRange()
  }, [handleSetTimeRange, range.lower, range.upper])
  const timeRangeLabel = getTimeRangeLabel(timeRange, timeZone)

  return (
    <Dropdown
      style={{minWidth: 159, maxWidth: MAX_WIDTH_FOR_CUSTOM_TIMES}}
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
        <DatePickerMenu
          onCollapse={onCollapse}
          timeRange={timeRange}
          timeRangeLabel={timeRangeLabel}
        />
      )}
    />
  )
}

export default DatePicker
