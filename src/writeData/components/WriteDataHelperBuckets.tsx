// Libraries
import React, {FC, useContext} from 'react'

// Contexts
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'
import CreateBucketButton from 'src/buckets/components/CreateBucketButton'

// Constants
import {DOCS_URL_VERSION} from 'src/shared/constants/fluxFunctions'

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

interface Props {
  className?: string
  useSimplifiedBucketForm?: boolean
}

const WriteDataHelperBuckets: FC<Props> = ({
  className = 'write-data--details-widget-title',
  useSimplifiedBucketForm = false,
}) => {
  const {bucket, buckets, changeBucket} = useContext(WriteDataDetailsContext)
  const isSelected = (bucketID: string): boolean => {
    if (!bucket) {
      return false
    }
    return bucketID === bucket.id
  }

  const filteredBuckets = buckets
    .filter(b => b.type === 'user')
    // sort by selected and then by name
    .sort((a, b) => {
      if (isSelected(a.id)) {
        return -1
      }
      if (isSelected(b.id)) {
        return 1
      }
      return a.name.localeCompare(b.name)
    })

  let body = (
    <EmptyState className="write-data--details-empty-state">
      <span>
        You don't have any{' '}
        <a
          href={`https://docs.influxdata.com/influxdb/${DOCS_URL_VERSION}/organizations/buckets/`}
          target="_blank"
          rel="noreferrer"
        >
          Buckets
        </a>
      </span>
    </EmptyState>
  )

  if (filteredBuckets.length) {
    body = (
      <List
        backgroundColor={InfluxColors.Grey5}
        style={{height: '200px'}}
        maxHeight="200px"
        testID="buckets--list"
      >
        {filteredBuckets.map(b => (
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
      <Heading element={HeadingElement.H6} className={className}>
        Bucket
        <CreateBucketButton
          useSimplifiedBucketForm={useSimplifiedBucketForm}
          callbackAfterBucketCreation={changeBucket}
        />
      </Heading>
      {body}
    </>
  )
}

export default WriteDataHelperBuckets
