// Libraries
import React, {FC, useContext} from 'react'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {Icon, TreeNav} from '@influxdata/clockface'
import UserWidget from 'src/pageLayout/components/UserWidget'
import NavHeader from 'src/pageLayout/components/NavHeader'
import CloudUpgradeNavBanner from 'src/shared/components/CloudUpgradeNavBanner'
import CloudExclude from 'src/shared/components/cloud/CloudExclude'
import CloudOnly from 'src/shared/components/cloud/CloudOnly'
import OrgSettings from 'src/cloud/components/OrgSettings'
import {FeatureFlag} from 'src/shared/utils/featureFlag'

// Constants
import {generateNavItems} from 'src/pageLayout/constants/navigationHierarchy'

// Utils
import {getNavItemActivation} from 'src/pageLayout/utils'
import {getOrg} from 'src/organizations/selectors'
import {AppSettingContext} from 'src/shared/contexts/app'

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
        bannerElement={<CloudUpgradeNavBanner />}
      >
        {generateNavItems(org.id).map(item => {
          const linkElement = (className: string): JSX.Element => {
            if (item.link.type === 'href') {
              return <a href={item.link.location} className={className} />
            }

            return <Link to={item.link.location} className={className} />
          }
          let navItemElement = (
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
                  {item.menu.map(menuItem => {
                    const linkElement = (className: string): JSX.Element => {
                      if (menuItem.link.type === 'href') {
                        return (
                          <a
                            href={menuItem.link.location}
                            className={className}
                          />
                        )
                      }

                      return (
                        <Link
                          to={menuItem.link.location}
                          className={className}
                        />
                      )
                    }

                    let navSubItemElement = (
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

                    if (menuItem.cloudExclude) {
                      navSubItemElement = (
                        <CloudExclude key={menuItem.id}>
                          {navSubItemElement}
                        </CloudExclude>
                      )
                    }

                    if (menuItem.cloudOnly) {
                      navSubItemElement = (
                        <CloudOnly key={menuItem.id}>
                          {navSubItemElement}
                        </CloudOnly>
                      )
                    }

                    if (menuItem.featureFlag) {
                      navSubItemElement = (
                        <FeatureFlag
                          key={menuItem.id}
                          name={menuItem.featureFlag}
                          equals={menuItem.featureFlagValue}
                        >
                          {navSubItemElement}
                        </FeatureFlag>
                      )
                    }

                    return navSubItemElement
                  })}
                </TreeNav.SubMenu>
              )}
            </TreeNav.Item>
          )

          if (item.cloudExclude) {
            navItemElement = (
              <CloudExclude key={item.id}>{navItemElement}</CloudExclude>
            )
          }

          if (item.cloudOnly) {
            navItemElement = (
              <CloudOnly key={item.id}>{navItemElement}</CloudOnly>
            )
          }

          if (item.featureFlag) {
            navItemElement = (
              <FeatureFlag
                key={item.id}
                name={item.featureFlag}
                equals={item.featureFlagValue}
              >
                {navItemElement}
              </FeatureFlag>
            )
          }

          return navItemElement
        })}
      </TreeNav>
    </OrgSettings>
  )
}

export default TreeSidebar
