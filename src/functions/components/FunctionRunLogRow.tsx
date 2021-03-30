// Libraries
import React, {FC} from 'react'
import _ from 'lodash'
import moment from 'moment'

// Components
import {IndexList} from '@influxdata/clockface'

// Types
import {FunctionRunLog} from 'src/client/managedFunctionsRoutes'
import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'

const FunctionRunLogRow: FC<FunctionRunLog> = ({
  message,
  timestamp,
  severity,
}) => {
  const dateTimeIfy = (dt: string): string => {
    if (!dt) {
      return ''
    }

    const newdate = new Date(dt)
    const formatted = moment(newdate).format(DEFAULT_TIME_FORMAT)

    return formatted
  }

  return (
    <IndexList.Row>
      <IndexList.Cell>
        <span className="run-logs--list-time">{dateTimeIfy(timestamp)}</span>
      </IndexList.Cell>
      <IndexList.Cell>
        <span className="run-logs--list-time">{severity}</span>
      </IndexList.Cell>
      <IndexList.Cell>
        <span className="run-logs--list-message">{message}</span>
      </IndexList.Cell>
    </IndexList.Row>
  )
}

export default FunctionRunLogRow
