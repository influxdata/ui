// Libraries
import React, {FC, SetStateAction, useEffect} from 'react'
import memoizeOne from 'memoize-one'

// Components
import {NoOrgsState} from 'src/identity/components/OrganizationListTab/NoOrgsState'
import {OrganizationCard} from 'src/identity/components/OrganizationListTab/OrganizationCard'

// Constants
import {GLOBAL_HEADER_HEIGHT} from 'src/identity/components/GlobalHeader/constants'

// Utils
import {getSortedResources, SortTypes} from 'src/shared/utils/sort'

// Types
import {Sort} from '@influxdata/clockface'
import {OrganizationSummaries} from 'src/client/unityRoutes'

interface Props {
  currentPage: number
  filteredOrgs: OrganizationSummaries
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
  const tabsHeight = document.querySelector('cf-tabs')?.clientHeight ?? 40

  const quotaBannerHeight = isAtOrgLimit
    ? document.querySelector('.account-settings-page-org-tab--upgrade-banner')
        ?.clientHeight || 60
    : 0

  const searchWidgetHeight =
    document.querySelector(
      '.account-settings-page-org-tab--sort-dropdown-container'
    )?.clientHeight ?? 60

  const orgCardHeight =
    document.querySelector('.account--organizations-tab-orgs-card')
      ?.clientHeight ?? 105

  const paginationNavHeight =
    document.querySelector('.cf-pagination')?.clientHeight ?? 72

  const marginHeight = 60

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
  const firstOrgOnPage = totalOrgsPerPage * (currentPage - 1)
  const lastOrgOnPage = totalOrgsPerPage * currentPage

  useEffect(() => {
    const totalPages = Math.ceil(sortedOrgs.length / totalOrgsPerPage) || 1

    setTotalPages(totalPages)
  }, [sortedOrgs.length, setTotalPages, totalOrgsPerPage])

  const paginatedOrgs = sortedOrgs.slice(firstOrgOnPage, lastOrgOnPage)

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
        />
      ))}
    </>
  )
}
