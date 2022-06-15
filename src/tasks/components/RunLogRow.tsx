// Libraries
import React, {PureComponent, ReactElement} from 'react'

// Components
import {IndexList} from '@influxdata/clockface'

// Types
import {LogEvent, Run} from 'src/types'
import {CLOUD} from 'src/shared/constants'

// DateTime
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'
import FluxEditorMonaco from 'src/shared/components/FluxMonacoEditor'

interface Props {
  log?: LogEvent
  run: Run
  isFlux: boolean
}

class RunLogRow extends PureComponent<Props> {
  public render() {
    const {log, run, isFlux} = this.props

    if (!isFlux) {
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
    } else if (isFlux) {
      return (
        <IndexList.Row>
          <IndexList.Cell>
            <span className="run-logs--list-time">
              {this.dateTimeString(run.startedAt)}
            </span>
          </IndexList.Cell>
          {CLOUD && (
            <IndexList.Cell>
              <span className="run-logs--list-flux">
                <FluxEditorMonaco
                  script={run.flux}
                  variables={[]}
                  onChangeScript={() => {}}
                  readOnly
                />
              </span>
            </IndexList.Cell>
          )}
        </IndexList.Row>
      )
    }
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
