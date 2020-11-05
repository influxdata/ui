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

const ExportDashboardButton: FC = () => {
  const history = useHistory()
  const {data, queryText} = useContext(PipeContext)
  const {orgID, id} = useParams<{orgID: string; id: string}>()
  const onClick = () => {
    event('Export to Dashboard Clicked')
    history.push(`/orgs/${orgID}/flows/${id}/export-dashboard`, [
      {bucket: data.bucket, queryText, properties: data.properties},
    ])
  }
  return (
    <Button
      text="Export to Dashboard"
      color={ComponentColor.Success}
      type={ButtonType.Submit}
      onClick={onClick}
      status={ComponentStatus.Default}
      testID="flow-export--dashboard"
      style={{opacity: 1}}
      titleText="Export to Dashboard"
    />
  )
}

export default ExportDashboardButton
