// Libraries
import React, {FC, useContext} from 'react'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Icon,
  IconFont,
  NavMenu,
  PopNav,
  PopNavItem,
  TreeNav,
} from '@influxdata/clockface'
import UserWidget from 'src/pageLayout/components/UserWidget'
import NavHeader from 'src/pageLayout/components/NavHeader'
import OrgSettings from 'src/cloud/components/OrgSettings'
import SupportList from 'src/pageLayout/components/Support'

// Constants
import {generateNavItems} from 'src/pageLayout/constants/navigationHierarchy'

// Utils
import {getNavItemActivation} from 'src/pageLayout/utils'
import {getOrg} from 'src/organizations/selectors'
import {AppSettingContext} from 'src/shared/contexts/app'
import {event} from 'src/cloud/utils/reporting'

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
    console.log('is expanded ', navbarMode)
    if (navbarMode === 'expanded') {
      setNavbarMode('collapsed')
    } else {
      setNavbarMode('expanded')
    }
  }

  const navStyle = {
    bottom: '0',
  }

  return (
    <OrgSettings>
      <>
        <TreeNav
          expanded={navbarMode === 'expanded'}
          headerElement={<NavHeader link={`/orgs/${org.id}`} />} // influxdb cloud sign
          userElement={<UserWidget />}
          onToggleClick={handleToggleNavExpansion}
          // bannerElement={<SupportList />}
        >
          {generateNavItems().map((item: NavItem) => {
            const linkElement = (className: string): JSX.Element => (
              <Link
                to={item.link}
                className={className}
                title={item.label}
                onClick={() => {
                  event('nav clicked', {which: item.id})
                }}
              />
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
                        <Link
                          to={menuItem.link}
                          className={className}
                          onClick={() => {
                            event('nav clicked', {
                              which: `${item.id} - ${menuItem.id}`,
                            })
                          }}
                        />
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

          <TreeNav.Item
            id={'support'}
            testID={'nav-item-support'}
            icon={<Icon glyph={IconFont.QuestionMark_New} />}
            label={'Help & Support'}
            shortLabel={'Support'}
            style={navStyle}
            // linkElement={linkElement}
            // onClick={() => setNavbarMode('collapsed')}
          >
            <TreeNav.SubMenu>
              <TreeNav.SubHeading label="Support" />
              <TreeNav.SubItem
                id="documentation"
                label="Documentation"
                testID="nav-subitem-documentation"
                linkElement={className => (
                  <Link className={className} to={``} />
                )}
              />
              <TreeNav.SubItem
                id="documentation"
                label="FAQs"
                testID="nav-subitem-faqs"
                linkElement={className => (
                  <Link className={className} to={``} />
                )}
              />
              <TreeNav.SubItem
                id="documentation"
                label="Contact Support"
                testID="nav-subitem-contact-support"
                linkElement={className => (
                  <Link className={className} to={``} />
                )}
              />
              <TreeNav.SubHeading label="Community" />
              <TreeNav.SubItem
                id="offcialForum"
                label="Official Forum"
                testID="nav-subitem-forum"
                linkElement={className => (
                  <Link className={className} to={``} />
                )}
              />
              <TreeNav.SubItem
                id="influxdbSlack"
                label="InfluxDB Slack"
                testID="nav-subitem-influxdb-slack"
                linkElement={className => (
                  <Link className={className} to={``} />
                )}
              />
              <TreeNav.SubHeading label="Feedback" />
              <TreeNav.SubItem
                id="feedback"
                label="Feedback & Questions"
                testID="nav-subitem-feedback-questions"
                linkElement={className => (
                  <Link className={className} to={``} />
                )}
              />
            </TreeNav.SubMenu>
          </TreeNav.Item>
        </TreeNav>
      </>
    </OrgSettings>
  )
}

export default TreeSidebar
