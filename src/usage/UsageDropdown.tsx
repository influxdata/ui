import React, {FC} from 'react'

import {SelectDropdown, ComponentColor} from '@influxdata/clockface'
import {GRAPH_INFO} from 'src/usage/Constants'
import {DUMMY_PRICING_VERSION_TO_DELETE} from 'src/usage/Constants'

type Props = {
  selectedUsage: string
  setSelectedUsage: (usage: string) => void
}

const UsageDropdown: FC<Props> = ({selectedUsage, setSelectedUsage}) => {
  const options = GRAPH_INFO.usageStats
    .filter(stat =>
      stat.pricingVersions.includes(DUMMY_PRICING_VERSION_TO_DELETE)
    )
    .map(stat => stat.title)

  return (
    <SelectDropdown
      selectedOption={selectedUsage}
      options={options}
      onSelect={setSelectedUsage}
      buttonColor={ComponentColor.Default}
      style={{width: '200px'}}
      testID="usage-page--dropdown"
    />
  )
}

export default UsageDropdown
