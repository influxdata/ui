// Libraries
import React, {MouseEvent, FC} from 'react'
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
import CheckCardContext from 'src/checks/components/CheckCardContext'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'
import LastRunTaskStatus from 'src/shared/components/lastRunTaskStatus/LastRunTaskStatus'
import {CopyResourceID, CopyTaskID} from 'src/shared/components/CopyResourceID'

// Constants
import {DEFAULT_CHECK_NAME} from 'src/alerting/constants'
import {SEARCH_QUERY_PARAM} from 'src/alerting/constants/history'

// Actions and Selectors
import {
  updateCheckDisplayProperties,
  deleteCheck,
  addCheckLabel,
  deleteCheckLabel,
  cloneCheck,
} from 'src/checks/actions/thunks'

// Notifications
import {notify} from 'src/shared/actions/notifications'
import {
  updateCheckFailed,
  editCheckCodeWarning,
} from 'src/shared/copy/notifications'

// Types
import {Check, Label} from 'src/types'

// Utilities
import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {event} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {shouldOpenLinkInNewTab} from 'src/utils/crossPlatform'
import {safeBlankLinkOpen} from 'src/utils/safeBlankLinkOpen'
import {getOrg} from 'src/organizations/selectors'

interface OwnProps {
  check: Check
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const CheckCard: FC<Props> = ({
  onRemoveCheckLabel,
  onAddCheckLabel,
  onCloneCheck,
  onNotify,
  check,
  onUpdateCheckDisplayProperties,
  deleteCheck,
}) => {
  const history = useHistory()
  const orgID = useSelector(getOrg).id
  const {activeStatus, description, id, name, taskID} = check

  const checkUrl = `/orgs/${orgID}/alerting/checks/${id}/edit`

  const onUpdateName = (name: string) => {
    try {
      onUpdateCheckDisplayProperties(check.id, {name})
    } catch (error) {
      onNotify(updateCheckFailed(error.message))
    }
  }

  const onUpdateDescription = (description: string) => {
    try {
      onUpdateCheckDisplayProperties(check.id, {description})
    } catch (e) {
      onNotify(updateCheckFailed(e.message))
    }
  }

  const onDelete = () => {
    deleteCheck(check.id)
  }

  const onClone = () => {
    onCloneCheck(check)
  }

  const onToggle = () => {
    const status = activeStatus === 'active' ? 'inactive' : 'active'

    try {
      onUpdateCheckDisplayProperties(id, {status})
    } catch (error) {
      onNotify(updateCheckFailed(error.message))
    }
  }

  const onCheckClick = (event: MouseEvent) => {
    if (shouldOpenLinkInNewTab(event)) {
      safeBlankLinkOpen(checkUrl)
    } else {
      history.push(checkUrl)
    }
  }

  const onView = () => {
    const queryParams = new URLSearchParams({
      [SEARCH_QUERY_PARAM]: `"checkID" == "${id}"`,
    })

    history.push(`/orgs/${orgID}/checks/${id}/?${queryParams}`)
  }

  const handleAddCheckLabel = (label: Label) => {
    onAddCheckLabel(id, label)
  }

  const handleRemoveCheckLabel = (label: Label) => {
    onRemoveCheckLabel(id, label.id)
  }

  const onEditTask = () => {
    history.push(`/orgs/${orgID}/tasks/${check.taskID}/edit`)
    onNotify(editCheckCodeWarning())
  }

  return (
    <ErrorBoundary>
      <ResourceCard
        key={`check-id--${id}`}
        testID={`check-card ${name}`}
        disabled={activeStatus === 'inactive'}
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Large}
        contextMenu={
          <CheckCardContext
            onView={onView}
            onDelete={onDelete}
            onClone={onClone}
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
            testID="check-card--slide-toggle"
            style={{flexBasis: '16px'}}
          />
          <LastRunTaskStatus
            key={2}
            lastRunError={check.lastRunError}
            lastRunStatus={check.lastRunStatus}
            statusButtonClickHandler={() => {
              event('check status button clicked', {
                lastRunError: check.lastRunError,
                lastRunStatus: check.lastRunStatus,
                from: 'alert card',
              })
              if (isFlagEnabled('navToTaskRuns')) {
                history.push(`/orgs/${orgID}/tasks/${check.taskID}/runs`)
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
            onClick={onCheckClick}
            name={check.name}
            noNameString={DEFAULT_CHECK_NAME}
            testID="check-card--name"
            buttonTestID="check-card--name-button"
            inputTestID="check-card--input"
            href={checkUrl}
          />
          <ResourceCard.EditableDescription
            onUpdate={onUpdateDescription}
            description={description}
            placeholder={`Describe ${name}`}
          />
          <ResourceCard.Meta>
            <>Last completed at {check.latestCompleted}</>
            <>{relativeTimestampFormatter(check.updatedAt, 'Last updated ')}</>
            <CopyResourceID resource={check} resourceName="Check" />
            <CopyTaskID taskID={taskID} />
          </ResourceCard.Meta>
          <InlineLabels
            selectedLabelIDs={check.labels}
            onAddLabel={handleAddCheckLabel}
            onRemoveLabel={handleRemoveCheckLabel}
          />
        </FlexBox>
      </ResourceCard>
    </ErrorBoundary>
  )
}

const mdtp = {
  onUpdateCheckDisplayProperties: updateCheckDisplayProperties,
  deleteCheck: deleteCheck,
  onAddCheckLabel: addCheckLabel,
  onRemoveCheckLabel: deleteCheckLabel,
  onCloneCheck: cloneCheck,
  onNotify: notify,
}

const connector = connect(null, mdtp)

export default connector(CheckCard)
