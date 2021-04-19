// Libraries
import React, {FC, useContext} from 'react'
import {SelectGroup, ButtonShape} from '@influxdata/clockface'

// Components
import Tab from 'src/buckets/components/lineProtocol/configure/Tab'
import {LineProtocolContext} from 'src/buckets/components/context/lineProtocol'

// Types
import {LineProtocolTab} from 'src/types'

const tabs: LineProtocolTab[] = ['Upload File', 'Enter Manually']

const TabSelector: FC = () => {
  const {handleSetTab, tab: activeTab} = useContext(LineProtocolContext)
  const handleTabClick = (tab: LineProtocolTab) => {
    if (tab !== activeTab) {
      handleSetTab(tab)
    }
  }

  return (
    <SelectGroup shape={ButtonShape.Default}>
      {tabs.map(tab => (
        <Tab
          tab={tab}
          key={tab}
          active={activeTab === tab}
          onClick={handleTabClick}
        />
      ))}
    </SelectGroup>
  )
}

export default TabSelector
