// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

// Components
import {Tabs, Orientation, ComponentSize} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'

interface Props {
  activeTab: string
}

interface AccountPageTab {
  text: string
  id: string
  link: string
  testID: string
}

enum Tab {
  Billing = 'billing',
  About = 'about',
}

const AccountTabs: FC<Props> = ({activeTab}) => {
  const orgID = useSelector(getOrg)?.id

  const tabs: AccountPageTab[] = [
    {
      text: 'Settings',
      id: Tab.About,
      testID: 'accounts-setting-tab',
      link: `/orgs/${orgID}/accounts/settings`,
    },
    {
      text: 'Billing',
      id: Tab.Billing,
      testID: 'accounts-billing-tab',
      link: `/orgs/${orgID}/billing`,
    },
  ]

  return (
    <Tabs orientation={Orientation.Horizontal} size={ComponentSize.Large}>
      {tabs.map(tabInfo => {
        const isActive = tabInfo.id === activeTab

        return (
          <Tabs.Tab
            key={tabInfo.id}
            text={tabInfo.text}
            id={tabInfo.id}
            linkElement={className => (
              <Link to={tabInfo.link} className={className} />
            )}
            testID={tabInfo.testID}
            active={isActive}
          />
        )
      })}
    </Tabs>
  )
}

export default AccountTabs
