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
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'

interface Props {
  run: FunctionRun
}

const FunctionRunsRow: FC<Props> = ({run}) => {
  const [overlayVisible, setOverlayVisibility] = useState(false)
  const dateTimeIfy = (dt: string): string => {
    if (!dt) {
      return ''
    }
    const newdate = new Date(dt)
    const formatter = createDateTimeFormatter(DEFAULT_TIME_FORMAT)
    const formatted = formatter.format(newdate)

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
