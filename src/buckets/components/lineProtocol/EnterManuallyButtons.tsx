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

// Context
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

const EnterManuallyButtons: FC = () => {
  const {
    body,
    handleResetLineProtocol,
    handleTryAgainLineProtocol,
    writeLineProtocol,
    writeStatus,
  } = useContext(LineProtocolContext)
  const {bucket: chosenUploadBucket} = useContext(WriteDataDetailsContext)

  const status = body ? ComponentStatus.Default : ComponentStatus.Disabled
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()

  const handleClose = () => {
    history.push(`/orgs/${orgID}/load-data/buckets`)
  }

  const selectedBucket =
    useSelector((state: AppState) =>
      getByID<Bucket>(state, ResourceType.Buckets, chosenUploadBucket?.id)
    )?.name ?? ''

  const handleSubmit = () => {
    writeLineProtocol(selectedBucket)
  }

  if (writeStatus === RemoteDataState.Error) {
    return (
      <>
        <Button
          color={ComponentColor.Default}
          text="Edit"
          size={ComponentSize.Medium}
          type={ButtonType.Button}
          onClick={handleTryAgainLineProtocol}
          testID="lp-edit--button"
        />
        <Button
          color={ComponentColor.Default}
          text="Clear"
          size={ComponentSize.Medium}
          type={ButtonType.Button}
          onClick={handleResetLineProtocol}
          testID="lp-cancel--button"
        />
      </>
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
