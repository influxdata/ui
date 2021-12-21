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
}

enum Tab {
  Billing = 'billing',
  About = 'about',
}

const AccountTabs: FC<Props> = ({activeTab}) => {
  const orgID = useSelector(getOrg)?.id

  console.log('inside tabs for accounts!', activeTab)

  const tabs: AccountPageTab[] = [
    {
      text: 'Billing',
      id: Tab.Billing,
      link: `/orgs/${orgID}/billing`,
    },
    {
      text: 'Settings',
      id: Tab.About,
      link: `/orgs/${orgID}/accounts/settings`,
    },
  ]

  return (
    <Tabs orientation={Orientation.Horizontal} size={ComponentSize.Large}>
      {tabs.map(t => {
        const isActive = t.id === activeTab

        return (
          <Tabs.Tab
            key={t.id}
            text={t.text}
            id={t.id}
            linkElement={className => (
              <Link to={t.link} className={className} />
            )}
            active={isActive}
          />
        )
      })}
    </Tabs>
  )
}

export default AccountTabs
