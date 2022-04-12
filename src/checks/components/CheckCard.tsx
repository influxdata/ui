// Libraries
import React, {FC} from 'react'
import {useParams, useHistory} from 'react-router-dom'
import {useDispatch} from 'react-redux'

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

interface Props {
  check: Check
}

const CheckCard: FC<Props> = ({check}) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()
  const {activeStatus, description, id, name, taskID} = check

  const onUpdateName = (name: string) => {
    try {
      dispatch(updateCheckDisplayProperties(check.id, {name}))
    } catch (error) {
      dispatch(notify(updateCheckFailed(error.message)))
    }
  }

  const onUpdateDescription = (description: string) => {
    try {
      dispatch(updateCheckDisplayProperties(check.id, {description}))
    } catch (e) {
      dispatch(notify(updateCheckFailed(e.message)))
    }
  }

  const onDelete = () => {
    dispatch(deleteCheck(check.id))
  }

  const onClone = () => {
    dispatch(cloneCheck(check))
  }

  const onToggle = () => {
    const status = activeStatus === 'active' ? 'inactive' : 'active'

    try {
      dispatch(updateCheckDisplayProperties(id, {status}))
    } catch (error) {
      dispatch(notify(updateCheckFailed(error.message)))
    }
  }

  const onCheckClick = () => {
    history.push(`/orgs/${orgID}/alerting/checks/${id}/edit`)
  }

  const onView = () => {
    const queryParams = new URLSearchParams({
      [SEARCH_QUERY_PARAM]: `"checkID" == "${id}"`,
    })

    history.push(`/orgs/${orgID}/checks/${id}/?${queryParams}`)
  }

  const handleAddCheckLabel = (label: Label) => {
    dispatch(addCheckLabel(id, label))
  }

  const handleRemoveCheckLabel = (label: Label) => {
    dispatch(deleteCheckLabel(id, label.id))
  }

  const onEditTask = () => {
    history.push(`/orgs/${orgID}/tasks/${check.taskID}/edit`)
    dispatch(notify(editCheckCodeWarning()))
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

export default CheckCard
