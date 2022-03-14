// Libraries
import React, {FC, useContext} from 'react'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {Icon, TreeNav} from '@influxdata/clockface'
import UserWidget from 'src/pageLayout/components/UserWidget'
import NavHeader from 'src/pageLayout/components/NavHeader'
import OrgSettings from 'src/cloud/components/OrgSettings'

// Constants
import {generateNavItems} from 'src/pageLayout/constants/navigationHierarchy'

// Utils
import {getNavItemActivation} from 'src/pageLayout/utils'
import {getOrg} from 'src/organizations/selectors'
import {AppSettingContext} from 'src/shared/contexts/app'

// Types
import {NavItem, NavSubItem} from 'src/pageLayout/constants/navigationHierarchy'

const TreeSidebar: FC = () => {
  const org = useSelector(getOrg)
  const {presentationMode, navbarMode, setNavbarMode} = useContext(
    AppSettingContext
  )

  if (presentationMode || !org) {
    return null
  }

  const handleToggleNavExpansion = (): void => {
    if (navbarMode === 'expanded') {
      setNavbarMode('collapsed')
    } else {
      setNavbarMode('expanded')
    }
  }

  return (
    <OrgSettings>
      <TreeNav
        expanded={navbarMode === 'expanded'}
        headerElement={<NavHeader link={`/orgs/${org.id}`} />}
        userElement={<UserWidget />}
        onToggleClick={handleToggleNavExpansion}
      >
        {generateNavItems().map((item: NavItem) => {
          const linkElement = (className: string): JSX.Element => (
            <Link to={item.link} className={className} title={item.label} />
          )
          return (
            <TreeNav.Item
              key={item.id}
              id={item.id}
              testID={item.testID}
              icon={<Icon glyph={item.icon} />}
              label={item.label}
              shortLabel={item.shortLabel}
              active={getNavItemActivation(
                item.activeKeywords,
                location.pathname
              )}
              linkElement={linkElement}
            >
              {Boolean(item.menu) && (
                <TreeNav.SubMenu>
                  {item.menu.map((menuItem: NavSubItem) => {
                    const linkElement = (className: string): JSX.Element => (
                      <Link to={menuItem.link} className={className} />
                    )

                    return (
                      <TreeNav.SubItem
                        key={menuItem.id}
                        id={menuItem.id}
                        testID={menuItem.testID}
                        active={getNavItemActivation(
                          [menuItem.id],
                          location.pathname
                        )}
                        label={menuItem.label}
                        linkElement={linkElement}
                      />
                    )
                  })}
                </TreeNav.SubMenu>
              )}
            </TreeNav.Item>
          )
        })}
      </TreeNav>
    </OrgSettings>
  )
}

export default TreeSidebar
