import React, {FC, useState} from 'react'

import {SelectDropdown, ComponentColor} from '@influxdata/clockface'
import {GRAPH_INFO} from 'src/usage/Constants'
import {DUMMY_PRICING_VERSION_TO_DELETE} from 'src/usage/utils'

const UsageDropdown: FC = () => {
  const [selectedUsage, setSelectedUsageID] = useState('Data In (MB)')

  const options = GRAPH_INFO.usageStats
    .filter(stat =>
      stat.pricingVersions.includes(DUMMY_PRICING_VERSION_TO_DELETE)
    )
    .map(stat => stat.title)

  return (
    <SelectDropdown
      selectedOption={selectedUsage}
      options={options}
      onSelect={setSelectedUsageID}
      buttonColor={ComponentColor.Default}
      style={{width: '200px'}}
      testID="usage-page--dropdown"
    />
  )
}

export default UsageDropdown
