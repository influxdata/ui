// Libraries
import React, {FC, useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
  FlexBox,
  FlexDirection,
  ResourceList,
  PaginationNav,
  Sort,
} from '@influxdata/clockface'

// Components
import {FilterListContainer} from 'src/shared/components/FilterList'
import {OrgBannerPanel} from 'src/identity/components/OrganizationListTab/OrgBannerPanel'
import {OrgList} from 'src/identity/components/OrganizationListTab/OrgList'
import {SearchWidget} from 'src/shared/components/search_widget/SearchWidget'

// API
import {fetchOrgCreationAllowance} from 'src/identity/apis/org'
import {getQuartzOrganizationsThunk} from 'src/identity/quartzOrganizations/actions/thunks'

// Selectors
import {
  selectCurrentAccountId,
  selectQuartzOrgsContents,
  selectQuartzOrgsStatus,
} from 'src/identity/selectors'

// Constants
import ResourceSortDropdown from 'src/shared/components/resource_sort_dropdown/ResourceSortDropdown'

// Notifications
import {fetchOrgAllowanceFailed} from 'src/cloud/notifications/account-settings-notifications'
import {notify} from 'src/shared/actions/notifications'

// Style
import './OrganizationListTab.scss'

// Types
import {BucketSortKey} from 'src/shared/components/resource_sort_dropdown/generateSortItems'
import {QuartzOrganization} from 'src/identity/apis/org'
import {RemoteDataState, ResourceType, SortTypes} from 'src/types'

const searchKeys = ['name']

const FilterOrgs = FilterListContainer<QuartzOrganization>()

export interface OrgAllowance {
  availableUpgrade: string
  isAtOrgLimit: boolean
  status?: RemoteDataState
}

interface Props {
  pageHeight: number
}

const defaultOrgAllowance: OrgAllowance = {
  availableUpgrade: 'none',
  isAtOrgLimit: false,
  status: RemoteDataState.NotStarted,
}

const defaultNameSort = {
  sortKey: 'name',
  sortDirection: Sort.Ascending,
  sortType: SortTypes.String,
}

export const OrganizationListTab: FC<Props> = ({pageHeight}) => {
  const dispatch = useDispatch()

  // Selectors
  const currentAccountId = useSelector(selectCurrentAccountId)
  const orgsInAccount = useSelector(selectQuartzOrgsContents)
  const orgsLoadedStatus = useSelector(selectQuartzOrgsStatus)

  // Component State
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortMethod, setSortMethod] = useState(defaultNameSort)
  const [totalPages, setTotalPages] = useState(1)
  const [orgAllowance, setOrgAllowance] = useState(defaultOrgAllowance)

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

  // Load the orgs in the current account, if not yet loaded.
  useEffect(() => {
    if (orgsLoadedStatus === RemoteDataState.NotStarted) {
      dispatch(getQuartzOrganizationsThunk(currentAccountId))
    }
  }, [currentAccountId, dispatch, orgsLoadedStatus])

  // Determine whether to display the 'Upgrade' banner.
  useEffect(() => {
    const checkOrgCreationAllowance = async () => {
      try {
        const {allowed, availableUpgrade} = await fetchOrgCreationAllowance()

        const newOrgAllowance = {
          availableUpgrade: availableUpgrade,
          isAtOrgLimit: !allowed,
          status: RemoteDataState.Done,
        }

        setOrgAllowance(newOrgAllowance)
      } catch (err) {
        setOrgAllowance({...defaultOrgAllowance, status: RemoteDataState.Error})

        dispatch(notify(fetchOrgAllowanceFailed()))
      }
    }

    if (orgAllowance.status === RemoteDataState.NotStarted) {
      checkOrgCreationAllowance()
    }
  }, [dispatch, orgAllowance.status])

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
      {orgAllowance.isAtOrgLimit && (
        <OrgBannerPanel
          isAtOrgLimit={orgAllowance.isAtOrgLimit}
          availableUpgrade={orgAllowance.availableUpgrade}
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
              isAtOrgLimit={orgAllowance.isAtOrgLimit}
              filteredOrgs={filteredOrgs}
              pageHeight={pageHeight}
              setTotalPages={memoizedSetTotalPages}
              sortDirection={sortMethod.sortDirection}
              sortKey={sortMethod.sortKey}
            />
          )}
        </FilterOrgs>
      </ResourceList>
      <PaginationNav.PaginationNav
        currentPage={currentPage}
        onChange={handleChangePage}
        pageRangeOffset={1}
        totalPages={totalPages}
      />
    </>
  )
}
