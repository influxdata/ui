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
import ExportTaskOverlay from 'src/flows/pipes/ToBucket/ExportTaskOverlay'

// Utils
import {event} from 'src/cloud/utils/reporting'

const ExportTaskButton: FC = () => {
  const {data, queryText} = useContext(PipeContext)
  const {launch} = useContext(PopupContext)

  const onClick = () => {
    event('Export Task Clicked')
    launch(<ExportTaskOverlay />, {
      bucket: data.bucket,
      query: queryText,
    })
  }

  return (
    <Button
      text="Export as Task"
      color={ComponentColor.Success}
      type={ButtonType.Submit}
      onClick={onClick}
      status={data.bucket ? ComponentStatus.Default : ComponentStatus.Disabled}
      testID="task-form-save"
      style={{opacity: 1}}
      icon={IconFont.Export}
      titleText={
        data.bucket ? 'Export As Task' : 'Select a bucket to enable export'
      }
    />
  )
}

export default ExportTaskButton
