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
import ExportDashboardOverlay from 'src/flows/pipes/Visualization/ExportDashboardOverlay'

// Utils
import {event} from 'src/cloud/utils/reporting'

const ExportDashboardButton: FC = () => {
  const {data, range, queryText} = useContext(PipeContext)
  const {launch} = useContext(PopupContext)
  const onClick = () => {
    event('Export to Dashboard Clicked')

    launch(<ExportDashboardOverlay />, {
      properties: data.properties,
      range: range,
      query: queryText,
    })
  }

  const status = data.queryText
    ? ComponentStatus.Disabled
    : ComponentStatus.Default

  return (
    <Button
      text="Export to Dashboard"
      color={ComponentColor.Success}
      type={ButtonType.Submit}
      onClick={onClick}
      status={status}
      testID="flow-export--dashboard"
      style={{opacity: 1}}
      titleText="Export to Dashboard"
      icon={IconFont.Export}
    />
  )
}

export default ExportDashboardButton
