// Libraries
import React, {FC} from 'react'
import moment from 'moment'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  IndexList,
} from '@influxdata/clockface'

// Types
import {FunctionRunRecord} from 'src/client/managedFunctionsRoutes'
import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'

interface Props {
  run: FunctionRunRecord
}

const FunctionRunsRow: FC<Props> = ({run}) => {
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
      <IndexList.Cell>{run.status}</IndexList.Cell>
      <IndexList.Cell>{run.id}</IndexList.Cell>
      <IndexList.Cell>{dateTimeIfy(run.startedAt)}</IndexList.Cell>
      <IndexList.Cell></IndexList.Cell>
      <IndexList.Cell>
        <Button
          key={run.id}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Default}
          text="View Logs"
          onClick={() => {}}
        />
        {/* {this.renderLogOverlay} */}
      </IndexList.Cell>
    </IndexList.Row>
  )
}

export default FunctionRunsRow
