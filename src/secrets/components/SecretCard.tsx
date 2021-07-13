// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'

// Components
import {AlignItems, FlexDirection, ResourceCard} from '@influxdata/clockface'
import SecretContextMenu from 'src/secrets/components/SecretContextMenu'
import ErrorBoundary from 'src/shared/components/ErrorBoundary'

// Types
import {Secret} from 'src/types'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {deleteSecret} from '../actions/thunks'

interface Props {
  secret: Secret
}

const SecretCard: FC<Props> = ({secret}) => {
  const dispatch = useDispatch()

  const handleDelete = () => {
    dispatch(deleteSecret(secret))
  }

  const history = useHistory()
  const orgId = useSelector(getOrg)?.id

  const editSecret = () => {
    history.push(`/orgs/${orgId}/settings/secrets/${secret.key}/edit`)
  }

  return (
    <ErrorBoundary>
      <ResourceCard
        testID={`secret-card--${secret?.key}`}
        contextMenu={
          <SecretContextMenu secret={secret} onDeleteSecret={handleDelete} />
        }
        direction={FlexDirection.Row}
        alignItems={AlignItems.Center}
      >
        <ResourceCard.Name
          name={secret?.key}
          testID={`secret-card--name-${secret?.key}`}
          onClick={editSecret}
        />
      </ResourceCard>
    </ErrorBoundary>
  )
}

export default SecretCard
