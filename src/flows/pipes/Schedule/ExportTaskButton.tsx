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

interface Props {
  text: string
  type: string
  generate?: () => string
}

const ExportTaskButton: FC<Props> = ({text, type, generate}) => {
  const {data, range} = useContext(PipeContext)
  const {launch} = useContext(PopupContext)

  const onClick = () => {
    event('Export Task Clicked', {from: type})
    launch(<ExportTaskOverlay text={text} type={type} />, {
      bucket: data.bucket,
      query: generate ? generate() : data.query,
      range,
    })
  }

  return (
    <Button
      text={text}
      color={ComponentColor.Success}
      type={ButtonType.Submit}
      onClick={onClick}
      status={ComponentStatus.Default}
      testID="task-form-save"
      style={{opacity: 1}}
      icon={IconFont.Export_New}
      titleText={text}
    />
  )
}

export default ExportTaskButton
