// Libraries
import React, {FC, useContext} from 'react'
import {useHistory, useParams} from 'react-router'
import {useSelector} from 'react-redux'

// Components
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
} from '@influxdata/clockface'
import {LineProtocolContext} from 'src/buckets/components/context/lineProtocol'

// Utils
import {getByID} from 'src/resources/selectors'

// Types
import {AppState, Bucket, ResourceType, RemoteDataState} from 'src/types'

const EnterManuallyButtons: FC = () => {
  const {
    body,
    handleResetLineProtocol,
    writeLineProtocol,
    writeStatus,
  } = useContext(LineProtocolContext)
  const status = body ? ComponentStatus.Default : ComponentStatus.Disabled
  const history = useHistory()
  const {orgID, bucketID} = useParams<{orgID: string; bucketID: string}>()

  const handleClose = () => {
    history.push(`/orgs/${orgID}/load-data/buckets`)
  }

  const selectedBucket =
    useSelector((state: AppState) =>
      getByID<Bucket>(state, ResourceType.Buckets, bucketID)
    )?.name ?? ''

  const handleSubmit = () => {
    writeLineProtocol(selectedBucket)
  }

  if (writeStatus === RemoteDataState.Error) {
    return (
      <Button
        color={ComponentColor.Default}
        text="Cancel"
        size={ComponentSize.Medium}
        type={ButtonType.Button}
        onClick={handleResetLineProtocol}
        testID="lp-cancel--button"
      />
    )
  }

  if (writeStatus === RemoteDataState.Done) {
    return (
      <Button
        color={ComponentColor.Default}
        text="Close"
        size={ComponentSize.Medium}
        type={ButtonType.Button}
        onClick={handleClose}
        testID="lp-close--button"
      />
    )
  }

  return (
    <Button
      color={ComponentColor.Primary}
      text="Write Data"
      size={ComponentSize.Medium}
      type={ButtonType.Button}
      status={status}
      testID="lp-write-data--button"
      onClick={handleSubmit}
    />
  )
}

export default EnterManuallyButtons
