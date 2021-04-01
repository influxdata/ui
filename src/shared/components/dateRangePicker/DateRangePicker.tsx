// Libraries
import React, {CSSProperties, PureComponent} from 'react'

// Components
import DatePicker from 'src/shared/components/dateRangePicker/DatePicker'
import {ClickOutside} from 'src/shared/components/ClickOutside'

// Types
import {TimeRange} from 'src/types'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
} from '@influxdata/clockface'
import moment from 'moment'

interface Props {
  timeRange: TimeRange
  onSetTimeRange: (timeRange: TimeRange) => void
  onClose: () => void
  position?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
    position?: string
  }
}

interface State {
  lower: string
  upper: string
  validDateRange: boolean
}

class DateRangePicker extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)

    const {
      timeRange: {lower, upper},
    } = props

    // The button can be disabled to start with, only activate it if the values are changed.
    const validDateRange = false
    this.state = {lower, upper, validDateRange}
  }

  public render() {
    const {onClose} = this.props
    const {upper, lower} = this.state

    return (
      <ClickOutside onClickOutside={onClose}>
        <div
          className="range-picker react-datepicker-ignore-onclickoutside"
          style={this.stylePosition}
        >
          <button className="range-picker--dismiss" onClick={onClose} />
          <div className="range-picker--date-pickers">
            <DatePicker
              dateTime={lower}
              onSelectDate={this.handleSelectLower}
              label="Start"
              maxDate={upper}
            />
            <DatePicker
              dateTime={upper}
              onSelectDate={this.handleSelectUpper}
              label="Stop"
              minDate={lower}
            />
          </div>
          <Button
            className="range-picker--submit"
            color={ComponentColor.Primary}
            size={ComponentSize.Small}
            onClick={this.handleSetTimeRange}
            text="Apply Time Range"
            testID="daterange--apply-btn"
            status={
              this.state.validDateRange
                ? ComponentStatus.Default
                : ComponentStatus.Disabled
            }
          />
        </div>
      </ClickOutside>
    )
  }

  private get stylePosition(): CSSProperties {
    const {position} = this.props

    if (!position) {
      return {
        top: `${window.innerHeight / 2}px`,
        left: `${window.innerWidth / 2}px`,
        transform: `translate(-50%, -50%)`,
      }
    }

    const style = Object.entries(position).reduce((acc, [k, v]) => {
      const obj = {...acc}
      if (isNaN(+v)) {
        obj[k] = v
      } else {
        obj[k] = `${v}px`
      }
      return obj
    }, {})

    return style
  }

  private handleSetTimeRange = (): void => {
    const {onSetTimeRange} = this.props
    const {upper, lower} = this.state

    onSetTimeRange({lower, upper, type: 'custom'})
  }

  private handleSelectLower = (lower: string): void => {
    this.setState({lower, validDateRange: this.isTimeRangeValid()})
  }

  private handleSelectUpper = (upper: string): void => {
    this.setState({upper, validDateRange: this.isTimeRangeValid()})
  }

  private isTimeRangeValid = (): boolean => {
    const {lower, upper} = this.state
    return moment(lower).isBefore(upper)
  }
}

export default DateRangePicker
