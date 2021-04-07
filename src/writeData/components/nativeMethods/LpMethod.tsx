// Libraries
import React, {FC, useContext} from 'react'

// Components
import LineProtocolHelperText from 'src/buckets/components/lineProtocol/LineProtocolHelperText'
import {WriteDataDetailsContext} from 'src/writeData/components/WriteDataDetailsContext'

// Styles
import 'src/writeData/components/WriteDataDetailsView.scss'

const LpMethod: FC = () => {
  const {bucket} = useContext(WriteDataDetailsContext)

  return (
    <>
      <LineProtocolHelperText />
    </>
  )
}

export default LpMethod
