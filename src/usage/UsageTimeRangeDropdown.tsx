// Libraries
import React, {FC, createRef, useState} from 'react'

// Components
import {
  ComponentColor,
  Dropdown,
  Form,
  Popover,
  PopoverPosition,
  PopoverInteraction,
  Appearance,
  IconFont,
} from '@influxdata/clockface'
import DateRangePicker from 'src/shared/components/dateRangePicker/DateRangePicker'

// Utils
import {getTimeRangeLabel} from 'src/shared/utils/duration'

// Constants
import {SELECTABLE_USAGE_TIME_RANGES} from 'src/shared/constants/timeRanges'

// Types
import {TimeRange} from 'src/types'

interface Props {
  timeRange: TimeRange
  onSetTimeRange: (timeRange: TimeRange) => void
}

const TimeRangeDropdown: FC<Props> = ({onSetTimeRange, timeRange}) => {
  const dropdownRef = createRef<HTMLDivElement>()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false)

  const timeRangeLabel = getTimeRangeLabel(timeRange)

  const handleApplyTimeRange = (timeRange: TimeRange) => {
    onSetTimeRange(timeRange)
    setIsDatePickerOpen(false)
  }

  const handleClickDropdownItem = (label: string): void => {
    const timeRange = SELECTABLE_USAGE_TIME_RANGES.find(t => t.label === label)
    onSetTimeRange(timeRange)
  }

  return (
    <>
      <Popover
        appearance={Appearance.Outline}
        position={PopoverPosition.ToTheLeft}
        triggerRef={dropdownRef}
        visible={isDatePickerOpen}
        showEvent={PopoverInteraction.None}
        hideEvent={PopoverInteraction.None}
        distanceFromTrigger={8}
        testID="timerange-popover"
        enableDefaultStyles={false}
        contents={() => (
          <DateRangePicker
            timeRange={timeRange}
            onSetTimeRange={handleApplyTimeRange}
            onClose={() => setIsDatePickerOpen(false)}
            position={isDatePickerOpen ? {position: 'relative'} : undefined}
          />
        )}
      />
      <Form.Element label="Time Range">
        <Dropdown
          style={{width: 200, marginBottom: 8}}
          testID="timerange-dropdown"
          button={(active, onClick) => (
            <Dropdown.Button
              active={active}
              onClick={onClick}
              icon={IconFont.Clock}
              color={ComponentColor.Primary}
            >
              {timeRangeLabel}
            </Dropdown.Button>
          )}
          menu={onCollapse => (
            <Dropdown.Menu onCollapse={onCollapse}>
              {SELECTABLE_USAGE_TIME_RANGES.map(({label}) => {
                const testID = label.toLowerCase().replace(/\s/g, '')
                return (
                  <Dropdown.Item
                    key={label}
                    value={label}
                    id={label}
                    testID={`dropdown-item-${testID}`}
                    selected={label === timeRangeLabel}
                    onClick={handleClickDropdownItem}
                  >
                    {label}
                  </Dropdown.Item>
                )
              })}
            </Dropdown.Menu>
          )}
        />
      </Form.Element>
    </>
  )
}

export default TimeRangeDropdown
