import React, {FC, useContext} from 'react'

import {SelectDropdown, ComponentColor} from '@influxdata/clockface'
import {UsageContext} from 'src/usage/context/usage'

const UsageDropdown: FC = () => {
  const {usageVectors, selectedUsage, handleSetSelectedUsage} =
    useContext(UsageContext)

  const vectorNames = usageVectors?.map(vector => vector.name)

  return (
    <SelectDropdown
      selectedOption={selectedUsage}
      options={vectorNames}
      onSelect={handleSetSelectedUsage}
      buttonColor={ComponentColor.Default}
      style={{width: '200px'}}
      testID="usage-page--dropdown"
    />
  )
}

export default UsageDropdown
