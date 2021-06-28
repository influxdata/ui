// Libraries
import React, {PureComponent} from 'react'

// Components
import {IndexList} from '@influxdata/clockface'

// Types
import {LogEvent} from 'src/types'
import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'
import {resolveTimeFormat} from 'src/visualization/utils/timeFormat'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'

interface Props {
  log: LogEvent
}

class RunLogRow extends PureComponent<Props> {
  constructor(props: Props) {
    super(props)
  }

  public render() {
    const {log} = this.props

    return (
      <IndexList.Row>
        <IndexList.Cell>
          <span className="run-logs--list-time">
            {this.dateTimeString(log.time)}
          </span>
        </IndexList.Cell>
        <IndexList.Cell>
          <span className="run-logs--list-message">{log.message}</span>
        </IndexList.Cell>
      </IndexList.Row>
    )
  }

  private dateTimeString(dt: string): string {
    if (!dt) {
      return ''
    }

    const newdate = new Date(dt)
    const formatted = createDateTimeFormatter(
      resolveTimeFormat(DEFAULT_TIME_FORMAT)
    ).format(newdate)

    return formatted
  }
}

export default RunLogRow
