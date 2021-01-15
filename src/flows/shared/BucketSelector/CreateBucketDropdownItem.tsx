// Libraries
import React, {FC, useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {Dropdown} from '@influxdata/clockface'

// Actions
import {checkBucketLimits, LimitStatus} from 'src/cloud/actions/limits'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Utils
import {getBucketLimitStatus} from 'src/cloud/utils/limits'

// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {Bucket} from 'src/types'

interface Props {
  onUpdateBucket: (bucket: Bucket) => void
  testID: string
}

const CreateBucketDropdownItem: FC<Props> = ({onUpdateBucket, testID}) => {
  const limitStatus = useSelector(getBucketLimitStatus)
  const dispatch = useDispatch()
  useEffect(() => {
    // Check bucket limits when component mounts
    dispatch(checkBucketLimits())
  }, [dispatch])

  const handleItemClick = (): void => {
    if (CLOUD && limitStatus === LimitStatus.EXCEEDED) {
      dispatch(showOverlay('asset-limit', {asset: 'Buckets'}, dismissOverlay))
    } else {
      dispatch(showOverlay('create-bucket', {onUpdateBucket}, dismissOverlay))
    }
  }

  return (
    <Dropdown.Item
      title="Click to create a bucket"
      onClick={handleItemClick}
      testID={testID}
    >
      + Create Bucket
    </Dropdown.Item>
  )
}

export default CreateBucketDropdownItem
