// Libraries
import React, {FC, useContext} from 'react'
import {SelectDropdown, IconFont} from '@influxdata/clockface'

// Actions & Selectors
import {AppSettingContext} from 'src/shared/contexts/app'

// Constants
import {TIME_ZONES} from 'src/shared/constants/timeZones'

const TimeZoneDropdown: FC = () => {
  const {timeZone, setTimeZone} = useContext(AppSettingContext)

  return (
    <SelectDropdown
      options={TIME_ZONES.map(tz => tz.timeZone)}
      selectedOption={timeZone}
      onSelect={setTimeZone}
      buttonIcon={IconFont.Annotate}
      style={{width: '115px'}}
    />
  )
}

export default TimeZoneDropdown
