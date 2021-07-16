// Libraries
import React, {FC, useState} from 'react'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  IndexList,
  Overlay,
} from '@influxdata/clockface'
import FunctionRunLogsOverlay from 'src/functions/components/FunctionRunLogsOverlay'

// Types
import {FunctionRun} from 'src/client/managedFunctionsRoutes'
import {DEFAULT_TIME_FORMAT} from 'src/shared/constants'

// Utils
import {FormattedDateTime} from 'src/utils/datetime/FormattedDateTime'

interface Props {
  run: FunctionRun
}

const FunctionRunsRow: FC<Props> = ({run}) => {
  const [overlayVisible, setOverlayVisibility] = useState(false)

  return (
    <IndexList.Row>
      <IndexList.Cell>{run.status}</IndexList.Cell>
      <IndexList.Cell>{run.id}</IndexList.Cell>
      <IndexList.Cell>
        <FormattedDateTime
          format={DEFAULT_TIME_FORMAT}
          date={new Date(run.startedAt)}
        />
      </IndexList.Cell>
      <IndexList.Cell></IndexList.Cell>
      <IndexList.Cell>
        <Button
          key={run.id}
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Default}
          text="View Logs"
          onClick={() => setOverlayVisibility(true)}
        />
        <Overlay visible={overlayVisible}>
          <FunctionRunLogsOverlay
            onDismissOverlay={() => setOverlayVisibility(false)}
            logs={run.logs || []}
          />
          <></>
        </Overlay>
      </IndexList.Cell>
    </IndexList.Row>
  )
}

export default FunctionRunsRow
