// Libraries
import React, {FC, useEffect} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'

// Components
import {Dropdown} from '@influxdata/clockface'

// Actions
import {checkBucketLimits, LimitStatus} from 'src/cloud/actions/limits'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Utils
import {extractBucketLimits} from 'src/cloud/utils/limits'

// Types
import {AppState} from 'src/types'

// Constants
import {CLOUD} from 'src/shared/constants'

interface OwnProps {
  onClick?: () => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

const CreateBucketDropdownItem: FC<Props> = ({
  limitStatus,
  onShowOverlay,
  onDismissOverlay,
  onClick,
}) => {
  const dispatch = useDispatch()
  useEffect(() => {
    // Check bucket limits when component mounts
    dispatch(checkBucketLimits())
  }, [dispatch])

  const handleItemClick = (): void => {
    if (CLOUD && limitStatus === LimitStatus.EXCEEDED) {
      onShowOverlay('asset-limit', {asset: 'Buckets'}, onDismissOverlay)
    } else {
      onShowOverlay('create-bucket', null, onDismissOverlay)
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

const mstp = (state: AppState) => {
  return {
    limitStatus: extractBucketLimits(state.cloud.limits),
  }
}

const mdtp = {
  onShowOverlay: showOverlay,
  onDismissOverlay: dismissOverlay,
}

const connector = connect(mstp, mdtp)

export default connector(CreateBucketDropdownItem)
