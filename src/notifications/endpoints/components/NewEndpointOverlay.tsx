// Libraries
import React, {FC, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useHistory} from 'react-router-dom'

// Actions
import {createEndpoint} from 'src/notifications/endpoints/actions/thunks'

// Components
import {Overlay} from '@influxdata/clockface'
import {EndpointOverlayProvider} from 'src/notifications/endpoints/components/EndpointOverlayProvider'
import EndpointOverlayContents from 'src/notifications/endpoints/components/EndpointOverlayContents'

// Constants
import {NEW_ENDPOINT_DRAFT} from 'src/alerting/constants'
import {NotificationEndpoint} from 'src/types'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'
import {getOrg} from 'src/organizations/selectors'

const NewRuleOverlay: FC = () => {
  const dispatch = useDispatch()
  const orgID = useSelector(getOrg).id
  const history = useHistory()

  const handleDismiss = () => {
    history.push(`/orgs/${orgID}/alerting`)
  }

  const handleCreateEndpoint = (endpoint: NotificationEndpoint) => {
    dispatch(createEndpoint(endpoint))
    handleDismiss()
  }

  const initialState = useMemo(() => ({...NEW_ENDPOINT_DRAFT, orgID}), [orgID])

  return (
    <EndpointOverlayProvider initialState={initialState}>
      <Overlay visible={true}>
        <Overlay.Container maxWidth={666}>
          <ErrorBoundary>
            <Overlay.Header
              title="Create a Notification Endpoint"
              onDismiss={handleDismiss}
            />
            <EndpointOverlayContents
              onSave={handleCreateEndpoint}
              onCancel={handleDismiss}
              saveButtonText="Create Notification Endpoint"
            />
          </ErrorBoundary>
        </Overlay.Container>
      </Overlay>
    </EndpointOverlayProvider>
  )
}

export default NewRuleOverlay
