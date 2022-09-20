// Libraries
import React, {PureComponent, ChangeEvent} from 'react'
import ReactDatePicker from 'react-datepicker'
import {connect} from 'react-redux'
import {DateTime} from 'luxon'

// Components
import {Input, Grid, Form} from '@influxdata/clockface'

// Styles
import 'react-datepicker/dist/react-datepicker.css'

// Types
import {Columns, ComponentSize, ComponentStatus} from '@influxdata/clockface'
import {TimeZone} from 'src/types'

// Utils
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {getTimeZone} from 'src/dashboards/selectors'

// Constants
import {
  DEFAULT_TIME_FORMAT,
  STRICT_ISO8061_TIME_FORMAT,
} from 'src/utils/datetime/constants'
import {
  getLuxonFormatString,
  isValidStrictly,
} from 'src/utils/datetime/validator'
import {isISODate} from 'src/shared/utils/dateTimeUtils'
import {isValidDatepickerFormat} from 'src/shared/components/dateRangePicker/utils'

interface Props {
  label: string
  dateTime: string
  timeZone: TimeZone
  maxDate?: string
  minDate?: string
  onSelectDate: (date: string) => void
  onInvalidInput: () => void
}

interface State {
  inputValue: string
  inputFormat: string
}

const getFormat = (d: string): string => {
  if (isValidStrictly(d, 'YYYY-MM-DD')) {
    return 'YYYY-MM-DD'
  }
  if (isValidStrictly(d, 'YYYY-MM-DD HH:mm')) {
    return 'YYYY-MM-DD HH:mm'
  }
  if (isValidStrictly(d, 'YYYY-MM-DD HH:mm:ss')) {
    return 'YYYY-MM-DD HH:mm:ss'
  }
  if (isValidStrictly(d, 'YYYY-MM-DD HH:mm:ss.sss')) {
    return 'YYYY-MM-DD HH:mm:ss.sss'
  }
  if (isISODate(d)) {
    return STRICT_ISO8061_TIME_FORMAT
  }
  return null
}

class DatePicker extends PureComponent<Props, State> {
  private inCurrentMonth: boolean = false
  state = {
    inputValue: null,
    inputFormat: DEFAULT_TIME_FORMAT,
  }

  public componentDidUpdate() {
    if (this.isInputValueInvalid) {
      this.props.onInvalidInput()
    }
  }

  public render() {
    const {dateTime, label, maxDate, minDate, timeZone} = this.props

    const date = new Date(dateTime)

    if (timeZone === 'UTC') {
      // (sahas): the react-datepicker forces the timezone to be the Local timezone.
      // so when our app in in UTC mode, to make the datepicker respect that timezone,
      // we have to manually manipulate the Local time and add the offset so that it displays the correct UTC time in the picker
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
    }

    return (
      <div className="range-picker--date-picker">
        <Grid.Row>
          <Grid.Column widthXS={Columns.Twelve}>
            <Form.Element label={label} errorMessage={this.inputErrorMessage}>
              <Input
                size={ComponentSize.Medium}
                className="range-picker--input react-datepicker-ignore-onclickoutside"
                titleText={label}
                value={this.inputValue}
                onChange={this.handleChangeInput}
                status={this.inputStatus}
                testID="timerange--input"
              />
            </Form.Element>
            <div className="range-picker--popper-container">
              <ReactDatePicker
                inline={true}
                selected={date}
                onChange={this.handleSelectDate}
                startOpen={true}
                dateFormat="yyyy-MM-dd HH:mm"
                showTimeSelect={true}
                timeFormat="HH:mm"
                shouldCloseOnSelect={false}
                disabledKeyboardNavigation={true}
                calendarClassName="range-picker--calendar"
                dayClassName={this.dayClassName}
                timeIntervals={60}
                fixedHeight={true}
                minDate={new Date(minDate)}
                maxDate={new Date(maxDate)}
              />
            </div>
          </Grid.Column>
        </Grid.Row>
      </div>
    )
  }

  private get inputValue(): string {
    const {dateTime, timeZone} = this.props
    const {inputValue, inputFormat} = this.state

    if (this.isInputValueInvalid) {
      return inputValue
    }

    // just return the ISO format string as is, no need to use our date-time Formatter
    if (isISODate(dateTime) && inputFormat === STRICT_ISO8061_TIME_FORMAT) {
      return dateTime
    }

    if (inputFormat) {
      const formatter = createDateTimeFormatter(inputFormat, timeZone)
      return formatter.format(new Date(dateTime))
    }
    const formatter = createDateTimeFormatter(DEFAULT_TIME_FORMAT, timeZone)

    return formatter.format(new Date(dateTime))
  }

  private get isInputValueInvalid(): boolean {
    const {inputValue} = this.state
    if (inputValue === null) {
      return false
    }

    return !isValidDatepickerFormat(inputValue)
  }

  private get inputErrorMessage(): string | undefined {
    if (this.isInputValueInvalid) {
      return 'Format must be YYYY-MM-DD HH:mm:ss'
    }

    return '\u00a0\u00a0'
  }

  private get inputStatus(): ComponentStatus {
    if (this.isInputValueInvalid) {
      return ComponentStatus.Error
    }
    return ComponentStatus.Default
  }

  private dayClassName = (date: Date) => {
    const day = date.getDate()

    if (day === 1) {
      this.inCurrentMonth = !this.inCurrentMonth
    }

    if (this.inCurrentMonth) {
      return 'range-picker--day-in-month'
    }

    return 'range-picker--day'
  }

  private handleSelectDate = (date: Date): void => {
    const {onSelectDate, timeZone} = this.props

    if (timeZone === 'UTC') {
      // (sahas): the react-datepicker forces the timezone to be the Local timezone.
      // so when our app in in UTC mode, to make the datepicker respect that timezone,
      // we have to manually manipulate the Local time and add the offset so that it displays the correct UTC time in the picker
      // because the time now needs to be back to UTC, we subtract the offset added below in code, in the handleSelectDate
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    }

    onSelectDate(date.toISOString())
  }

  private handleChangeInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const {onSelectDate, timeZone} = this.props
    const value = e.target.value

    if (isValidDatepickerFormat(value)) {
      let inputDate
      if (isISODate(value)) {
        inputDate = new Date(DateTime.fromISO(value))
      } else {
        inputDate = new Date(
          DateTime.fromFormat(value, getLuxonFormatString(getFormat(value)))
        )
      }

      if (timeZone === 'UTC' && !isISODate(value)) {
        // (sahas): the react-datepicker forces the timezone to be the Local timezone.
        // so when our app in in UTC mode, to make the datepicker respect that timezone,
        // we have to manually manipulate the Local time and add the offset so that it displays the correct UTC time in the picker
        // because the time now needs to be back to UTC, we subtract the offset added below in code, in the handleSelectDate
        inputDate.setMinutes(
          inputDate.getMinutes() - inputDate.getTimezoneOffset()
        )
      }

      onSelectDate(inputDate.toISOString())
      this.setState({inputValue: value, inputFormat: getFormat(value)})
      return
    }

    this.setState({inputValue: value, inputFormat: null})
  }
}

const mapStateToProps = state => ({
  timeZone: getTimeZone(state),
})

export default connect(mapStateToProps)(DatePicker)
