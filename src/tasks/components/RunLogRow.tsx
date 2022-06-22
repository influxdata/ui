// Libraries
import React, {PureComponent, ReactElement} from 'react'

// Components
import {IndexList} from '@influxdata/clockface'

// Types
import {LogEvent} from 'src/types'

// DateTime
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'

interface Props {
  log?: LogEvent
}

class RunLogRow extends PureComponent<Props> {
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
          <span className="run-logs--list-message">
            <pre>{log.message}</pre>
          </span>
        </IndexList.Cell>
      </IndexList.Row>
    )
  }

  private dateTimeString(dt: string): ReactElement {
    if (!dt) {
      return null
    }

    return (
      <FormattedDateTime format={DEFAULT_TIME_FORMAT} date={new Date(dt)} />
    )
  }
}

export default RunLogRow
