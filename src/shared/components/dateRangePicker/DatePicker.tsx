// Libraries
import React, {PureComponent, ChangeEvent} from 'react'
import ReactDatePicker from 'react-datepicker'
import moment from 'moment'

// Components
import {Input, Grid, Form} from '@influxdata/clockface'

// Styles
import 'react-datepicker/dist/react-datepicker.css'

// Types
import {Columns, ComponentSize, ComponentStatus} from '@influxdata/clockface'

interface Props {
  label: string
  dateTime: string
  maxDate?: string
  minDate?: string
  onSelectDate: (date: string) => void
  onInvalidInput?: () => void
}

interface State {
  inputValue: string
  inputFormat: string
}

const isValidRTC3339 = (d: string): boolean => {
  return (
    moment(d, 'YYYY-MM-DD HH:mm', true).isValid() ||
    moment(d, 'YYYY-MM-DD HH:mm:ss', true).isValid() ||
    moment(d, 'YYYY-MM-DD HH:mm:ss.SSS', true).isValid() ||
    moment(d, 'YYYY-MM-DD', true).isValid() ||
    moment(d).toISOString() === d
  )
}

const getFormat = (d: string): string => {
  if (moment(d, 'YYYY-MM-DD', true).isValid()) {
    return 'YYYY-MM-DD'
  }
  if (moment(d, 'YYYY-MM-DD HH:mm', true).isValid()) {
    return 'YYYY-MM-DD HH:mm'
  }
  if (moment(d, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
    return 'YYYY-MM-DD HH:mm:ss'
  }
  if (moment(d, 'YYYY-MM-DD HH:mm:ss.SSS', true).isValid()) {
    return 'YYYY-MM-DD HH:mm:ss.SSS'
  }
  return null
}

export default class DatePicker extends PureComponent<Props, State> {
  private inCurrentMonth: boolean = false
  state = {
    inputValue: null,
    inputFormat: null,
  }

  public render() {
    const {dateTime, label, maxDate, minDate} = this.props

    const date = new Date(dateTime)

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
    const {dateTime} = this.props
    const {inputValue, inputFormat} = this.state

    if (this.isInputValueInvalid) {
      const {onInvalidInput} = this.props
      onInvalidInput()
      return inputValue
    }

    if (inputFormat) {
      return moment(dateTime).format(inputFormat)
    }

    return moment(dateTime).toISOString()
  }

  private get isInputValueInvalid(): boolean {
    const {inputValue} = this.state
    if (inputValue === null) {
      return false
    }

    return !isValidRTC3339(inputValue)
  }

  private get inputErrorMessage(): string | undefined {
    if (this.isInputValueInvalid) {
      return 'Format must be YYYY-MM-DD [HH:mm:ss.SSS]'
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

  private overrideInputState = (): void => {
    const {dateTime} = this.props
    const {inputFormat} = this.state

    let value = moment(dateTime).toISOString()
    if (inputFormat) {
      value = moment(dateTime).format(inputFormat)
    }

    this.setState({inputValue: value, inputFormat: getFormat(value)})
  }

  private handleSelectDate = (date: Date): void => {
    const {onSelectDate} = this.props
    onSelectDate(date.toISOString())
    this.overrideInputState()
  }

  private handleChangeInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const {onSelectDate} = this.props
    const value = e.target.value

    if (isValidRTC3339(value)) {
      onSelectDate(moment(value).toISOString())
      this.setState({inputValue: value, inputFormat: getFormat(value)})
      return
    }

    this.setState({inputValue: value, inputFormat: null})
  }
}
