// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Actions
import {
  addEndpointLabel,
  deleteEndpointLabel,
  deleteEndpoint,
  updateEndpointProperties,
  cloneEndpoint,
} from 'src/notifications/endpoints/actions/thunks'

// Components
import {
  SlideToggle,
  ComponentSize,
  ResourceCard,
  FlexDirection,
  AlignItems,
  FlexBox,
} from '@influxdata/clockface'
import EndpointCardMenu from 'src/notifications/endpoints/components/EndpointCardMenu'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'
import {CopyResourceID} from 'src/shared/components/CopyResourceID'

// Constants
import {
  SEARCH_QUERY_PARAM,
  HISTORY_TYPE_QUERY_PARAM,
} from 'src/alerting/constants/history'

// Types
import {NotificationEndpoint, Label, AlertHistoryType} from 'src/types'

// Utilities
import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {getOrg} from 'src/organizations/selectors'

interface Props {
  endpoint: NotificationEndpoint
}

const EndpointCard: FC<Props> = ({endpoint}) => {
  const history = useHistory()
  const orgID = useSelector(getOrg).id
  const dispatch = useDispatch()
  const {id, name, description, activeStatus} = endpoint

  const handleUpdateName = (name: string) => {
    dispatch(updateEndpointProperties(id, {name}))
  }

  const handleClick = () => {
    history.push(`/orgs/${orgID}/alerting/endpoints/${id}/edit`)
  }

  const handleToggle = () => {
    const toStatus = activeStatus === 'active' ? 'inactive' : 'active'
    dispatch(updateEndpointProperties(id, {status: toStatus}))
  }

  const handleView = () => {
    const historyType: AlertHistoryType = 'notifications'

    const queryParams = new URLSearchParams({
      [HISTORY_TYPE_QUERY_PARAM]: historyType,
      [SEARCH_QUERY_PARAM]: `"notificationEndpointID" == "${id}"`,
    })

    history.push(`/orgs/${orgID}/alert-history?${queryParams}`)
  }
  const handleDelete = () => {
    dispatch(deleteEndpoint(id))
  }
  const handleClone = () => {
    dispatch(cloneEndpoint(endpoint))
  }
  const contextMenu = (
    <EndpointCardMenu
      onDelete={handleDelete}
      onView={handleView}
      onClone={handleClone}
    />
  )

  const handleAddEndpointLabel = (label: Label) => {
    dispatch(addEndpointLabel(id, label))
  }
  const handleRemoveEndpointLabel = (label: Label) => {
    dispatch(deleteEndpointLabel(id, label.id))
  }

  const handleUpdateDescription = (description: string) => {
    dispatch(updateEndpointProperties(id, {description}))
  }

  return (
    <ErrorBoundary>
      <ResourceCard
        key={id}
        contextMenu={contextMenu}
        disabled={activeStatus === 'inactive'}
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Large}
        testID={`endpoint-card ${name}`}
      >
        <SlideToggle
          active={activeStatus === 'active'}
          size={ComponentSize.ExtraSmall}
          onChange={handleToggle}
          testID="endpoint-card--slide-toggle"
        />
        <FlexBox
          direction={FlexDirection.Column}
          alignItems={AlignItems.FlexStart}
          margin={ComponentSize.Large}
        >
          <ResourceCard.EditableName
            key={id}
            name={name}
            onClick={handleClick}
            onUpdate={handleUpdateName}
            testID={`endpoint-card--name ${name}`}
            inputTestID="endpoint-card--input"
            buttonTestID="endpoint-card--name-button"
            noNameString="Name this notification endpoint"
          />
          <ResourceCard.EditableDescription
            onUpdate={handleUpdateDescription}
            description={description}
            placeholder={`Describe ${name}`}
          />
          <ResourceCard.Meta>
            <>
              {relativeTimestampFormatter(endpoint.updatedAt, 'Last updated ')}
            </>
            <CopyResourceID resource={endpoint} resourceName="Endpoint" />
          </ResourceCard.Meta>
          <InlineLabels
            selectedLabelIDs={endpoint.labels}
            onAddLabel={handleAddEndpointLabel}
            onRemoveLabel={handleRemoveEndpointLabel}
          />
        </FlexBox>
      </ResourceCard>
    </ErrorBoundary>
  )
}

export default EndpointCard
