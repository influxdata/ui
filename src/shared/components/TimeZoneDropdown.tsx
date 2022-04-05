// Libraries
import React, {FC, useContext} from 'react'
import {SelectDropdown, IconFont} from '@influxdata/clockface'

// Actions & Selectors
import {AppSettingContext} from 'src/shared/contexts/app'

// Constants
import {TIME_ZONES} from 'src/shared/constants/timeZones'
import {TimeZone} from 'src/types'
import {event} from 'src/cloud/utils/reporting'

const TimeZoneDropdown: FC = () => {
  const {timeZone, setTimeZone} = useContext(AppSettingContext)

  const onSelect = (zone: TimeZone) => {
    let loc = 'other'
    if (window.location.pathname.includes('notebook')) {
      loc = 'notebooks'
    } else if (window.location.pathname.includes('data-explorer')) {
      loc = 'data explorer'
    } else if (window.location.pathname.includes('dashboard')) {
      loc = 'dashboard'
    }

    event('user selected new timezone', {location: loc})
    setTimeZone(zone)
  }

  return (
    <SelectDropdown
      options={TIME_ZONES.map(tz => tz.timeZone)}
      selectedOption={timeZone}
      onSelect={onSelect}
      buttonIcon={IconFont.Annotate_New}
      style={{width: '115px'}}
      testID="timezone-dropdown"
    />
  )
}

export default TimeZoneDropdown
