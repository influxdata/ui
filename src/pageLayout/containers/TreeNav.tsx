// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {Link} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {Icon, IconFont, TreeNav} from '@influxdata/clockface'
import UserWidget from 'src/pageLayout/components/UserWidget'
import NavHeader from 'src/pageLayout/components/NavHeader'
import OrgSettings from 'src/cloud/components/OrgSettings'

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

  useEffect(() => {
    const helpBarMenu = document.querySelectorAll<HTMLElement>(
      '.cf-tree-nav--sub-menu-trigger'
    )[3]
    if (navbarMode === 'collapsed') return

    helpBarMenu.style.display = 'block'
    helpBarMenu.style.width = '243px'
  }, [setNavbarMode, navbarMode])

  useEffect(() => {
    const helpBarMenu = document.querySelectorAll<HTMLElement>(
      '.cf-tree-nav--sub-menu-trigger'
    )[3]
    if (navbarMode === 'expanded') return
    helpBarMenu.style.width = '44px'
  }, [setNavbarMode, navbarMode])

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
        >
          <TreeNav.SubMenu>
            <TreeNav.SubHeading label="Support" />
            <TreeNav.SubItem
              id="documentation"
              label="Documentation"
              testID="nav-subitem-documentation"
              linkElement={className => <Link className={className} to={``} />}
            />
            <TreeNav.SubItem
              id="faqs"
              label="FAQs"
              testID="nav-subitem-faqs"
              linkElement={className => <Link className={className} to={``} />}
            />
            <TreeNav.SubItem
              id="contactSupport"
              label="Contact Support"
              testID="nav-subitem-contact-support"
              linkElement={className => <Link className={className} to={``} />}
            />
            <TreeNav.SubHeading label="Community" />
            <TreeNav.SubItem
              id="offcialForum"
              label="Official Forum"
              testID="nav-subitem-forum"
              linkElement={className => <Link className={className} to={``} />}
            />
            <TreeNav.SubItem
              id="influxdbSlack"
              label="InfluxDB Slack"
              testID="nav-subitem-influxdb-slack"
              linkElement={className => <Link className={className} to={``} />}
            />
            <TreeNav.SubHeading label="Feedback" />
            <TreeNav.SubItem
              id="feedback"
              label="Feedback & Questions"
              testID="nav-subitem-feedback-questions"
              linkElement={className => <Link className={className} to={``} />}
            />
          </TreeNav.SubMenu>
        </TreeNav.Item>
      </TreeNav>
    </OrgSettings>
  )
}

export default TreeSidebar
