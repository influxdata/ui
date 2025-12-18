// Libraries
import React, {FC, useContext, useEffect} from 'react'
import {Link, useLocation} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

// Components
import {Icon, IconFont, PopoverPosition, TreeNav} from '@influxdata/clockface'
import UserWidget from 'src/pageLayout/components/UserWidget'
import NavHeader from 'src/pageLayout/components/NavHeader'
import {RequestPocWidget} from '../components/RequestPocWidget'

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
import {getOrg, isOrgIOx} from 'src/organizations/selectors'
import {
  selectCurrentAccountType,
  selectOperatorRole,
} from 'src/identity/selectors'
import {selectShouldShowNotebooks} from 'src/flows/selectors/flowsSelectors'
import {selectIsNewIOxOrg} from 'src/shared/selectors/app'

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
  isNewIOxOrg: boolean
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
      enabled: () => !isNewIOxOrg || isFlagEnabled('showDashboardsInNewIOx'),
    },
    {
      id: 'tasks',
      testID: 'nav-item-tasks',
      icon: IconFont.Calendar,
      label: 'Tasks',
      link: `/orgs/${orgID}/tasks`,
      activeKeywords: ['tasks'],
      enabled: () => !isNewIOxOrg || isFlagEnabled('showTasksInNewIOx'),
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
      enabled: () => !isNewIOxOrg || isFlagEnabled('showAlertsInNewIOx'),
    },
    {
      id: 'settings',
      testID: 'nav-item-settings',
      icon: IconFont.CogOutline_New,
      label: 'Settings',
      link: `/orgs/${orgID}/settings`,
      activeKeywords: ['settings'],
      menu: [
        {
          id: 'variables',
          testID: 'nav-subitem-variables',
          label: 'Variables',
          link: `/orgs/${orgID}/settings/variables`,
          enabled: () => !isNewIOxOrg || isFlagEnabled('showVariablesInNewIOx'),
        },
        {
          id: 'templates',
          testID: 'nav-subitem-templates',
          label: 'Templates',
          link: `/orgs/${orgID}/settings/templates`,
          enabled: () => !isNewIOxOrg || isFlagEnabled('showTemplatesInNewIOx'),
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
  const isNewIOxOrg = useSelector(selectIsNewIOxOrg)
  const isIOxOrg = useSelector(isOrgIOx)
  const showPocRequest =
    accountType === 'free' && isFlagEnabled('navbarPocRequest')

  const dispatch = useDispatch()

  const location = useLocation()
  useEffect(() => {
    const linksWithSubMenus = document.querySelectorAll<HTMLElement>(
      '.cf-tree-nav--sub-menu-trigger'
    )
    const lastSubMenu = linksWithSubMenus.length - 1

    const helpBarMenu = linksWithSubMenus[lastSubMenu]

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

  const docslink = isIOxOrg
    ? 'https://docs.influxdata.com/influxdb/cloud-serverless/'
    : 'https://docs.influxdata.com/'

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

  const handleContactSupportClick = (): void => {
    dispatch(showOverlay('contact-support', null, dismissOverlay))
    event('helpBar.contactSupportRequest.overlay.shown')
  }

  const contactSupportLinkElement = () => (
    <a onClick={handleContactSupportClick} />
  )

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
        isNewIOxOrg
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
      {showPocRequest && (
        <RequestPocWidget expanded={navbarMode === 'expanded'} />
      )}
      <TreeNav.Item
        id="support"
        testID="nav-item-support"
        icon={<Icon glyph={IconFont.QuestionMark_Outline} />}
        label="Help &amp; Support"
        shortLabel="Support"
        className="nav-item-support"
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
                href={docslink}
                onClick={() => handleEventing('documentation')}
              />
            )}
          />
          {CLOUD && (
            <TreeNav.SubItem
              id="contactSupport"
              label="Contact Support"
              testID="nav-subitem-contact-support"
              linkElement={contactSupportLinkElement}
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
              <SafeBlankLink href="https://www.influxdata.com/slack" />
            )}
          />
          {!isNewIOxOrg && (
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
          )}
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
