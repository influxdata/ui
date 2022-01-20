// Libraries
import React, {useRef, useState, FC, useContext} from 'react'

// Components
import {
  Dropdown,
  Popover,
  PopoverPosition,
  PopoverInteraction,
  Appearance,
  IconFont,
} from '@influxdata/clockface'
import DateRangePicker from 'src/shared/components/dateRangePicker/DateRangePicker'

// Types
import {CustomTimeRange, TimeRangeDirection} from 'src/types'
import {pastHourTimeRange} from 'src/shared/constants/timeRanges'
import {
  convertTimeRangeToCustom,
  getTimeRangeLabel,
} from 'src/shared/utils/duration'
import {AppSettingContext} from 'src/shared/contexts/app'

interface Props {
  timeRange: CustomTimeRange
  onSetTimeRange: (timeRange: CustomTimeRange) => void
  singleDirection?: TimeRangeDirection
  className?: string
}

const TimeRangeDropdown: FC<Props> = ({
  timeRange,
  onSetTimeRange,
  singleDirection,
  className,
}) => {
  const [pickerActive, setPickerActive] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const {timeZone} = useContext(AppSettingContext)

  let dropdownLabel = 'Select a Time Range'

  if (timeRange) {
    dropdownLabel = getTimeRangeLabel(timeRange, timeZone, singleDirection)
  }

  const handleApplyTimeRange = (timeRange: CustomTimeRange) => {
    onSetTimeRange(timeRange)
    setPickerActive(false)
  }

  return (
    <div ref={buttonRef} className={className} data-testid="timerange-dropdown">
      <Dropdown.Button
        icon={IconFont.Clock_New}
        onClick={() => setPickerActive(!pickerActive)}
      >
        {dropdownLabel}
      </Dropdown.Button>
      <Popover
        appearance={Appearance.Outline}
        position={PopoverPosition.Below}
        triggerRef={buttonRef}
        visible={pickerActive}
        showEvent={PopoverInteraction.None}
        hideEvent={PopoverInteraction.None}
        distanceFromTrigger={8}
        testID="timerange-popover"
        enableDefaultStyles={false}
        contents={() => (
          <DateRangePicker
            timeRange={timeRange || convertTimeRangeToCustom(pastHourTimeRange)}
            onSetTimeRange={handleApplyTimeRange}
            onClose={() => setPickerActive(false)}
            position={{position: 'relative'}}
            singleDirection={singleDirection}
          />
        )}
      />
    </div>
  )
}

export default TimeRangeDropdown
