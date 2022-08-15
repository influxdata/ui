// Libraries
import React, {FC} from 'react'
import {useSelector} from 'react-redux'
import {Link} from 'react-router-dom'

// Components
import {Tabs, Orientation, ComponentSize} from '@influxdata/clockface'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {getOrg} from 'src/organizations/selectors'

interface Props {
  activeTab: string
}

interface OrgPageTab {
  text: string
  id: string
  enabled?: () => boolean
  link: string
}

enum Tab {
  Members = 'members-oss',
  Users = 'users',
  About = 'about',
  Usage = 'usage',
}

const OrgNavigation: FC<Props> = ({activeTab}) => {
  const orgID = useSelector(getOrg)?.id

  const tabs: OrgPageTab[] = [
    {
      text: 'Members',
      id: Tab.Members,
      enabled: () => !CLOUD,
      link: `/orgs/${orgID}/members`,
    },
    {
      text: 'Settings',
      id: Tab.About,
      enabled: () => CLOUD,
      link: `/orgs/${orgID}/about`,
    },
    {
      text: 'Members',
      id: Tab.Users,
      enabled: () => CLOUD,
      link: `/orgs/${orgID}/users`,
    },
    {
      text: 'About',
      id: Tab.About,
      enabled: () => !CLOUD,
      link: `/orgs/${orgID}/about`,
    },
    {
      text: 'Usage',
      id: Tab.Usage,
      enabled: () => CLOUD,
      link: `/orgs/${orgID}/usage`,
    },
  ]

  return (
    <Tabs orientation={Orientation.Horizontal} size={ComponentSize.Large}>
      {tabs
        .filter(t => {
          if (t?.enabled) {
            return t.enabled()
          }
          return true
        })
        .map(t => {
          let isActive = t.id === activeTab
          if (t.id === Tab.Members && activeTab === 'members') {
            isActive = true
          }

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

export default OrgNavigation
