// Libraries
import React, {FC, useContext} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {
  ButtonType,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'

// Components
import {Button} from '@influxdata/clockface'
import {PipeContext} from 'src/flows/context/pipe'

// Utils
import {event} from 'src/cloud/utils/reporting'

const ExportTaskButton: FC = () => {
  const history = useHistory()
  const {data, queryText} = useContext(PipeContext)
  const {orgID, id} = useParams<{orgID: string; id: string}>()
  const onClick = () => {
    event('Export Task Clicked')
    history.push(`/orgs/${orgID}/flows/${id}/export-task`, [
      {bucket: data.bucket, queryText},
    ])
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
      titleText={
        data.bucket ? 'Export As Task' : 'Select a bucket to enable export'
      }
    />
  )
}

export default ExportTaskButton
