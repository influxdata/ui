import React, {FC} from 'react'
import {Tabs, ComponentSize} from '@influxdata/clockface'
import {Link} from 'react-router-dom'
import {OperatorRoutes} from 'src/operator/constants'

interface Props {
  activeTab?: string
}

const OperatorTabs: FC<Props> = ({activeTab = 'accounts'}) => {
  return (
    <Tabs size={ComponentSize.Large}>
      <Tabs.Tab
        id="accounts"
        text="Accounts"
        active={activeTab == 'accounts'}
        testID="accountTab"
        linkElement={className => (
          <Link className={className} to={OperatorRoutes.accounts} />
        )}
      />
      <Tabs.Tab
        id="organizations"
        text="Organizations"
        active={activeTab == 'organizations'}
        testID="orgTab"
        linkElement={className => (
          <Link className={className} to={OperatorRoutes.organizations} />
        )}
      />
    </Tabs>
  )
}

export default OperatorTabs
