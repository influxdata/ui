// Libraries
import React, {FC, useContext, useEffect, MouseEvent} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {Icon, IconFont, PopoverPosition, TreeNav} from '@influxdata/clockface'
import UserWidget from 'src/pageLayout/components/UserWidget'
import NavHeader from 'src/pageLayout/components/NavHeader'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {getNavItemActivation} from 'src/pageLayout/utils'
import {AppSettingContext} from 'src/shared/contexts/app'
import {event} from 'src/cloud/utils/reporting'
import {SafeBlankLink} from 'src/utils/SafeBlankLink'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {isUserOperator} from 'src/operator/utils'

// Selectors
import {getOrg} from 'src/organizations/selectors'
import {
  selectCurrentAccountType,
  selectOperatorRole,
} from 'src/identity/selectors'
import {selectShouldShowNotebooks} from 'src/flows/selectors/flowsSelectors'
import {selectShouldShowResource} from 'src/shared/selectors/app'

// Types
import {IdentityUser} from 'src/client/unityRoutes'

// Overlays
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Styles
import './MainNavigation.scss'

interface NavItem {
  id: string
  testID: string
  label: string
  shortLabel?: string
  link: string
  icon: IconFont
  enabled?: () => boolean
  menu?: NavSubItem[]
  activeKeywords: string[]
}

interface NavSubItem {
  id: string
  testID: string
  label: string
  link: string
  enabled?: () => boolean
}

const generateNavItems = (
  orgID: string,
  operatorRole: IdentityUser['operatorRole'],
  shouldShowNotebooks: boolean,
  shouldShowResource: boolean
): NavItem[] => {
  const navItems: NavItem[] = [
    {
      id: 'load-data',
      testID: 'nav-item-load-data',
      icon: IconFont.Upload_New,
      label: 'Load Data',
      shortLabel: 'Data',
      link: `/orgs/${orgID}/load-data/sources`,
      activeKeywords: ['load-data'],
      menu: [
        {
          id: 'sources',
          testID: 'nav-subitem-sources',
          label: 'Sources',
          link: `/orgs/${orgID}/load-data/sources`,
        },
        {
          id: 'buckets',
          testID: 'nav-subitem-buckets',
          label: 'Buckets',
          link: `/orgs/${orgID}/load-data/buckets`,
        },
        {
          id: 'telegrafs',
          testID: 'nav-subitem-telegrafs',
          label: 'Telegraf',
          link: `/orgs/${orgID}/load-data/telegrafs`,
        },
        {
          id: 'scrapers',
          testID: 'nav-subitem-scrapers',
          label: 'Scrapers',
          link: `/orgs/${orgID}/load-data/scrapers`,
          enabled: () => !CLOUD,
        },
        {
          id: 'subscriptions',
          testID: 'nav-subitem-subscriptions',
          label: 'Native Subscriptions',
          link: `/orgs/${orgID}/load-data/subscriptions`,
          enabled: () => CLOUD && isFlagEnabled('subscriptionsUI'),
        },
        {
          id: 'tokens',
          testID: 'nav-subitem-tokens',
          label: 'API Tokens',
          link: `/orgs/${orgID}/load-data/tokens`,
        },
      ],
    },
    {
      id: 'data-explorer',
      testID: 'nav-item-data-explorer',
      icon: IconFont.GraphLine_New,
      label: 'Data Explorer',
      shortLabel: 'Explore',
      link: `/orgs/${orgID}/data-explorer`,
      activeKeywords: ['data-explorer'],
      enabled: () => !isFlagEnabled('leadWithFlows'),
    },
    {
      id: 'flows',
      testID: 'nav-item-flows',
      icon: IconFont.BookCode,
      label: 'Notebooks',
      shortLabel: 'Books',
      link: `/orgs/${orgID}/notebooks`,
      activeKeywords: ['notebooks', 'notebook/from'],
      enabled: () => shouldShowNotebooks,
    },
    {
      id: 'dashboards',
      testID: 'nav-item-dashboards',
      icon: IconFont.DashH,
      label: 'Dashboards',
      shortLabel: 'Boards',
      link: `/orgs/${orgID}/dashboards-list`,
      activeKeywords: ['dashboards', 'dashboards-list'],
      enabled: () => shouldShowDashboards,
    },
    {
      id: 'tasks',
      testID: 'nav-item-tasks',
      icon: IconFont.Calendar,
      label: 'Tasks',
      link: `/orgs/${orgID}/tasks`,
      activeKeywords: ['tasks'],
      enabled: () => shouldShowResource && !isFlagEnabled('hideTasks'),
    },
    {
      id: 'alerting',
      testID: 'nav-item-alerting',
      icon: IconFont.Bell,
      label: 'Alerts',
      link: `/orgs/${orgID}/alerting`,
      activeKeywords: ['alerting', 'alert-history'],
      menu: [
        {
          id: 'alerting',
          testID: 'nav-subitem-alerting',
          label: 'Alerts',
          link: `/orgs/${orgID}/alerting`,
        },
        {
          id: 'history',
          testID: 'nav-subitem-history',
          label: 'Alert History',
          link: `/orgs/${orgID}/alert-history`,
        },
      ],
      enabled: () => shouldShowResource && !isFlagEnabled('hideAlerts'),
    },
    {
      id: 'settings',
      testID: 'nav-item-settings',
      icon: IconFont.CogOutline_New,
      label: 'Settings',
      link: `/orgs/${orgID}/settings/variables`,
      activeKeywords: ['settings'],
      menu: [
        {
          id: 'variables',
          testID: 'nav-subitem-variables',
          label: 'Variables',
          link: `/orgs/${orgID}/settings/variables`,
        },
        {
          id: 'templates',
          testID: 'nav-subitem-templates',
          label: 'Templates',
          link: `/orgs/${orgID}/settings/templates`,
        },
        {
          id: 'labels',
          testID: 'nav-subitem-labels',
          label: 'Labels',
          link: `/orgs/${orgID}/settings/labels`,
        },
        {
          id: 'secrets',
          testID: 'nav-subitem-secrets',
          label: 'Secrets',
          link: `/orgs/${orgID}/settings/secrets`,
        },
      ],
    },
    {
      id: 'operator',
      enabled: () => CLOUD && isUserOperator(operatorRole),
      testID: 'nav-item--operator',
      icon: IconFont.Shield,
      label: 'Operator',
      shortLabel: 'Operator',
      link: `/operator`,
      activeKeywords: ['operator'],
    },
  ]

  return navItems.filter(item => {
    if (item?.menu) {
      item.menu = item.menu.filter(sub => {
        if (sub?.enabled) {
          return sub.enabled()
        }
        return true
      })
    }
    if (item?.enabled) {
      return item.enabled()
    }
    return true
  })
}

export const MainNavigation: FC = () => {
  const {presentationMode, navbarMode, setNavbarMode} =
    useContext(AppSettingContext)
  const org = useSelector(getOrg)
  const accountType = useSelector(selectCurrentAccountType)
  const operatorRole = useSelector(selectOperatorRole)
  const shouldShowNotebooks = useSelector(selectShouldShowNotebooks)
  const shouldShowResource = useSelector(selectShouldShowResource)
  const shouldShowDashboards = useSelector(selectShouldShowDashboards)

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
      {generateNavItems(
        org.id,
        operatorRole,
        shouldShowNotebooks,
        shouldShowResource
      ).map((item: NavItem) => {
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
