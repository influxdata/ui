// Libraries
import React, {FC, useContext, useCallback, useRef, useEffect} from 'react'

// Components
import {
  TechnoSpinner,
  ComponentSize,
  RemoteDataState,
  Dropdown,
  IconFont,
} from '@influxdata/clockface'
import CreateBucketDropdownItem from 'src/buckets/components/CreateBucketDropdownItem'

// Contexts
import {BucketContext} from 'src/flows/context/buckets'
import {PipeContext} from 'src/flows/context/pipe'

// Utils
import {event} from 'src/cloud/utils/reporting'
import {getNewestBucket} from 'src/flows/shared/utils'

// Types
import {Bucket} from 'src/types'

const BucketSelector: FC = () => {
  const {data, update} = useContext(PipeContext)
  const {buckets, loading} = useContext(BucketContext)
  const prevBuckets = useRef<Bucket[]>(buckets)
  const autoSelectNewBucket = useRef<boolean>(false)
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

  useEffect(() => {
    if (autoSelectNewBucket.current) {
      const newBucket = getNewestBucket(prevBuckets.current, buckets)

      if (newBucket) {
        updateBucket(newBucket)
        autoSelectNewBucket.current = false
      }
    }

    prevBuckets.current = buckets
  }, [buckets, updateBucket])

  const handleCreateNewBucket = (): void => {
    autoSelectNewBucket.current = true
  }

  let menuItems = (
    <Dropdown.ItemEmpty>
      <TechnoSpinner strokeWidth={ComponentSize.Small} diameterPixels={32} />
    </Dropdown.ItemEmpty>
  )

  if (loading === RemoteDataState.Done && buckets.length) {
    menuItems = (
      <>
        <CreateBucketDropdownItem onClick={handleCreateNewBucket} />
        <Dropdown.Divider />
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
    <Dropdown.Button
      onClick={onClick}
      active={active}
      icon={IconFont.BucketSolid}
    >
      {buttonText}
    </Dropdown.Button>
  )

  const menu = onCollapse => (
    <Dropdown.Menu onCollapse={onCollapse}>{menuItems}</Dropdown.Menu>
  )

  return (
    <Dropdown
      button={button}
      menu={menu}
      style={{width: '250px', flex: '0 0 250px'}}
    />
  )
}

export default BucketSelector
