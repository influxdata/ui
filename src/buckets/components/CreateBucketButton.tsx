// Libraries
import React, {FC, useEffect} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'

// Components
import {Button, IconFont, ComponentColor} from '@influxdata/clockface'
import AssetLimitButton from 'src/cloud/components/AssetLimitButton'

// Actions
import {checkBucketLimits} from 'src/cloud/actions/limits'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Utils
import {getBucketLimitStatus} from 'src/cloud/utils/limits'

// Types
import {AppState} from 'src/types'

// Constants
import {CLOUD} from 'src/shared/constants'

type ReduxProps = ConnectedProps<typeof connector>

type CreateButtonProps = {
  useSimplifiedBucketForm?: boolean
}

type Props = ReduxProps & CreateButtonProps

const CreateBucketButton: FC<Props> = ({
  limitStatus,
  onShowOverlay,
  onDismissOverlay,
  useSimplifiedBucketForm = false,
}) => {
  const dispatch = useDispatch()
  useEffect(() => {
    // Check bucket limits when component mounts
    dispatch(checkBucketLimits())
  }, [dispatch])

  const overlayParams = useSimplifiedBucketForm
    ? {useSimplifiedBucketForm: true}
    : null
  const handleItemClick = (): void => {
    onShowOverlay('create-bucket', overlayParams, onDismissOverlay)
  }

  if (CLOUD && limitStatus === 'exceeded') {
    return <AssetLimitButton resourceName="Bucket" />
  }

  return (
    <Button
      icon={IconFont.Plus_New}
      color={ComponentColor.Primary}
      text="Create Bucket"
      titleText="Click to create a bucket"
      onClick={handleItemClick}
      testID="Create Bucket"
    />
  )
}

const mstp = (state: AppState) => {
  return {
    limitStatus: getBucketLimitStatus(state),
  }
}

const mdtp = {
  onShowOverlay: showOverlay,
  onDismissOverlay: dismissOverlay,
}

const connector = connect(mstp, mdtp)

export default connector(CreateBucketButton)
