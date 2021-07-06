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

const OrgNavigation: FC<Props> = ({activeTab}) => {
  const orgID = useSelector(getOrg)?.id

  const tabs: OrgPageTab[] = [
    {
      text: 'Members',
      id: 'members-oss',
      enabled: () => !CLOUD,
      link: `/orgs/${orgID}/members`,
    },
    {
      text: 'Users',
      id: 'users',
      enabled: () => CLOUD,
      link: `/orgs/${orgID}/users`,
    },
    {
      text: 'About',
      id: 'about',
      link: `/orgs/${orgID}/about`,
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
          if (t.id === 'members-oss' && activeTab === 'members') {
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
