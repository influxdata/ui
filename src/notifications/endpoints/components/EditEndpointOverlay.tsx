// Libraries
import React, {FC} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory, useParams} from 'react-router-dom'

// Constants
import {getEndpointFailed} from 'src/shared/copy/notifications'

// Actions
import {updateEndpoint} from 'src/notifications/endpoints/actions/thunks'
import {notify} from 'src/shared/actions/notifications'

// Components
import {Overlay} from '@influxdata/clockface'
import {EndpointOverlayProvider} from 'src/notifications/endpoints/components/EndpointOverlayProvider'
import EndpointOverlayContents from 'src/notifications/endpoints/components/EndpointOverlayContents'

// Types
import {NotificationEndpoint, AppState, ResourceType} from 'src/types'

// Utils
import {getByID} from 'src/resources/selectors'
import {getOrg} from 'src/organizations/selectors'

const EditEndpointOverlay: FC = () => {
  const dispatch = useDispatch()
  const {endpointID} = useParams<{endpointID: string}>()
  const endpoint = useSelector((state: AppState) => {
    return getByID<NotificationEndpoint>(
      state,
      ResourceType.NotificationEndpoints,
      endpointID
    )
  })

  const orgID = useSelector(getOrg).id
  const history = useHistory()
  const handleDismiss = () => {
    history.push(`/orgs/${orgID}/alerting`)
  }

  if (!endpoint) {
    dispatch(notify(getEndpointFailed(endpointID)))
    handleDismiss()
    return null
  }

  const handleEditEndpoint = (endpoint: NotificationEndpoint) => {
    dispatch(updateEndpoint(endpoint))

    handleDismiss()
  }

  return (
    <EndpointOverlayProvider initialState={endpoint}>
      <Overlay visible={true}>
        <Overlay.Container maxWidth={600}>
          <Overlay.Header
            title="Edit a Notification Endpoint"
            onDismiss={handleDismiss}
          />
          <Overlay.Body />
          <EndpointOverlayContents
            onSave={handleEditEndpoint}
            onCancel={handleDismiss}
            saveButtonText="Edit Notification Endpoint"
          />
        </Overlay.Container>
      </Overlay>
    </EndpointOverlayProvider>
  )
}

export default EditEndpointOverlay
