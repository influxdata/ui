// Libraries
import React, {FC, useContext, useCallback} from 'react'

// Components
import {
  TechnoSpinner,
  ComponentSize,
  RemoteDataState,
  Dropdown,
  IconFont,
} from '@influxdata/clockface'

// Contexts
import {BucketContext} from 'src/flows/context/buckets'
import {PipeContext} from 'src/flows/context/pipe'

// Utils
import {event} from 'src/cloud/utils/reporting'

// Types
import {Bucket} from 'src/types'

const BucketSelector: FC = () => {
  const {data, update} = useContext(PipeContext)
  const {buckets, loading} = useContext(BucketContext)
  let buttonText = 'Loading buckets...'

  const updateBucket = useCallback(
    (updatedBucket: Bucket): void => {
      event('Updating Bucket Selection in Flow Query Builder', {
        bucket: updatedBucket.name,
      })

      update({bucket: updatedBucket})
    },
    [update]
  )

  let menuItems = (
    <Dropdown.ItemEmpty>
      <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
    </Dropdown.ItemEmpty>
  )

  if (loading === RemoteDataState.Done && buckets.length) {
    menuItems = (
      <>
        {buckets.map(bucket => (
          <Dropdown.Item
            key={bucket.name}
            value={bucket}
            onClick={updateBucket}
            selected={bucket.name === data.bucket?.name}
            title={bucket.name}
            wrapText={true}
          >
            {bucket.name}
          </Dropdown.Item>
        ))}
      </>
    )
  }

  if (loading === RemoteDataState.Done && !data.bucket) {
    buttonText = 'Choose a bucket'
  } else if (loading === RemoteDataState.Done && data.bucket) {
    buttonText = data.bucket.name
  }

  const button = (active, onClick) => (
    <Dropdown.Button onClick={onClick} active={active} icon={IconFont.Disks}>
      {buttonText}
    </Dropdown.Button>
  )

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
  )

  return <Dropdown button={button} menu={menu} style={{width: '250px'}} />
}

export default BucketSelector
