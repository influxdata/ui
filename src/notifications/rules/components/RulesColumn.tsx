// Libraries
import React, {FunctionComponent} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Types
import {ResourceType} from 'src/types'

// Components
import {
  Button,
  IconFont,
  ComponentColor,
  ComponentStatus,
} from '@influxdata/clockface'
import NotificationRuleCards from 'src/notifications/rules/components/RuleCards'
import AlertsColumn from 'src/alerting/components/AlertsColumn'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

// Selectors
import {getAllActiveEndpoints} from 'src/notifications/endpoints/selectors'
import {getAllRules} from 'src/notifications/rules/selectors'

// Utils
import {event} from 'src/cloud/utils/reporting'

interface Props {
  tabIndex: number
}

const NotificationRulesColumn: FunctionComponent<Props> = ({
  tabIndex,
}) => {
  const dispatch = useDispatch()
  const endpoints = useSelector(getAllActiveEndpoints)
  const rules = useSelector(getAllRules)

  const handleOpenOverlay = () => {
    event('Create Notification Rule opened')
    dispatch(
      showOverlay('create-rule', null, () => dispatch(dismissOverlay()))
    )
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
        href={`https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/monitor-alert/notification-rules/create/`}
        target="_blank"
        rel="noreferrer"
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
      color={ComponentColor.Primary}
      text="Create"
      onClick={handleOpenOverlay}
      testID="create-rule"
      icon={IconFont.Plus_New}
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
