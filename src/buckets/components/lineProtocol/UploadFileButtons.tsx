// Libraries
import React, {FC, useContext} from 'react'
import {useHistory, useParams} from 'react-router'

// Components
import {
  Button,
  ButtonType,
  ComponentColor,
  ComponentSize,
} from '@influxdata/clockface'

// Types
import {RemoteDataState} from 'src/types'
import {LineProtocolContext} from 'src/buckets/components/context/lineProtocol'

const UploadFileButtons: FC = () => {
  const {handleResetLineProtocol, writeStatus} = useContext(LineProtocolContext)
  const history = useHistory()
  const {orgID} = useParams<{orgID: string}>()

  const handleClose = () => {
    history.push(`/orgs/${orgID}/load-data/buckets`)
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

  return null
}

export default UploadFileButtons
