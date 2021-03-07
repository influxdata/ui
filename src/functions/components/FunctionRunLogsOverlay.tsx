// Libraries
import React, {FC} from 'react'
import _ from 'lodash'

// Components
import {Overlay, IndexList, DapperScrollbars} from '@influxdata/clockface'
import FunctionRunLogRow from 'src/functions/components/FunctionRunLogRow'

// Types
import {FunctionRunLog} from 'src/client/managedFunctionsRoutes'

interface Props {
  onDismissOverlay: () => void
  logs: FunctionRunLog[]
}

const FunctionRunLogsOverlay: FC<Props> = ({onDismissOverlay, logs}) => {
  return (
    <Overlay.Container className="run-logs--list">
      <Overlay.Header title="Function Run Logs" onDismiss={onDismissOverlay} />
      <Overlay.Body>
        <DapperScrollbars autoSizeHeight={true} style={{maxHeight: '700px'}}>
          <IndexList>
            <IndexList.Header>
              <IndexList.HeaderCell columnName="Time" width="10%" />
              <IndexList.HeaderCell columnName="Severity" width="10%" />
              <IndexList.HeaderCell columnName="Message" width="80%" />
            </IndexList.Header>
            <IndexList.Body emptyState={<></>} columnCount={2}>
              {logs.map((l, i) => (
                <FunctionRunLogRow
                  key={i}
                  message={l.message}
                  timestamp={l.timestamp}
                  severity={l.severity}
                />
              ))}
            </IndexList.Body>
          </IndexList>
        </DapperScrollbars>
      </Overlay.Body>
    </Overlay.Container>
  )
}

export default FunctionRunLogsOverlay
