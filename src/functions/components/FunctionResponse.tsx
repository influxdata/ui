// Libraries
import React, {FC} from 'react'

// Components
import {
  Columns,
  Grid,
  Panel,
  Gradients,
  AlignItems,
  DapperScrollbars,
} from '@influxdata/clockface'

// Types
import {FunctionTriggerResponse} from 'src/client/managedFunctionsRoutes'

interface Props {
  triggerResponse: FunctionTriggerResponse
}

const FunctionResponse: FC<Props> = ({
  triggerResponse: {status, logs, response, error},
}) => {
  const statusText = status === 'ok' ? 'success!' : 'error'

  const dataOutput = () => {
    if (response && response.data) {
      return (
        <>
          <pre>{JSON.stringify(response.data, null, '\t')}</pre> <p></p>
        </>
      )
    }
  }

  const logsOutput = () => {
    if (logs && logs.length > 0) {
      return logs.map(l => {
        return (
          <div key={l.timestamp}>
            <div>severity: {JSON.stringify(l.severity)}</div>
            <div>timestamp: {JSON.stringify(l.timestamp)}</div>
            <div>message: {JSON.stringify(l.message)}</div>
          </div>
        )
      })
    }
  }

  return (
    <Grid.Row>
      <Grid.Column widthXS={Columns.Twelve}>
        <Panel
          gradient={
            status == 'ok' ? Gradients.TropicalTourist : Gradients.DangerLight
          }
          border={true}
        >
          <DapperScrollbars
            className="function-form--response-scroll-bar"
            autoHide={true}
            autoSizeHeight={true}
          >
            <Panel.Header>
              <h5>{statusText}</h5>
            </Panel.Header>
            <Panel.Body alignItems={AlignItems.FlexStart}>
              {status == 'ok' ? (
                <>
                  {dataOutput()}
                  {logsOutput()}
                </>
              ) : (
                <div>{JSON.stringify(error, null, '\t')}</div>
              )}
            </Panel.Body>
          </DapperScrollbars>
        </Panel>
      </Grid.Column>
    </Grid.Row>
  )
}

export default FunctionResponse
