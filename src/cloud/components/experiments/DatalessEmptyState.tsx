// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  EmptyState,
  ComponentSize,
  ComponentColor,
  Button,
} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'
import {getAll} from 'src/resources/selectors'

// Types
import {AppState, Bucket, ResourceType} from 'src/types'

interface OwnProps {
  children: JSX.Element
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = OwnProps & ReduxProps

const DatalessEmptyState: FC<Props> = ({orgID, buckets, children}) => {
  const history = useHistory()

  const handleClientLibrary = (): void => {
    history.push(`/orgs/${orgID}/load-data/sources`)
  }

  // TODO: Replace with data loading flag from api if experiment is successful
  if (buckets.find(bucket => bucket.type === 'user')) {
    return children
  }

  return (
    <EmptyState size={ComponentSize.Large} className="dataless-empty-state">
      <div className="dataless-empty-state--image" />
      <EmptyState.Text>
        Looks like you haven’t{' '}
        <a
          href="https://docs.influxdata.com/influxdb/cloud/write-data/"
          className="dataless-empty-state--docs-link"
          target="blank"
        >
          written
        </a>{' '}
        any data yet, let’s get started.
      </EmptyState.Text>
      <Button
        text="Start Writing Data"
        onClick={handleClientLibrary}
        testID="dataless-empty-state--load-data-button"
        color={ComponentColor.Primary}
        size={ComponentSize.Large}
      />
    </EmptyState>
  )
}

const mstp = (state: AppState) => {
  const {id} = getOrg(state)
  const buckets = getAll<Bucket>(state, ResourceType.Buckets)

  return {
    orgID: id,
    buckets,
  }
}

const connector = connect(mstp)

export default connector(DatalessEmptyState)
