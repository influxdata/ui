import React, {FC, useContext} from 'react'
import {Tabs, ComponentSize} from '@influxdata/clockface'
import {Link} from 'react-router-dom'

// Components
import {OperatorContext} from './context/operator'

// Types
import {OperatorRoutes} from 'src/operator/constants'

const OperatorTabs: FC = () => {
  const {pathname} = useContext(OperatorContext)
  /*
    NOTE: this design pattern of directly linking to a specific page is a conscious
    product decision that was made so that the operator page could be bookmarked to a
    tab and accessed directly rather than having to navigate to the operator route and
    click the corresponding tab
  */

  return (
    <Tabs size={ComponentSize.Large}>
      <Tabs.Tab
        id="accounts"
        text="Accounts"
        active={
          pathname === OperatorRoutes.accounts ||
          pathname === OperatorRoutes.default
        }
        testID="accountTab"
        linkElement={className => (
          <Link className={className} to={OperatorRoutes.accounts} />
        )}
      />
      <Tabs.Tab
        id="organizations"
        text="Organizations"
        active={pathname === OperatorRoutes.organizations}
        testID="orgTab"
        linkElement={className => (
          <Link className={className} to={OperatorRoutes.organizations} />
        )}
      />
    </Tabs>
  )
}

export default OperatorTabs
