// Libraries
import React, {PureComponent, ReactElement} from 'react'

// Components
import {IndexList} from '@influxdata/clockface'

// Types
import {Run} from 'src/types'

// DateTime
import {DEFAULT_TIME_FORMAT} from 'src/utils/datetime/constants'
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'
import FluxEditorMonaco from 'src/shared/components/FluxMonacoEditor'

interface Props {
  run: Run
}

class RunLogRowFlux extends PureComponent<Props> {
  public render() {
    const {run} = this.props

    return (
      <IndexList.Row className="run-log--list-row">
        <IndexList.Cell>
          <span className="run-logs--list-time">
            {this.dateTimeString(run.startedAt)}
          </span>
        </IndexList.Cell>
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

export default RunLogRowFlux
