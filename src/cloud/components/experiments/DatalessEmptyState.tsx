// Libraries
import React, {FC, useEffect, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {get} from 'lodash'

// Components
import {
  Button,
  EmptyState,
  TechnoSpinner,
  ComponentSize,
  ComponentColor,
  RemoteDataState,
  SpinnerContainer,
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
  const [userHasData, setUserHasData] = useState<boolean | null>(null)
  const loading =
    typeof userHasData === 'boolean'
      ? RemoteDataState.Done
      : RemoteDataState.NotStarted

  useEffect(() => {
    checkUserHasData()
      .then(result => {
        setUserHasData(result)
      })
      .catch(error => {
        setUserHasData(true)
        throw new Error(error)
      })
  }, [buckets])

  const checkBucketsHaveData = async (
    userBuckets,
    predicate
  ): Promise<boolean> => {
    for (const bucket of userBuckets) {
      if (await predicate(bucket)) {
        return true
      }
    }
    return false
  }

  const checkBucketCardinality = (bucketName): Promise<number> => {
    const cardinalityQuery = `
    import "influxdata/influxdb"
    influxdb.cardinality(bucket: "${bucketName}", start: -14d)
    `

    return runQuery(orgID, cardinalityQuery)
      .promise.then(res => {
        const table = get(res, 'csv', '1')
        const cardinality = Number(table.substr(table.lastIndexOf(',') + 1))
        return cardinality
      })
      .catch(error => {
        throw new Error(error)
      })
  }

  const checkUserHasData = async (): Promise<boolean> => {
    const userBuckets = buckets.filter(bucket => bucket.type === 'user')

    if (userBuckets.length > 4) {
      return true
    }

    const result = await checkBucketsHaveData(userBuckets, async bucket => {
      return (await checkBucketCardinality(bucket['name'])) > 0
    })

    return result
  }

  const handleClickLoadData = (): void => {
    history.push(`/orgs/${orgID}/load-data/sources`)
  }

  // TODO: Replace with analytics data or api flag if experiment is successful
  if (userHasData) {
    return (
      <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
        {children}
      </SpinnerContainer>
    )
  }

  return (
    <SpinnerContainer spinnerComponent={<TechnoSpinner />} loading={loading}>
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
          onClick={handleClickLoadData}
          testID="dataless-empty-state--load-data-button"
          color={ComponentColor.Primary}
          size={ComponentSize.Large}
        />
      </EmptyState>
    </SpinnerContainer>
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
