import React, {FC, useContext} from 'react'
import {Tabs, ComponentSize} from '@influxdata/clockface'
import {OperatorContext} from 'src/operator/context/operator'

const OperatorTabs: FC = () => {
  const {activeTab, setActiveTab} = useContext(OperatorContext)
  return (
    <Tabs size={ComponentSize.Large}>
      <Tabs.Tab
        id="accounts"
        text="Accounts"
        active={activeTab == 'accounts'}
        testID="accountTab"
        onClick={() => setActiveTab('accounts')}
      />
      <Tabs.Tab
        id="organizations"
        text="Organizations"
        active={activeTab == 'organizations'}
        testID="orgTab"
        onClick={() => setActiveTab('organizations')}
      />
    </Tabs>
  )
}

export default OperatorTabs
