// Libraries
import React, {FC, useContext} from 'react'
import {
  ButtonType,
  ComponentColor,
  ComponentStatus,
  IconFont,
} from '@influxdata/clockface'

// Components
import {Button} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'
import {PopupContext} from 'src/flows/context/popup'
import ExportTaskOverlay from 'src/flows/pipes/Schedule/ExportTaskOverlay'

// Utils
import {event} from 'src/cloud/utils/reporting'

const ExportTaskButton: FC = () => {
  const {data, range} = useContext(PipeContext)
  const {launch} = useContext(PopupContext)

  const onClick = () => {
    event('Export Task Clicked', {from: 'schedule'})
    launch(<ExportTaskOverlay />, {
      bucket: data.bucket,
      query: data.query,
      range,
    })
  }

  return (
    <Button
      text="Export as Task"
      color={ComponentColor.Success}
      type={ButtonType.Submit}
      onClick={onClick}
      status={ComponentStatus.Default}
      testID="task-form-save"
      style={{opacity: 1}}
      icon={IconFont.Export}
      titleText="Export As Task"
    />
  )
}

export default ExportTaskButton
