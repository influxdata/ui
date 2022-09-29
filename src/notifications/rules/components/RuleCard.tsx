// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Components
import {
  SlideToggle,
  ComponentSize,
  ResourceCard,
  FlexBox,
  FlexDirection,
  AlignItems,
  JustifyContent,
} from '@influxdata/clockface'
import NotificationRuleCardContext from 'src/notifications/rules/components/RuleCardContext'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'
import LastRunTaskStatus from 'src/shared/components/lastRunTaskStatus/LastRunTaskStatus'
import {CopyResourceID, CopyTaskID} from 'src/shared/components/CopyResourceID'

// Constants
import {DEFAULT_NOTIFICATION_RULE_NAME} from 'src/alerting/constants'
import {
  SEARCH_QUERY_PARAM,
  HISTORY_TYPE_QUERY_PARAM,
} from 'src/alerting/constants/history'

// Actions and Selectors
import {
  updateRuleProperties,
  deleteRule,
  addRuleLabel,
  deleteRuleLabel,
  cloneRule,
} from 'src/notifications/rules/actions/thunks'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {editNotificationRuleCodeWarning} from 'src/shared/copy/notifications'

// Types
import {NotificationRuleDraft, Label, AlertHistoryType} from 'src/types'

// Utilities
import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getOrg} from 'src/organizations/selectors'

interface OwnProps {
  rule: NotificationRuleDraft
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const RuleCard: FC<Props> = ({
  rule,
  onUpdateRuleProperties,
  deleteNotificationRule,
  onCloneRule,
  onNotify,
  onAddRuleLabel,
  onRemoveRuleLabel,
}) => {
  const {
    activeStatus,
    description,
    id,
    lastRunError,
    lastRunStatus,
    latestCompleted,
    name,
    taskID,
  } = rule
  const history = useHistory()
  const orgID = useSelector(getOrg).id

  const onUpdateName = (name: string) => {
    onUpdateRuleProperties(id, {name})
  }

  const onUpdateDescription = (description: string) => {
    onUpdateRuleProperties(id, {description})
  }

  const onDelete = () => {
    deleteNotificationRule(id)
  }

  const onClone = () => {
    onCloneRule(rule)
  }

  const onToggle = () => {
    const status = activeStatus === 'active' ? 'inactive' : 'active'

    onUpdateRuleProperties(id, {status})
  }

  const onRuleClick = () => {
    history.push(`/orgs/${orgID}/alerting/rules/${id}/edit`)
  }

  const onView = () => {
    const historyType: AlertHistoryType = 'notifications'

    const queryParams = new URLSearchParams({
      [HISTORY_TYPE_QUERY_PARAM]: historyType,
      [SEARCH_QUERY_PARAM]: `"notificationRuleID" == "${id}"`,
    })

    history.push(`/orgs/${orgID}/alert-history?${queryParams}`)
  }

  const onEditTask = () => {
    history.push(`/orgs/${orgID}/tasks/${rule.taskID}/edit`)
    onNotify(editNotificationRuleCodeWarning())
  }

  const handleAddRuleLabel = (label: Label) => {
    onAddRuleLabel(id, label)
  }

  const handleRemoveRuleLabel = (label: Label) => {
    onRemoveRuleLabel(id, label.id)
  }

  return (
    <ErrorBoundary>
      <ResourceCard
        key={`rule-id--${id}`}
        testID={`rule-card ${name}`}
        disabled={activeStatus === 'inactive'}
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Large}
        contextMenu={
          <NotificationRuleCardContext
            onView={onView}
            onClone={onClone}
            onDelete={onDelete}
            onEditTask={onEditTask}
          />
        }
      >
        <FlexBox
          direction={FlexDirection.Column}
          justifyContent={JustifyContent.Center}
          margin={ComponentSize.Medium}
          alignItems={AlignItems.FlexStart}
        >
          <SlideToggle
            active={activeStatus === 'active'}
            size={ComponentSize.ExtraSmall}
            onChange={onToggle}
            testID="rule-card--slide-toggle"
            style={{flexBasis: '16px'}}
          />
          <LastRunTaskStatus
            key={2}
            lastRunError={lastRunError}
            lastRunStatus={lastRunStatus}
            statusButtonClickHandler={() => {
              event('check status button clicked', {
                lastRunError,
                lastRunStatus,
                from: 'rules card',
              })
              if (isFlagEnabled('navToTaskRuns')) {
                history.push(`/orgs/${orgID}/tasks/${taskID}/runs`)
              }
            }}
          />
        </FlexBox>
        <FlexBox
          direction={FlexDirection.Column}
          margin={ComponentSize.Large}
          alignItems={AlignItems.FlexStart}
        >
          <ResourceCard.EditableName
            onUpdate={onUpdateName}
            onClick={onRuleClick}
            name={name}
            noNameString={DEFAULT_NOTIFICATION_RULE_NAME}
            testID="rule-card--name"
            buttonTestID="rule-card--name-button"
            inputTestID="rule-card--input"
          />
          <ResourceCard.EditableDescription
            onUpdate={onUpdateDescription}
            description={description}
            placeholder={`Describe ${name}`}
          />
          <ResourceCard.Meta>
            <>Last completed at {latestCompleted}</>
            <>{relativeTimestampFormatter(rule.updatedAt, 'Last updated ')}</>
            <CopyResourceID resource={rule} resourceName="Rule" />
            <CopyTaskID taskID={taskID} />
          </ResourceCard.Meta>
          <InlineLabels
            selectedLabelIDs={rule.labels}
            onAddLabel={handleAddRuleLabel}
            onRemoveLabel={handleRemoveRuleLabel}
          />
        </FlexBox>
      </ResourceCard>
    </ErrorBoundary>
  )
}

const mdtp = {
  onUpdateRuleProperties: updateRuleProperties,
  deleteNotificationRule: deleteRule,
  onAddRuleLabel: addRuleLabel,
  onRemoveRuleLabel: deleteRuleLabel,
  onCloneRule: cloneRule,
  onNotify: notify,
}

const connector = connect(null, mdtp)

export default connector(RuleCard)
