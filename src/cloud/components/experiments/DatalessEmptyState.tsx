// Libraries
import React, {FC} from 'react'
import {useHistory} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {get} from 'lodash'

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
import {runQuery} from 'src/shared/apis/query'

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

  const userHasData = (): boolean  => {
    const userBuckets = buckets.filter(bucket => bucket.type === 'user')

    userBuckets.forEach(async (bucket): Promise<boolean> => {
      const cardinality = await checkBucketCardinality(bucket["name"])
      if (cardinality > 0) {
        return true
      }
    })
    
    return false
  }

  const checkBucketCardinality = async (bucketName): Promise<number> => {
    const cardinalityQuery = `
      import "influxdata/influxdb"
      influxdb.cardinality(bucket: "${bucketName}", start: -14d)
    `

    return await runQuery(orgID, cardinalityQuery).promise
    .then(res => {
      const table = get(res, 'csv', '1')
      const cardinality = Number(table.substr(table.lastIndexOf(',') + 1))
      return cardinality
    })
    .catch(error => {
      throw new Error (error)
    })
  }

  // TODO: Replace with analytics data flag if experiment is successful
  if (userHasData()) {
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
