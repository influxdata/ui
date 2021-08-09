// Libraries
import React, {FC} from 'react'

// Constants
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'

// Types
import {StatusRow, NotificationRow} from 'src/types'
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'

interface Props {
  row: StatusRow | NotificationRow
}

const TimeTableField: FC<Props> = ({row: {time}}) => {
  return (
    <div className="time-table-field">
      <FormattedDateTime format={DEFAULT_TIME_FORMAT} date={new Date(time)} />
    </div>
  )
}

export default TimeTableField
