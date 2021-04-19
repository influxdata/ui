// Libraries
import React, {FC, useContext} from 'react'

// Components
import {LineProtocolContext} from 'src/buckets/components/context/lineProtocol'
import EnterManuallyButtons from 'src/buckets/components/lineProtocol/EnterManuallyButtons'
import UploadFileButtons from 'src/buckets/components/lineProtocol/UploadFileButtons'

const LineProtocolButtons: FC = () => {
  const {tab} = useContext(LineProtocolContext)

  if (tab === 'Enter Manually') {
    return <EnterManuallyButtons />
  }

  if (tab === 'Upload File') {
    return <UploadFileButtons />
  }

  return null
}

export default LineProtocolButtons
