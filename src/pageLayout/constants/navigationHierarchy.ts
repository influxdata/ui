import {IconFont} from '@influxdata/clockface'
import {PROJECT_NAME_PLURAL, PROJECT_NAME_SHORT} from 'src/flows'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {getStore} from 'src/store/configureStore'

// Constants
import {CLOUD} from 'src/shared/constants'

// Types
import {AppState} from 'src/types'

export interface NavSubItem {
  id: string
  testID: string
  label: string
  link: string
  enabled?: () => boolean
}

export interface NavItem {
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

export const generateNavItems = (): NavItem[] => {
  const state: AppState = getStore().getState()
  const orgID = state?.resources?.orgs?.org?.id ?? ''
  const quartzMe = state?.me?.quartzMe ?? null

  const orgPrefix = `/orgs/${orgID}`

  let navItems = [
    {
      id: 'load-data',
      testID: 'nav-item-load-data',
      icon: IconFont.DisksNav,
      label: 'Load Data',
      shortLabel: 'Data',
      link: `${orgPrefix}/load-data/sources`,
      activeKeywords: ['load-data'],
      menu: [
        {
          id: 'sources',
          testID: 'nav-subitem-sources',
          label: 'Sources',
          link: `${orgPrefix}/load-data/sources`,
        },
        {
          id: 'buckets',
          testID: 'nav-subitem-buckets',
          label: 'Buckets',
          link: `${orgPrefix}/load-data/buckets`,
        },
        {
          id: 'telegrafs',
          testID: 'nav-subitem-telegrafs',
          label: 'Telegraf',
          link: `${orgPrefix}/load-data/telegrafs`,
        },
        {
          id: 'scrapers',
          testID: 'nav-subitem-scrapers',
          label: 'Scrapers',
          link: `${orgPrefix}/load-data/scrapers`,
          enabled: () => !CLOUD,
        },
        {
          id: 'tokens',
          testID: 'nav-subitem-tokens',
          label: 'Tokens',
          link: `${orgPrefix}/load-data/tokens`,
        },
      ],
    },
    {
      id: 'data-explorer',
      testID: 'nav-item-data-explorer',
      icon: IconFont.GraphLine,
      label: 'Data Explorer',
      shortLabel: 'Explore',
      link: `${orgPrefix}/data-explorer`,
      activeKeywords: ['data-explorer'],
    },
    {
      id: 'flows',
      testID: 'nav-item-flows',
      icon: IconFont.BookPencil,
      label: PROJECT_NAME_PLURAL,
      shortLabel: PROJECT_NAME_SHORT,
      link: `${orgPrefix}/${PROJECT_NAME_PLURAL.toLowerCase()}`,
      activeKeywords: [PROJECT_NAME_PLURAL.toLowerCase()],
    },
    {
      id: 'dashboards',
      testID: 'nav-item-dashboards',
      icon: IconFont.Dashboards,
      label: 'Dashboards',
      shortLabel: 'Boards',
      link: `${orgPrefix}/dashboards-list`,
      activeKeywords: ['dashboards', 'dashboards-list'],
    },
    {
      id: 'tasks',
      testID: 'nav-item-tasks',
      icon: IconFont.Calendar,
      label: 'Tasks',
      link: `${orgPrefix}/tasks`,
      activeKeywords: ['tasks'],
    },
    {
      id: 'alerting',
      testID: 'nav-item-alerting',
      icon: IconFont.Bell,
      label: 'Alerts',
      link: `${orgPrefix}/alerting`,
      activeKeywords: ['alerting'],
      menu: [
        {
          id: 'history',
          testID: 'nav-subitem-history',
          label: 'Alert History',
          link: `${orgPrefix}/alert-history`,
        },
      ],
    },
    {
      id: 'settings',
      testID: 'nav-item-settings',
      icon: IconFont.WrenchNav,
      label: 'Settings',
      link: `${orgPrefix}/settings/variables`,
      activeKeywords: ['settings'],
      menu: [
        {
          id: 'variables',
          testID: 'nav-subitem-variables',
          label: 'Variables',
          link: `${orgPrefix}/settings/variables`,
        },
        {
          id: 'templates',
          testID: 'nav-subitem-templates',
          label: 'Templates',
          link: `${orgPrefix}/settings/templates`,
        },
        {
          id: 'labels',
          testID: 'nav-subitem-labels',
          label: 'Labels',
          link: `${orgPrefix}/settings/labels`,
        },
        {
          id: 'secrets',
          testID: 'nav-subitem-secrets',
          label: 'Secrets',
          link: `${orgPrefix}/settings/secrets`,
        },
      ],
    },
    {
      id: 'operator',
      enabled: () =>
        CLOUD &&
        quartzMe?.isOperator === true &&
        isFlagEnabled('uiUnificationFlag'),
      testID: 'nav-item--operator',
      icon: IconFont.Shield,
      label: 'Operator',
      shortLabel: 'Operator',
      link: `/operator`,
      activeKeywords: ['operator'],
    },
  ]

  navItems = navItems.filter(item => {
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

  return navItems
}
