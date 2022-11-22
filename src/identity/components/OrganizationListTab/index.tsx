// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  FlexBox,
  FlexDirection,
  PaginationNav,
  ResourceList,
  Sort,
} from '@influxdata/clockface'

// Components
import {FilterListContainer} from 'src/shared/components/FilterList'
import {OrgBannerPanel} from 'src/identity/components/OrganizationListTab/OrgBannerPanel'
import {OrgList} from 'src/identity/components/OrganizationListTab/OrgList'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'

// Thunks
import {getQuartzOrganizationsThunk} from 'src/identity/quartzOrganizations/actions/thunks'

// Selectors
import {
  selectCurrentAccountId,
  selectOrgCreationAllowance,
  selectOrgCreationAllowanceStatus,
  selectOrgCreationAvailableUpgrade,
  selectQuartzOrgsContents,
  selectQuartzOrgsStatus,
} from 'src/identity/selectors'

// Constants
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'

// Style
import './OrganizationListTab.scss'

// Thunks
import {getOrgCreationAllowancesThunk} from 'src/identity/allowances/actions/thunks'

// Types
import {BucketSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'
import {QuartzOrganization} from 'src/identity/apis/org'
import {RemoteDataState, ResourceType, SortTypes} from 'src/types'

const searchKeys = ['name', 'provider', 'regionCode', 'regionName']

const FilterOrgs = FilterListContainer<QuartzOrganization>()
interface Props {
  pageHeight: number
}

const defaultNameSort = {
  sortKey: 'name',
  sortDirection: Sort.Ascending,
  sortType: SortTypes.String,
}

export const OrganizationListTab: FC<Props> = ({pageHeight}) => {
  const dispatch = useDispatch()

  // Selectors
  const availableUpgrade = useSelector(selectOrgCreationAvailableUpgrade)
  const currentAccountId = useSelector(selectCurrentAccountId)
  const isAtOrgLimit = !useSelector(selectOrgCreationAllowance)
  const orgsInAccount = useSelector(selectQuartzOrgsContents)
  const orgsLoadedStatus = useSelector(selectQuartzOrgsStatus)
  const orgCreationAllowanceStatus = useSelector(
    selectOrgCreationAllowanceStatus
  )

  // Component State
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMethod, setSortMethod] = useState(defaultNameSort)
  const [totalPages, setTotalPages] = useState(1)

  const memoizedSetTotalPages = useCallback(page => {
    setTotalPages(page)
  }, [])

  // Event Handlers
  const handleChangePage = (page: number) => {
    const validatedPage = Math.min(page, totalPages)
    setCurrentPage(validatedPage)
    const url = new URL(location.href)
    url.searchParams.set('page', validatedPage.toString())
    history.replaceState(null, '', url.toString())
  }

  const handleFilterOrgs = (searchTerm: string) => {
    const url = new URL(location.href)
    url.searchParams.set('searchTerm', searchTerm)
    history.replaceState(null, '', url.toString())
    setSearchTerm(searchTerm)
    handleChangePage(1)
  }

  const handleSortOrgs = (
    newSortKey: BucketSortKey,
    newSortDirection: Sort
  ) => {
    const url = new URL(location.href)
    url.searchParams.set('sortKey', newSortKey)
    url.searchParams.set('sortDirection', newSortDirection)
    history.replaceState(null, '', url.toString())

    setSortMethod({
      sortKey: newSortKey,
      sortDirection: newSortDirection,
      sortType: SortTypes.String,
    })
    handleChangePage(1)
  }

  useEffect(() => {
    if (orgsLoadedStatus === RemoteDataState.NotStarted) {
      dispatch(getQuartzOrganizationsThunk(currentAccountId))
    }
  }, [currentAccountId, dispatch, orgsLoadedStatus])

  useEffect(() => {
    if (orgCreationAllowanceStatus === RemoteDataState.NotStarted) {
      dispatch(getOrgCreationAllowancesThunk())
    }
  }, [dispatch, orgCreationAllowanceStatus])

  // Load search, sort, and pagination settings from URL search params.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlSearchTerm = params.get('searchTerm')
    const urlSortDirection = params.get('sortDirection') as Sort
    const urlSortKey = params.get('sortKey')

    const validSortDirections = [Sort.Ascending, Sort.Descending, Sort.None]

    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm)
    }

    if (
      urlSortDirection &&
      urlSortKey &&
      validSortDirections.includes(urlSortDirection)
    ) {
      setSortMethod({
        sortKey: urlSortKey,
        sortDirection: urlSortDirection,
        sortType: SortTypes.String,
      })
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlPageNumber = parseInt(params.get('page'), 10)

    if (typeof urlPageNumber === 'number' && urlPageNumber > 0) {
      setCurrentPage(Math.min(urlPageNumber, totalPages))
    }
  }, [totalPages])

  return (
    <>
      <FlexBox direction={FlexDirection.Row}>
        <FlexBox.Child className="account-settings-page-org-tab--searchwidget-container">
          <SearchWidget
            placeholderText="Search organizations"
            onSearch={handleFilterOrgs}
            searchTerm={searchTerm}
          ></SearchWidget>
        </FlexBox.Child>
        <FlexBox.Child className="account-settings-page-org-tab--sort-dropdown-container">
          <ResourceSortDropdown
            resourceType={ResourceType.Orgs}
            sortDirection={sortMethod.sortDirection}
            sortKey={sortMethod.sortKey}
            sortType={SortTypes.String}
            onSelect={handleSortOrgs}
          />
        </FlexBox.Child>
      </FlexBox>
      {isAtOrgLimit && (
        <OrgBannerPanel
          isAtOrgLimit={isAtOrgLimit}
          availableUpgrade={availableUpgrade}
        />
      )}
      <ResourceList>
        <FilterOrgs
          searchTerm={searchTerm}
          searchKeys={searchKeys}
          list={orgsInAccount}
        >
          {filteredOrgs => (
            <OrgList
              currentPage={currentPage}
              isAtOrgLimit={isAtOrgLimit}
              filteredOrgs={filteredOrgs}
              pageHeight={pageHeight}
              setTotalPages={memoizedSetTotalPages}
              sortDirection={sortMethod.sortDirection}
              sortKey={sortMethod.sortKey}
            />
          )}
        </FilterOrgs>
      </ResourceList>
      {totalPages > 1 && (
        <PaginationNav.PaginationNav
          currentPage={currentPage}
          onChange={handleChangePage}
          pageRangeOffset={1}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
