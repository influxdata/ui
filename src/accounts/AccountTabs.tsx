// Libraries
import React, {FC} from 'react'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {ComponentSize, Orientation, Tabs} from '@influxdata/clockface'

// Utils
import {getOrg} from 'src/organizations/selectors'

// Constants
import {CLOUD} from 'src/shared/constants'

interface Props {
  activeTab: string
}

interface AccountPageTab {
  id: string
  enabled: boolean
  link: string
  testID: string
  text: string
}

const AccountTabs: FC<Props> = ({activeTab}) => {
  const orgID = useSelector(getOrg)?.id

  const tabs: AccountPageTab[] = [
    {
      id: 'settings',
      link: `/orgs/${orgID}/accounts/settings`,
      enabled: true,
      testID: 'accounts-setting-tab',
      text: 'Settings',
    },
    {
      id: 'organizations',
      enabled: CLOUD,
      link: `/orgs/${orgID}/accounts/orglist`,
      testID: 'accounts-orglist-tab',
      text: 'Organizations',
    },
    {
      id: 'billing',
      enabled: true,
      link: `/orgs/${orgID}/billing`,
      testID: 'accounts-billing-tab',
      text: 'Billing',
    },
  ]

  return (
    <Tabs orientation={Orientation.Horizontal} size={ComponentSize.Large}>
      {tabs
        .filter(tab => tab.enabled)
        .map(tab => {
          const isActive = tab.id === activeTab

          return (
            <Tabs.Tab
              key={tab.id}
              text={tab.text}
              id={tab.id}
              linkElement={className => (
                <Link to={tab.link} className={className} />
              )}
              testID={tab.testID}
              active={isActive}
            />
          )
        })}
    </Tabs>
  )
}

export default AccountTabs
