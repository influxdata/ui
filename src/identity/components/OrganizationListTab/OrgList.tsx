// Libraries
import React, {FC, SetStateAction, useEffect} from 'react'
import memoizeOne from 'memoize-one'

// Components
import {NoOrgsState} from 'src/identity/components/OrganizationListTab/NoOrgsState'
import {OrganizationCard} from 'src/identity/components/OrganizationListTab/OrganizationCard'

// Constants
import {GLOBAL_HEADER_HEIGHT} from 'src/identity/components/GlobalHeader/constants'
const DEFAULT_BANNER_HEIGHT = 60
const DEFAULT_ORG_CARD_HEIGHT = 72
const DEFAULT_PAGINATION_NAV_HEIGHT = 72
const DEFAULT_SEARCH_WIDGET_HEIGHT = 60
const DEFAULT_TABS_HEIGHT = 40
const DEFAULT_TOTAL_MARGIN_HEIGHT = 80

// Utils
import {getSortedResources, SortTypes} from 'src/shared/utils/sort'

// Types
import {Sort} from '@influxdata/clockface'
import {QuartzOrganization} from 'src/identity/apis/org'

interface Props {
  currentPage: number
  filteredOrgs: QuartzOrganization[]
  isAtOrgLimit: boolean
  pageHeight: number
  setTotalPages: (action: SetStateAction<number>) => void
  sortDirection: Sort
  sortKey: string
}

export const OrgList: FC<Props> = ({
  currentPage,
  filteredOrgs,
  isAtOrgLimit,
  pageHeight,
  setTotalPages,
  sortDirection,
  sortKey,
}) => {
  const memGetSortedResources =
    memoizeOne<typeof getSortedResources>(getSortedResources)

  const sortedOrgs = memGetSortedResources(
    filteredOrgs,
    sortKey,
    sortDirection,
    SortTypes.String
  )

  // Org List Pagination Calculations
  const tabsHeight =
    document.querySelector('cf-tabs')?.clientHeight ?? DEFAULT_TABS_HEIGHT

  const quotaBannerHeight = isAtOrgLimit
    ? document.querySelector('.account-settings-page-org-tab--upgrade-banner')
        ?.clientHeight || DEFAULT_BANNER_HEIGHT
    : 0

  const searchWidgetHeight =
    document.querySelector(
      '.account-settings-page-org-tab--sort-dropdown-container'
    )?.clientHeight ?? DEFAULT_SEARCH_WIDGET_HEIGHT

  const orgCardHeight =
    document.querySelector('.account--organizations-tab-orgs-card')
      ?.clientHeight ?? DEFAULT_ORG_CARD_HEIGHT

  const paginationNavHeight =
    document.querySelector('.cf-pagination')?.clientHeight ??
    DEFAULT_PAGINATION_NAV_HEIGHT

  const marginHeight = DEFAULT_TOTAL_MARGIN_HEIGHT

  const orgCardsContainerHeight =
    pageHeight -
    tabsHeight -
    GLOBAL_HEADER_HEIGHT -
    quotaBannerHeight -
    searchWidgetHeight -
    paginationNavHeight -
    marginHeight

  const totalOrgsPerPage = Math.max(
    Math.floor(orgCardsContainerHeight / orgCardHeight),
    1
  )
  const firstOrgOnPage = (currentPage - 1) * totalOrgsPerPage
  const lastOrgOnPage = totalOrgsPerPage * currentPage - 1

  useEffect(() => {
    const totalPages = Math.ceil(sortedOrgs.length / totalOrgsPerPage) || 1

    setTotalPages(totalPages)
  }, [sortedOrgs.length, setTotalPages, totalOrgsPerPage])

  const paginatedOrgs = sortedOrgs.slice(firstOrgOnPage, lastOrgOnPage + 1)

  if (paginatedOrgs.length === 0) {
    return <NoOrgsState />
  }

  return (
    <>
      {paginatedOrgs.map(org => (
        <OrganizationCard
          key={org.id}
          name={org.name}
          provider={org.provider}
          regionCode={org.regionCode}
          regionName={org.regionName}
          provisioningStatus={org.provisioningStatus}
        />
      ))}
    </>
  )
}
