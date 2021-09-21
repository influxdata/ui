// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {AlignItems, FlexDirection, ResourceCard} from '@influxdata/clockface'
import SecretContextMenu from 'src/secrets/components/SecretContextMenu'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Types
import {Secret} from 'src/types'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {event} from 'src/cloud/utils/reporting'

interface Props {
  secret: Secret
}

const SecretCard: FC<Props> = ({secret}) => {
  const history = useHistory()
  const orgId = useSelector(getOrg)?.id

  const editSecret = () => {
    event("Edit Secret Modal Opened")
    history.push(`/orgs/${orgId}/settings/secrets/${secret.id}/edit`)
  }

  return (
    <ErrorBoundary>
      <ResourceCard
        testID={`secret-card--${secret?.id}`}
        contextMenu={<SecretContextMenu secret={secret} />}
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
      >
        <ResourceCard.Name
          name={secret?.id}
          testID={`secret-card--name-${secret?.id}`}
          onClick={editSecret}
        />
      </ResourceCard>
    </ErrorBoundary>
  )
}

export default SecretCard
