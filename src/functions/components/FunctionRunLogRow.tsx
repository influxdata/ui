// Libraries
import React, {FC} from 'react'

// Components
import {IndexList} from '@influxdata/clockface'

// Types
import {FunctionRunLog} from 'src/client/managedFunctionsRoutes'
import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'

const FunctionRunLogRow: FC<FunctionRunLog> = ({
  message,
  timestamp,
  severity,
}) => {

  return (
    <IndexList.Row>
      <IndexList.Cell>
        <span className="run-logs--list-time">
          <FormattedDateTime format={DEFAULT_TIME_FORMAT} date={new Date(timestamp)}/>
        </span>
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
