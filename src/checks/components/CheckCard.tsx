// Libraries
import React, {FC} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

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
import {notify} from 'src/shared/actions/notifications'
import {updateCheckFailed} from 'src/shared/copy/notifications'

// Types
import {Check, Label} from 'src/types'

// Utilities
import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

interface OwnProps {
  check: Check
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps & RouteComponentProps<{orgID: string}>

const CheckCard: FC<Props> = ({
  onRemoveCheckLabel,
  onAddCheckLabel,
  onCloneCheck,
  onNotify,
  check,
  onUpdateCheckDisplayProperties,
  deleteCheck,
  match: {
    params: {orgID},
  },
  history,
}) => {
  const {id, activeStatus, name, description} = check

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
    onAddCheckLabel(id, label)
  }

  const handleRemoveCheckLabel = (label: Label) => {
    onRemoveCheckLabel(id, label.id)
  }

  return (
    <ErrorBoundary>
      <ResourceCard
        key={`check-id--${id}`}
        testID="check-card"
        disabled={activeStatus === 'inactive'}
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Large}
        contextMenu={
          <CheckCardContext
            onView={onView}
            onDelete={onDelete}
            onClone={onClone}
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
          />
        </FlexBox>
        <FlexBox
          direction={FlexDirection.Column}
          margin={ComponentSize.Small}
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

export default connector(withRouter(CheckCard))
