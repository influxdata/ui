// Libraries
import React, {FC, useContext} from 'react'
import {useSelector} from 'react-redux'

// Contexts
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import CreateBucketButton from 'src/buckets/components/CreateBucketButton'

// Utils
import {getAll} from 'src/resources/selectors'

// Components
import {
  List,
  ComponentSize,
  Heading,
  HeadingElement,
  Gradients,
  InfluxColors,
  EmptyState,
} from '@influxdata/clockface'

// Types
import {AppState, ResourceType, Bucket} from 'src/types'

const WriteDataHelperBuckets: FC = () => {
  const buckets = useSelector((state: AppState) =>
    getAll<Bucket>(state, ResourceType.Buckets).filter(b => b.type === 'user')
  )
  const {bucket, changeBucket} = useContext(WriteDataDetailsContext)

  let body = (
    <EmptyState className="write-data--details-empty-state">
      <span>
        You don't have any{' '}
        <a
          href="https://docs.influxdata.com/influxdb/cloud/organizations/buckets/"
          target="_blank"
          rel="noreferrer"
        >
          Buckets
        </a>
      </span>
    </EmptyState>
  )

  const isSelected = (bucketID: string): boolean => {
    if (!bucket) {
      return false
    }

    return bucketID === bucket.id
  }

  if (buckets.length) {
    body = (
      <List
        backgroundColor={InfluxColors.Obsidian}
        style={{height: '200px'}}
        maxHeight="200px"
      >
        {buckets.map(b => (
          <List.Item
            size={ComponentSize.Small}
            key={b.id}
            selected={isSelected(b.id)}
            value={b}
            onClick={changeBucket}
            wrapText={true}
            gradient={Gradients.GundamPilot}
          >
            {b.name}
          </List.Item>
        ))}
      </List>
    )
  }

  return (
    <>
      <Heading
        element={HeadingElement.H6}
        className="write-data--details-widget-title"
      >
        Bucket
        <CreateBucketButton />
      </Heading>
      {body}
    </>
  )
}

export default WriteDataHelperBuckets
