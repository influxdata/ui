// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {Button, IconFont, ComponentColor} from '@influxdata/clockface'
import EndpointCards from 'src/notifications/endpoints/components/EndpointCards'
import AlertsColumn from 'src/alerting/components/AlertsColumn'
import {AppState, NotificationEndpoint, ResourceType} from 'src/types'

// Utils
import {getAll} from 'src/resources/selectors'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  tabIndex: number
}

const EndpointsColumn: FC<Props> = ({tabIndex}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const endpoints = useSelector((state: AppState) =>
    getAll<NotificationEndpoint>(state, ResourceType.NotificationEndpoints)
  )
  const handleOpenOverlay = () => {
    history.push(`/orgs/${org.id}/alerting/endpoints/new`)
  }

  const conditionalEndpoints: Array<string> = []
  if (isFlagEnabled('notification-endpoint-telegram')) {
    conditionalEndpoints.push('Telegram')
  }

  const tooltipContents = (
    <>
      A <strong>Notification Endpoint</strong> stores the information to connect
      <br />
      to a third party service that can receive notifications
      <br />
      like Slack, PagerDuty, {conditionalEndpoints.join(', ')}or an HTTP server
      <br />
      <br />
      <a
        href="https://v2.docs.influxdata.com/v2.0/monitor-alert/notification-endpoints/create"
        target="_blank"
      >
        Read Documentation
      </a>
    </>
  )

  const createButton = (
    <Button
      color={ComponentColor.Secondary}
      text="Create"
      onClick={handleOpenOverlay}
      testID="create-endpoint"
      icon={IconFont.Plus}
    />
  )

  return (
    <AlertsColumn
      type={ResourceType.NotificationEndpoints}
      title="Notification Endpoints"
      createButton={createButton}
      questionMarkTooltipContents={tooltipContents}
      tabIndex={tabIndex}
    >
      {searchTerm => (
        <EndpointCards endpoints={endpoints} searchTerm={searchTerm} />
      )}
    </AlertsColumn>
  )
}

export default EndpointsColumn
