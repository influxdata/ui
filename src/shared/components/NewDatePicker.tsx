import React, {FC, useState} from 'react'
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  Dropdown,
  FlexBox,
  FlexDirection,
  JustifyContent,
  IconFont,
} from '@influxdata/clockface'
import {ClickOutside} from 'src/shared/components/ClickOutside'

import {
  SELECTABLE_TIME_RANGES,
  CUSTOM_TIME_RANGE_LABEL,
  DEFAULT_TIME_RANGE,
} from 'src/shared/constants/timeRanges'
// Utils
import {
  convertTimeRangeToCustom,
  getTimeRangeLabel,
} from 'src/shared/utils/duration'
import {useSelector} from 'react-redux'
import {getTimeRange, getTimeZone} from 'src/dashboards/selectors'
import DateRangePicker from 'src/shared/components/dateRangePicker/DateRangePicker'

const DatePicker: FC = () => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const timeZone = useSelector(getTimeZone)
  const timeRange = useSelector(getTimeRange)
  const timeRangeLabel = getTimeRangeLabel(timeRange, timeZone)

  console.log({timeRange})

  return (
    <Dropdown
      style={{width: 282}}
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
        <Dropdown.Menu onCollapse={onCollapse} style={{width: 282}}>
          <FlexBox
            justifyContent={JustifyContent.SpaceAround}
            direction={FlexDirection.Row}
          >
            <Dropdown.Item>
              <div
                className="range-picker react-datepicker-ignore-onclickoutside"
                style={{
                  top: `${window.innerHeight / 2}px`,
                  left: `${window.innerWidth / 2}px`,
                  transform: `translate(-50%, -50%)`,
                }}
              >
                <button
                  className="range-picker--dismiss"
                  onClick={() => setIsDatePickerOpen(false)}
                />
                <div className="range-picker--date-pickers">
                  <input type="date" />
                  <input type="date" />
                </div>
                <Button
                  className="range-picker--submit"
                  color={ComponentColor.Primary}
                  size={ComponentSize.Small}
                  onClick={range => console.log({range})}
                  text="Apply Time Range"
                  testID="daterange--apply-btn"
                  status={ComponentStatus.Default}
                />
              </div>
            </Dropdown.Item>
            <FlexBox direction={FlexDirection.Column}>
              {SELECTABLE_TIME_RANGES.map(({label}) => {
                const testID = label.toLowerCase().replace(/\s/g, '')
                return (
                  <Dropdown.Item
                    key={label}
                    value={label}
                    id={label}
                    testID={`dropdown-item-${testID}`}
                    selected={label === timeRangeLabel}
                    // onClick={this.handleClickDropdownItem}
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
