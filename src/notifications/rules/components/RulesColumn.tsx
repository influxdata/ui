// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Types
import {
  NotificationEndpoint,
  NotificationRuleDraft,
  AppState,
  ResourceType,
} from 'src/types'

// Components
import {
  Button,
  IconFont,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import NotificationRuleCards from 'src/notifications/rules/components/RuleCards'
import AlertsColumn from 'src/alerting/components/AlertsColumn'

// Selectors
import {getAll} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  tabIndex: number
}

const NotificationRulesColumn: FC<Props> = ({tabIndex}) => {
  const history = useHistory()
  const org = useSelector(getOrg)
  const rules = useSelector((state: AppState) =>
    getAll<NotificationRuleDraft>(state, ResourceType.NotificationRules)
  )

  const endpoints = useSelector((state: AppState) =>
    getAll<NotificationEndpoint>(state, ResourceType.NotificationEndpoints)
  )

  const handleOpenOverlay = () => {
    history.push(`/orgs/${org.id}/alerting/rules/new`)
  }

  const tooltipContents = (
    <>
      A <strong>Notification Rule</strong> will query statuses
      <br />
      written by <strong>Checks</strong> to determine if a
      <br />
      notification should be sent to a
      <br />
      <strong>Notification Endpoint</strong>
      <br />
      <br />
      <a
        href="https://v2.docs.influxdata.com/v2.0/monitor-alert/notification-rules/create"
        target="_blank"
      >
        Read Documentation
      </a>
    </>
  )

  const buttonStatus = !!endpoints.length
    ? ComponentStatus.Default
    : ComponentStatus.Disabled

  const buttonTitleText = !!endpoints.length
    ? 'Create a Notification Rule'
    : 'You need at least 1 Notifcation Endpoint to create a Notification Rule'

  const createButton = (
    <Button
      color={ComponentColor.Secondary}
      text="Create"
      onClick={handleOpenOverlay}
      testID="create-rule"
      icon={IconFont.Plus}
      status={buttonStatus}
      titleText={buttonTitleText}
    />
  )

  return (
    <AlertsColumn
      type={ResourceType.NotificationRules}
      title="Notification Rules"
      createButton={createButton}
      questionMarkTooltipContents={tooltipContents}
      tabIndex={tabIndex}
    >
      {searchTerm => (
        <NotificationRuleCards rules={rules} searchTerm={searchTerm} />
      )}
    </AlertsColumn>
  )
}

export default NotificationRulesColumn
