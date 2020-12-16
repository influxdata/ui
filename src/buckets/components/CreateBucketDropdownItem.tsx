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

interface Props {
  onClick?: () => void
}

const CreateBucketDropdownItem: FC<Props> = ({onClick}) => {
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
      dispatch(showOverlay('create-bucket', null, dismissOverlay))
    }

    onClick && onClick()
  }

  return (
    <Dropdown.Item
      title="Click to create a bucket"
      onClick={handleItemClick}
      testID="Create Bucket"
    >
      Create Bucket
    </Dropdown.Item>
  )
}

export default CreateBucketDropdownItem
