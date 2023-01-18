// Libraries
import React, {useContext, FC} from 'react'

// Components
import PrecisionDropdown from 'src/buckets/components/lineProtocol/configure/PrecisionDropdown'
import TabSelector from 'src/buckets/components/lineProtocol/configure/TabSelector'
import TabBody from 'src/buckets/components/lineProtocol/configure/TabBody'
import {StatusIndicator} from 'src/buckets/components/lineProtocol/verify/StatusIndicator'
import {LineProtocolContext} from 'src/buckets/components/context/lineProtocol'

// Types
import {RemoteDataState} from 'src/types'

export const LineProtocolTabs: FC = () => {
  const {writeStatus} = useContext(LineProtocolContext)

  if (writeStatus !== RemoteDataState.NotStarted) {
    return <StatusIndicator />
  }

  return (
    <>
      <div className="line-protocol--header">
        <TabSelector />
        <PrecisionDropdown />
      </div>
      <TabBody />
    </>
  )
}
