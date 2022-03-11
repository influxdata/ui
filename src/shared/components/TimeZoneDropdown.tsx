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
    if (/notebooks/.test(window.location.pathname)) {
      loc = 'notebooks'
    } else if (/data-explorer/.test(window.location.pathname)) {
      loc = 'data explorer'
    } else if (/dashboard/.test(window.location.pathname)) {
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
    />
  )
}

export default TimeZoneDropdown
