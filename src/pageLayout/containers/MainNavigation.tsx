// Libraries
import React, {FC, useContext, useEffect, MouseEvent} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {Icon, IconFont, PopoverPosition, TreeNav} from '@influxdata/clockface'
import UserWidget from 'src/pageLayout/components/UserWidget'
import NavHeader from 'src/pageLayout/components/NavHeader'

// Constants
import {generateNavItems} from 'src/pageLayout/constants/navigationHierarchy'
import {CLOUD} from 'src/shared/constants'

// Utils
import {getNavItemActivation} from 'src/pageLayout/utils'
import {AppSettingContext} from 'src/shared/contexts/app'
import {event} from 'src/cloud/utils/reporting'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {
  selectCurrentAccountType,
  selectOperatorRole,
} from 'src/identity/selectors'

// Types
import {NavItem, NavSubItem} from 'src/pageLayout/constants/navigationHierarchy'

// Overlays
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Styles
import './MainNavigation.scss'

export const MainNavigation: FC = () => {
  const {presentationMode, navbarMode, setNavbarMode} =
    useContext(AppSettingContext)
  const org = useSelector(getOrg)
  const accountType = useSelector(selectCurrentAccountType)
  const operatorRole = useSelector(selectOperatorRole)

  const dispatch = useDispatch()

  const location = useLocation()
  useEffect(() => {
    const helpBarMenu = document.querySelectorAll<HTMLElement>(
      '.cf-tree-nav--sub-menu-trigger'
    )[3]
    if (!helpBarMenu) {
      return
    }
    if (navbarMode === 'expanded') {
      helpBarMenu.style.display = 'block'
      helpBarMenu.style.width = '243px'
    } else {
      helpBarMenu.style.width = '44px'
    }
  }, [navbarMode])

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

  const handleEventing = (link: string): void => {
    const currentPage = location.pathname
    event(`helpBar.${link}.opened`, {}, {from: currentPage})
  }

  const handleContactSupportClick = (
    evt: MouseEvent<HTMLAnchorElement>
  ): void => {
    evt.preventDefault()
    const isPayGCustomer = accountType !== 'free'

    if (isPayGCustomer) {
      dispatch(showOverlay('payg-support', null, dismissOverlay))
      event('helpBar.paygSupportRequest.overlay.shown')
    } else {
      dispatch(showOverlay('free-account-support', null, dismissOverlay))
    }
  }

  return (
    <TreeNav
      expanded={navbarMode === 'expanded'}
      headerElement={<NavHeader link={`/orgs/${org.id}`} />}
      userElement={CLOUD ? null : <UserWidget />}
      onToggleClick={handleToggleNavExpansion}
    >
      {generateNavItems(org.id, operatorRole).map((item: NavItem) => {
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
        id="support"
        testID="nav-item-support"
        icon={<Icon glyph={IconFont.QuestionMark_Outline} />}
        label="Help &amp; Support"
        shortLabel="Support"
        className="helpBarStyle"
      >
        <TreeNav.SubMenu position={PopoverPosition.ToTheRight}>
          <TreeNav.SubHeading label="Support" />
          <TreeNav.SubItem
            id="faqs"
            label="FAQs"
            testID="nav-subitem-faqs"
            linkElement={() => (
              <SafeBlankLink
                href="https://docs.influxdata.com/influxdb/cloud/reference/faq/"
                onClick={() => handleEventing('faq')}
              />
            )}
          />
          {CLOUD && (
            <TreeNav.SubItem
              id="status-page"
              label="Status Page"
              testID="nav-subitem-status"
              linkElement={() => (
                <SafeBlankLink
                  href="https://status.influxdata.com"
                  onClick={() => handleEventing('status-page')}
                />
              )}
            />
          )}
          <TreeNav.SubItem
            id="documentation"
            label="Documentation"
            testID="nav-subitem-documentation"
            linkElement={() => (
              <SafeBlankLink
                href="https://docs.influxdata.com/"
                onClick={() => handleEventing('documentation')}
              />
            )}
          />
          {CLOUD && (
            <TreeNav.SubItem
              id="contactSupport"
              label="Contact Support"
              testID="nav-subitem-contact-support"
              linkElement={() => (
                <a href="#" onClick={handleContactSupportClick}></a>
              )}
            />
          )}
          <TreeNav.SubHeading label="Community" />
          <TreeNav.SubItem
            id="offcialForum"
            label="Official Forum"
            testID="nav-subitem-forum"
            linkElement={() => (
              <SafeBlankLink
                href="https://community.influxdata.com"
                onClick={() => handleEventing('officialForum')}
              />
            )}
          />
          <TreeNav.SubItem
            id="influxdbSlack"
            label="InfluxDB Slack"
            testID="nav-subitem-influxdb-slack"
            linkElement={() => (
              <SafeBlankLink href="https://influxcommunity.slack.com/join/shared_invite/zt-156zm7ult-LcIW2T4TwLYeS8rZbCP1mw#/shared-invite/email" />
            )}
          />
          <TreeNav.SubItem
            id="influxUniversity"
            label="InfluxDB University"
            testID="nav-subitem-university"
            linkElement={() => (
              <SafeBlankLink
                href="https://university.influxdata.com/"
                onClick={() => handleEventing('influxdbUniversity')}
              />
            )}
          />
          {CLOUD && (
            <>
              <TreeNav.SubHeading label="Useful Links" />
              <TreeNav.SubItem
                id="request-poc"
                label="Request Proof of Concept"
                testID="nav-subitem-request-poc"
                linkElement={() => (
                  <SafeBlankLink
                    href="https://www.influxdata.com/proof-of-concept/"
                    onClick={() => handleEventing('requestPOC')}
                  />
                )}
              />
            </>
          )}
        </TreeNav.SubMenu>
      </TreeNav.Item>
    </TreeNav>
  )
}
